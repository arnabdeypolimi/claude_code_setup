# ARTalk Architecture: Theory ↔ Code

## Table of Contents
1. [Problem & Motivation](#1-problem--motivation)
2. [Full Pipeline Overview](#2-full-pipeline-overview)
3. [Audio Encoding](#3-audio-encoding)
4. [Style Encoder](#4-style-encoder)
5. [Speech-to-Motion Autoregressive Model](#5-speech-to-motion-autoregressive-model)
6. [Two-Level Autoregression](#6-two-level-autoregression)
7. [Adaptive Layer Normalization (AdaLN)](#7-adaptive-layer-normalization-adaln)
8. [Pipeline Orchestration](#8-pipeline-orchestration)
9. [Streaming & Chunk-Based Processing](#9-streaming--chunk-based-processing)
10. [Training & Loss Functions](#10-training--loss-functions)
11. [Evaluation & Results](#11-evaluation--results)

---

## 1. Problem & Motivation

**Core challenge:** Existing diffusion-based talking-head methods produce natural animations but are too slow for real-time use. Classical autoregressive approaches are fast but generate over-smoothed, unrealistic motion lacking fine-grained expression detail.

**ARTalk's answer:** A two-stage pipeline:
1. A **Temporal Multi-Scale VQ Autoencoder** (BITWISE_VAE) compresses motion into discrete hierarchical codes.
2. A **Conditional Autoregressive Transformer** (BitwiseARModel) generates these codes from speech + style, window by window.

This achieves 0.01s inference per second of output on an A100 — real-time capable.

---

## 2. Full Pipeline Overview

```
Audio (16kHz mono)
        │
        ▼
 ┌─────────────────┐      ┌──────────────────┐
 │  AudioEncoder   │      │  StyleEncoder    │
 │  Wav2Vec2/Mimi  │      │  4-layer Transf. │
 │  → (B,T,1024)  │      │  → (B, 128)      │
 └────────┬────────┘      └────────┬─────────┘
          │                        │
          └───────────┬────────────┘
                      ▼
           ┌─────────────────────┐
           │   BitwiseARModel    │  ← ar_model.py
           │   12-layer Transf.  │
           │   AdaLN per block   │
           │   → motion codes    │
           └──────────┬──────────┘
                      ▼
           ┌─────────────────────┐
           │    BITWISE_VAE      │  ← vae/bitwise_vae.py
           │    MultiScaleBSQ    │
           │    Decode codes     │
           │    → MotionParams   │  (B, T, 106)
           └──────────┬──────────┘
                      ▼
           ┌─────────────────────┐
           │    FLAME Model      │  ← face3d/flame/
           │   expression(100)   │
           │   + pose(6)         │
           │   → vertices(5023)  │
           └──────────┬──────────┘
                      ▼
           ┌─────────────────────┐
           │     Renderer        │  ← renderer/
           │  Mesh (PyTorch3D)   │
           │  or GAGAvatar (3DGS)│
           │  → RGB frames       │
           └─────────────────────┘
```

**Code entry point:** `pipeline/engine.py` → `ARTalkEngine` orchestrates this entire flow via `infer()` + `render()`.

---

## 3. Audio Encoding

**Paper:** Speech features are extracted from a pre-trained audio encoder, frozen during AR model training. The encoder produces a time-series of feature vectors aligned to the motion frame rate.

**Two implementations in code:**

| Encoder | Dim | Use case | Code |
|---------|-----|----------|------|
| Wav2Vec2 | 1024 | Long sequences, main model | `motion/audio_encoders/wav2vec.py` |
| Mimi | 512 | Short sequences (≤8 frames) | `motion/audio_encoders/mimi.py` |

Both implement the `AudioEncoder` Protocol in `motion/interfaces.py`:
```python
def forward(audio: Tensor) -> Tensor  # (B, T, D)
```

**Why frozen?** The paper trains the AR model to use pre-computed audio representations — this avoids overfitting the audio encoder to the limited motion dataset and leverages powerful pre-trained speech representations.

---

## 4. Style Encoder

**Paper:** A transformer-based style encoder extracts a compact style embedding `s` from a 50-frame reference motion clip. This embedding conditions every layer of the AR model, enabling the system to adapt to unseen speaking styles without retraining.

**Code:** `motion/style_encoder.py` → `StyleEncoder`

```
Input: style motion (50, 106)  ← 2 seconds of reference motion
  ↓ Linear projection
  ↓ Positional encoding
  ↓ 4-layer Transformer
  ↓ Mean pooling
Output: (128,)  ← compact style embedding
```

**Why 50 frames?** This is `CONTEXT_FRAMES = 50` — 2 seconds at 25fps. Enough to capture a speaker's characteristic head motion rhythm and expressiveness without being too long.

**15 pre-built styles:** `data/assets/style_motion/` contains pre-computed style tensors (`natural_0.pt`, `happy_0.pt`, etc.) that users can choose from in the Gradio UI without providing a custom reference clip.

---

## 5. Speech-to-Motion Autoregressive Model

**Paper architecture:**
- 768 hidden dimensions, 12 layers, 12 attention heads
- Conditions on audio features via Adaptive Layer Normalization (AdaLN) at every block
- Conditions on style via AdaLN
- Autoregresses over motion codes scale-by-scale and window-by-window

**Code:** `motion/ar_model.py` → `BitwiseARModel`

```python
# Core block structure (AdaLNSelfAttn in transformer.py)
class AdaLNSelfAttn(nn.Module):
    # Inputs: x (tokens), cond (audio+style fused)
    # 1. AdaLN: scale/shift x using cond
    # 2. Self-attention
    # 3. AdaLN: scale/shift again
    # 4. MLP (feedforward)
```

**Key difference from standard transformers:** The audio conditioning is applied at every layer through AdaLN — not just at the input. This gives the model fine-grained control to modulate every representational level based on speech content.

**Probability model (from paper):**
```
p({z_T^(l)}_{l=1}^L | z_{T-1}^(L), a_T, s)
  = ∏_{l=1}^L p(z_T^(l) | z_T^(<l), z_{T-1}^(L), a_T, s)
```
Where:
- `z_T^(l)` = motion codes at window T, scale l
- `z_{T-1}^(L)` = finest-scale codes from the previous window (temporal context)
- `a_T` = audio features for window T
- `s` = style embedding

---

## 6. Two-Level Autoregression

**Paper:** ARTalk uses two nested levels of autoregression:

**Level 1 — Scale-by-scale within a window:**
Generate codes from coarsest scale (l=1, 1 token) to finest (l=5, 100 tokens).
Each scale conditions on all previously generated coarser scales.

```
Scale 1: [z^(1)] — 1 token, global motion for the window
Scale 2: [z^(2)] — 5 tokens, coarse temporal structure
Scale 3: [z^(3)] — 25 tokens, medium detail
Scale 4: [z^(4)] — 50 tokens, fine detail
Scale 5: [z^(5)] — 100 tokens, per-frame detail
```

**Level 2 — Window-by-window temporally:**
The finest-scale codes `z_{T-1}^(L)` from the previous window are prepended as context before generating window T. This creates temporal continuity across the 4-second chunk boundary.

**Why this matters for real-time streaming:** Window-by-window generation means the model can produce output incrementally — `StreamingSession` in `pipeline/streaming_session.py` exploits this by processing one window per audio chunk.

---

## 7. Adaptive Layer Normalization (AdaLN)

**Paper:** AdaIN (Adaptive Instance Normalization) is used to inject the conditioning signal (audio + style) into each transformer block.

**Mechanism:**
```
AdaLN(x, cond) = γ(cond) ⊙ LayerNorm(x) + β(cond)
```
Where `γ` and `β` are learned linear projections of the conditioning vector `cond`.

**Code:** `motion/transformer.py` → `AdaLNSelfAttn`

The conditioning `cond` is formed by concatenating or adding the audio feature for the current window and the style embedding. This is computed once per window and broadcast to all layers.

**Why AdaLN instead of cross-attention?** More parameter-efficient. Cross-attention would require attending to the full audio sequence at every block, whereas AdaLN compresses the condition to a single vector of scale/shift parameters per layer.

---

## 8. Pipeline Orchestration

**Code:** `pipeline/engine.py` → `ARTalkEngine`

The engine provides the high-level API:

```python
engine = ARTalkEngine.from_pretrained(checkpoint_path)
engine.set_style("natural_0")       # loads 50-frame style reference
motion = engine.infer(audio_waveform)   # audio → MotionParams
video = engine.render(motion, avatar_id)  # MotionParams → RGB video
```

**`infer()` internal steps:**
1. Audio → `AudioEncoder` → features `(B, T, 1024)`
2. Style motion → `StyleEncoder` → embedding `(B, 128)`
3. Features + embedding → `BitwiseARModel` → motion codes
4. Codes → `BITWISE_VAE.decode()` → raw `MotionParams` `(B, T, 106)`
5. Savitzky-Golay smoothing on expression (window=5) and pose (window=9)
6. Denormalize using `ALLTALKEMICA_MEAN` / `ALLTALKEMICA_STD`

**`render()` internal steps:**
1. `MotionParams` → `MotionToVerticesConverter` (FLAME) → vertices `(B, T, 5023, 3)`
2. Vertices → `Renderer.render()` → RGB frames `(B, H, W, 3)`
3. Frames + original audio → FFmpeg → `.mp4`

---

## 9. Streaming & Chunk-Based Processing

**Paper:** The 100-frame window design enables streaming — generate and render one 4-second chunk at a time, maintaining temporal continuity via the 50-frame context overlap.

**Code:** `pipeline/streaming_session.py` → `StreamingSession`

```
Audio stream
    │
    ▼
StreamingAudioBuffer  ← accumulates audio until 100 frames ready
    │
    ▼
BitwiseARModel        ← generates one window of motion codes
    │
    ▼
BITWISE_VAE.decode()  ← converts codes → MotionParams
    │
    ▼
StreamingRenderer     ← converts MotionParams → frames, yields them
```

**Responsive mode** (`max_iterations_per_chunk=1`): Limits to one inference iteration per audio input call, preventing the pipeline from blocking. This is the mode used in the WebSocket server (`app_streaming.py`).

---

## 10. Training & Loss Functions

**Stage 1 — Train BITWISE_VAE** (50k iterations, batch=64, lr=1e-4):

Reconstruction loss (motion space + vertex space, lip-weighted):
```
L_recon = ||M̂ - M||₁ + w_lips ||V̂_lips - V_lips||₂ + ||V̂ - V||₂
```

Temporal smoothness:
```
L_vel    = ||(V̂_{1:} - V̂_{:-1}) - (V_{1:} - V_{:-1})||₂
L_smooth = ||V̂_{2:} - 2V̂_{1:-1} + V̂_{:-2}||₂
```

Combined: `L_VQ = L_recon + λ_vel·L_vel + λ_smooth·L_smooth + L_cb`

**Stage 2 — Train AR model** (50k iterations, same schedule):

Cross-entropy on ground-truth codes:
```
L_AR = -∑_T ∑_{l=1}^L log p(z_T^(l)(gt) | z_T^(<l)(gt), z_{T-1}^(L)(gt), a_T, s)
```

**Hardware:** Single A100 GPU, ~13 GPU hours total.

---

## 11. Evaluation & Results

**Metrics:**
- **LVE (Lip Vertex Error):** Max L₂ error of lip vertices per frame (lower = better lip sync)
- **FDD (Upper Face Dynamic Deviation):** Std of upper-face motion (expressiveness)
- **MOD (Mouth Opening Distance):** Avg difference in mouth opening regions

**TFHP dataset results:**
| Method | LVE ↓ | FDD ↓ | MOD ↓ |
|--------|-------|-------|-------|
| ARTalk | **9.34** | **18.15** | **1.81** |
| DiffPoseTalk | 10.39 | 20.15 | 2.07 |

**User study (28 participants, 2,688 comparisons):**
- 88.1% preference over FaceDiffuser for lip sync
- Superior ratings on naturalness, style consistency, head pose realism

**Speed:** 0.01s per 1s of output on A100 — 100× faster than diffusion baselines.
