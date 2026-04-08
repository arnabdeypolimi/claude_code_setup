# ARTalk Original Repository Reference

**Source:** https://github.com/xg-chu/ARTalk
**License:** MIT
**Paper version code status:** "Training code and the paper version code are still in preparation" (per README)

## Table of Contents
1. [Repo Structure vs Local Codebase](#1-repo-structure-vs-local-codebase)
2. [config.json — Authoritative Architecture Config](#2-configjson--authoritative-architecture-config)
3. [BitwiseARModel — Implementation Details](#3-bitwisearmodel--implementation-details)
4. [BITWISE_VAE — Implementation Details](#4-bitwise_vae--implementation-details)
5. [BSQ Hyperparameters (Now Confirmed)](#5-bsq-hyperparameters-now-confirmed)
6. [StyleEncoder — Full Spec](#6-styleencoder--full-spec)
7. [Audio Encoders — Full Spec](#7-audio-encoders--full-spec)
8. [FLAME Model — Full Spec](#8-flame-model--full-spec)
9. [Motion Vector Exact Breakdown](#9-motion-vector-exact-breakdown)
10. [Normalization Constants](#10-normalization-constants)
11. [Video Output Spec](#11-video-output-spec)
12. [Environment & Dependencies](#12-environment--dependencies)
13. [Model Weights & Download](#13-model-weights--download)
14. [Style Motion Files](#14-style-motion-files)
15. [Key Differences: Paper vs Released Code](#15-key-differences-paper-vs-released-code)
16. [Possible Larger Model Hint](#16-possible-larger-model-hint)

---

## 1. Repo Structure vs Local Codebase

The original GitHub repo has a flatter structure than the local codebase:

| Original repo | Local codebase (`src/artalk/`) |
|---------------|-------------------------------|
| `app/models.py` → `BitwiseARModel` | `motion/ar_model.py` |
| `app/transformer.py` → `AdaLNSelfAttn` | `motion/transformer.py` |
| `app/modules/bitwise_vae.py` | `motion/vae/bitwise_vae.py` |
| `app/modules/style_encoder.py` | `motion/style_encoder.py` |
| `app/modules/wav2vec.py` | `motion/audio_encoders/wav2vec.py` |
| `app/modules/mimi.py` | `motion/audio_encoders/mimi.py` |
| `app/modules/data_stats.py` | `motion/data_stats.py` |
| `app/flame_model/FLAME.py` | `face3d/flame/flame_model.py` |
| `app/flame_model/lbs.py` | `face3d/flame/lbs.py` |
| `app/GAGAvatar/` | `renderer/gaussian/` |
| `inference.py` | `pipeline/engine.py` |

The local codebase is a restructured/extended version of the original, adding streaming pipeline, tracking, FastAPI server, and OpenTelemetry telemetry.

---

## 2. config.json — Authoritative Architecture Config

```json
{
    "AR_CONFIG": {
        "T_DEPTH": 12,
        "T_NUM_HEADS": 12,
        "PREV_RATIO": 1
    },
    "VAE_CONFIG": {
        "MOTION_DIM": 106,
        "V_CODE_DIM": 32,
        "T_DEPTH": 8,
        "T_NUM_HEADS": 8,
        "T_HIDDEN_DIM": 512,
        "V_PATCH_NUMS": [1, 5, 25, 50, 100]
    }
}
```

This is the ground truth for all architecture dimensions. The paper description (Section 6.2) matches `T_HIDDEN_DIM=512`, `T_DEPTH=8` for VAE and `T_DEPTH=12` for AR model.

---

## 3. BitwiseARModel — Implementation Details

**From `app/models.py`:**

| Parameter | Value | Source |
|-----------|-------|--------|
| `embed_dim` | 768 | hardcoded |
| `attn_depth` | 12 | `AR_CONFIG.T_DEPTH` |
| `num_heads` | 12 | `AR_CONFIG.T_NUM_HEADS` |
| `prev_ratio` | 1 | `AR_CONFIG.PREV_RATIO` |
| `drop_path` | linear 0 → 0.1 × depth/24 | per block (max ≈ 0.05 for depth=12) |
| `patch_nums` | [1, 5, 25, 50, 100] | from VAE config |
| `prev_context_len` | 181 tokens | `sum(patch_nums) × prev_ratio` |
| VQ input projection | `Linear(32, 768)` | `code_dim → embed_dim` |
| Logits head | `Linear(768, 64)` | `embed_dim → code_dim × 2` (BSQ binary classification) |
| Audio dim (wav2vec) | 1024 | projected to 768 via AdaLN conditioning |
| Style dim | 128 | projected to 768 |

**Position embeddings:** Learned absolute positional embeddings + per-scale level embeddings.

**Inference loop:**
1. Encode audio → features per scale
2. Prepend previous chunk's 181 quantized tokens as context
3. For each scale l = 1 → 5 (coarse to fine):
   - Feed context + current coarser codes
   - Predict 32-bit BSQ code for each position at scale l
4. Decode all scales → MotionParams (106-dim)
5. Apply Savitzky-Golay smoothing
6. Zero out dims 104–105: `pred_motions[..., 104:] *= 0.0`

---

## 4. BITWISE_VAE — Implementation Details

**From `app/modules/bitwise_vae.py`:**

| Parameter | Value |
|-----------|-------|
| `motion_dim` | 106 |
| `code_dim` | 32 (BSQ bits) |
| `patch_nums` | [1, 5, 25, 50, 100] |
| `sum(patch_nums)` | 181 total code positions |
| Encoder input | `[prev_motion, this_motion]` concatenated → 200 frames |
| Encoder | `TransformerEncoder(inp=106, hidden=512, code=32, depth=8, heads=8)` |
| Decoder | `TransformerDecoder(code=32, hidden=512, out=106, depth=8, heads=8)` |
| Quantizer | `MultiScaleBSQ` |
| Attention mask | Prev tokens see each other; current tokens see prev + current |

**Encoder processes two consecutive windows (200 frames) simultaneously.** This is the "temporal causal reasoning" mechanism — the encoder sees both T-1 and T windows together with a causal mask, allowing it to learn cross-window dependencies.

**MultiScaleBSQ residual process:**
```python
residual = encoder_output  # (B, 100, 32)
for scale in [1, 5, 25, 50, 100]:
    downsampled = interpolate(residual, size=scale)    # reduce temporal resolution
    quantized, bit_idx = bsq(downsampled)             # 32-bit quantize
    upsampled = interpolate(quantized, size=100)       # restore resolution
    residual = residual - upsampled                    # compute residual
    all_codes.append(bit_idx)                          # collect codes

# all_codes shape: (B, 181, 32)  [1+5+25+50+100=181 positions × 32 bits]
```

---

## 5. BSQ Hyperparameters (Now Confirmed)

**From `app/modules/bitwise_vae.py` → `BSQ` class:**

| Hyperparameter | Value |
|----------------|-------|
| `codebook_dim` | 32 bits |
| `inv_temperature` | 100.0 |
| `commit_loss_weight` | 0.2 |
| `entropy_loss_weight` | 0.1 |

**Quantization:**
```python
# Forward pass
z_normalized = z / ||z||₂         # L2 normalize
z_quantized = sign(z) × (1/√32)   # hard quantize each bit
bit_indices = (z > 0).int()        # binary representation, shape (B, T, 32)
```

**Entropy loss:** Encourages uniform codebook usage — prevents mode collapse where only a subset of 2^32 codes are used.

**Commitment loss:** `weight=0.2` × `||z − sg(q)||²` — standard VQ commitment.

---

## 6. StyleEncoder — Full Spec

**From `app/modules/style_encoder.py`:**

| Parameter | Value |
|-----------|-------|
| Input | style motion (B, 50, 106) |
| Motion projection | `Linear(106, 128)` |
| Transformer `d_model` | 128 |
| Transformer `nhead` | 4 |
| Transformer `dim_feedforward` | 512 |
| Transformer `num_layers` | 4 |
| Positional encoding | **Sinusoidal** (max_len=600) |
| Output | Mean-pooled → (B, 128) |
| Normalization | ALLTALKEMICA_MEAN/STD applied before encoding |

**Style clip length:** Exactly 50 frames — enforced by `assert style_motion.shape == (B, 50, 106)` in inference code.

---

## 7. Audio Encoders — Full Spec

### Wav2Vec2 (primary, used in released checkpoint)

| Parameter | Value |
|-----------|-------|
| HuggingFace model | `facebook/wav2vec2-xls-r-300m` |
| Output dim | 1024 |
| Frozen | Yes (during AR training) |
| Input normalization | Per-sample: `(x − mean(x)) / (std(x) + 1e-6)` |
| Sampling rate | 16,000 Hz mono |

### Mimi (streaming alternative)

| Parameter | Value |
|-----------|-------|
| HuggingFace model | `kyutai/mimi` |
| Output dim | 512 |
| Input resampling | 16kHz → 24kHz before encoding |
| Frozen | Yes (`requires_grad=False`) |

### HuBERT (in repo, referenced in paper, not in released checkpoint)

| Parameter | Value |
|-----------|-------|
| HuggingFace model | Standard HuBERT |
| Note | Listed in paper as primary audio encoder; the released checkpoint uses Wav2Vec2. The checkpoint filename `ARTalk_wav2vec.pt` confirms Wav2Vec2 variant was released. |

**Note on paper vs code:** The paper refers to "HuBERT" as the primary encoder. The released model uses `facebook/wav2vec2-xls-r-300m` (Wav2Vec2). Both are self-supervised speech models; the code has both implemented. The local codebase uses `Wav2Vec2Encoder` by default.

---

## 8. FLAME Model — Full Spec

**From `app/flame_model/FLAME.py`:**

| Parameter | Value |
|-----------|-------|
| Shape params `n_shape` | 300 |
| Expression params `n_exp` | 100 |
| Pose params | 6-dim (3 global + 3 jaw) |
| Neck pose | Fixed to zero |
| Eye pose | Fixed to zero |
| Scale (mesh rendering) | `scale=1.0` |
| Scale (GAGAvatar) | `scale=5.0` |
| Landmark mode | `no_lmks=True` during inference (skips computation) |
| Landmark types | `lmks70` (default) or `dense105` (MediaPipe) |
| Weights file | `FLAME_with_eye.pt` (from `xg-chu/GAGAvatar` on HuggingFace) |

**FLAME dimensions confirm:** Shape=300, Expression=100 — the code uses the full FLAME configuration, not the 50-dim expression described in the paper's data annotation section.

---

## 9. Motion Vector Exact Breakdown

From the code, the 106-dim motion vector is:

| Dims | Field | Description |
|------|-------|-------------|
| [0:100] | FLAME expression ψ | 100 expression blendshape coefficients |
| [100:103] | Global head rotation | 3-dim axis-angle (pitch, yaw, roll) |
| [103:104] | Jaw open | 1-dim jaw opening |
| [104:106] | **Zeroed at inference** | `pred_motions[..., 104:] *= 0.0` — unused dims |

**Important:** Dims 104–105 are explicitly zeroed during inference. These likely correspond to lateral jaw motion or eye-related pose params that were not reliably generated by the model.

**MotionParams dataclass mapping (local codebase):**
```
expression    → dims [0:100]   (EXPRESSION_DIM = 100)
head_rotation → dims [100:103] (HEAD_ROTATION_DIM = 3)
jaw           → dims [103:106] (JAW_DIM = 3)  ← includes the 2 zeroed dims
```

---

## 10. Normalization Constants

**From `app/modules/data_stats.py`:**

| Constant | Shape | Used in |
|----------|-------|---------|
| `ALLTALKEMICA_MEAN` | (106,) | `BITWISE_VAE`, `StyleEncoder`, `ARTalkEngine.infer()` |
| `ALLTALKEMICA_STD` | (106,) | same |
| `TFHP_MEAN` | (54,) | **Unused** in released code — legacy (50 expression + 4 pose?) |
| `TFHP_STD` | (54,) | **Unused** in released code |

`ALLTALKEMICA` = "AllTalk + EMICA" — statistics computed from the full dataset annotated with EMICA face tracker. This is distinct from the TFHP dataset statistics (which used 54-dim motion, an older configuration).

The presence of 54-dim TFHP stats (50 expression + 4 pose) vs 106-dim ALLTALKEMICA stats confirms the motion representation evolved during development: the paper's "D=56" description reflects an intermediate stage.

---

## 11. Video Output Spec

**From `app/utils_videos.py`:**

| Parameter | Value |
|-----------|-------|
| Library | PyAV (`av`) |
| Video codec | H264 |
| CRF | 18 (highest quality preset) |
| Audio codec | AAC or MP3 (muxed) |
| FPS | 25 |
| Audio sample rate | 16,000 Hz |

---

## 12. Environment & Dependencies

**From `environment.yml`:**

| Package | Version |
|---------|---------|
| Python | 3.12.2 |
| PyTorch | 2.4.1 |
| CUDA | 12.1 |
| cuDNN | 9.1.0 |
| PyTorch3D | 0.7.8 |
| torchaudio | 2.4.1 |
| numpy | 1.26.4 |
| faiss-gpu | 1.8.0 (for approximate nearest neighbour search) |
| ffmpeg | 4.3 |
| onnx | 1.16.2 |
| onnx2torch | 1.5.15 |
| transformers | 4.45.1 |
| gradio | 5.22.0 |
| einops | 0.8.1 |
| scipy | 1.14.1 |
| lightning | 2.4.0 |
| omegaconf | 2.3.0 |
| safetensors | 0.4.5 |

**Docker:** `nvidia/cuda:12.1.1-cudnn8-devel-ubuntu20.04`, `TORCH_CUDA_ARCH_LIST="8.9"` (Ada Lovelace GPUs — A100/H100/RTX4090).

---

## 13. Model Weights & Download

All hosted on HuggingFace:

| File | HuggingFace path | Size (approx) |
|------|-----------------|--------------|
| Main AR model | `xg-chu/ARTalk/ARTalk_wav2vec.pt` | ~1.9 GB |
| Model config | `xg-chu/ARTalk/config.json` | <1 KB |
| FLAME mesh model | `xg-chu/GAGAvatar/assets/FLAME_with_eye.pt` | ~50 MB |
| GAGAvatar renderer | `xg-chu/GAGAvatar/assets/GAGAvatar.pt` | ~500 MB |
| Tracked avatars | `xg-chu/ARTalk/GAGAvatar/tracked.pt` | ~100 MB |
| Style motions | `xg-chu/ARTalk/style_motion/*.pt` | ~1 MB each |

**FLAME registration:** FLAME weights require agreement with the FLAME license at https://flame.is.tue.mpg.de

---

## 14. Style Motion Files

**14 pre-built styles** (not 15 as previously noted):

| Style | Count |
|-------|-------|
| `angry_0` | 1 |
| `curious_0` | 1 |
| `doubtful_0`, `doubtful_1` | 2 |
| `happy_0`, `happy_1`, `happy_2` | 3 |
| `natural_0` … `natural_7` | 8 |

Each is a `(50, 106)` tensor — 50 frames of reference motion. Natural style has the most variants (8) to give users subtle variation within a neutral speaking style.

---

## 15. Key Differences: Paper vs Released Code

| Aspect | Paper describes | Released code implements |
|--------|----------------|--------------------------|
| Audio encoder | HuBERT | `facebook/wav2vec2-xls-r-300m` (Wav2Vec2) |
| Codebook | Standard VQ, 256 entries, 64-dim | BSQ, 32-bit, 2^32 implicit entries |
| Motion dim (paper claim) | D=56 (50 expression + 6 pose) | D=106 (100 expression + 3 rot + 3 jaw) |
| VQ codec | As described in paper | "VQVAE is modified from the paper version" (per README) |
| Dims 104-105 | Not mentioned | Zeroed at inference (`pred_motions[..., 104:] *= 0.0`) |
| Training code | Described | Not released ("still in preparation") |
| Style files | "15 pre-computed styles" (earlier documentation) | 14 files in `build_resources.sh` |

---

## 16. Possible Larger Model Hint

The test block at the bottom of `app/transformer.py` instantiates:
```python
# Test code in transformer.py
model = AdaLNSelfAttn(embed_dim=1024, depth=16, num_heads=16, ...)
```

While the released checkpoint uses `embed_dim=768, depth=12, heads=12`, this test code suggests the authors may have trained a larger variant (`embed_dim=1024, depth=16, heads=16`) — possibly the "paper version" that will be released separately. The 768/12/12 model is the publicly available checkpoint; the paper may report results from the larger model.

---

## 17. AdaLNSelfAttn — Confirmed Implementation Details

**From `app/transformer.py` (modified from VAR: https://github.com/FoundationVision/VAR):**

```
AdaLNSelfAttn:
  - Ada-LN: audio features produce 6 parameters per token (scale_1, bias_1, scale_2, bias_2, scale_gate_1, scale_gate_2)
  - Attention: Q attends to [prev_tokens, current_tokens] for K and V
  - L2 normalization on Q and K (attn_l2_norm=True)
  - Learnable log-scale per head: init=log(4), max=log(100)
  - Drop path: linear schedule 0 → 0.1 × depth/24 per block
```

**ModifiedSelfAttention causal pattern:**
- Query tokens = current scale tokens only
- Key/Value tokens = [prev_chunk_codes, current_coarser_codes]
- This creates asymmetric attention: current tokens can attend to all prior context but not each other (fully parallel within a scale)
