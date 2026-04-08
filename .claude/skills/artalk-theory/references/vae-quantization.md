# ARTalk VAE & Quantization: Theory ↔ Code

## Table of Contents
1. [Why Discretize Motion?](#1-why-discretize-motion)
2. [Temporal Multi-Scale VQ Autoencoder Overview](#2-temporal-multi-scale-vq-autoencoder-overview)
3. [BITWISE_VAE Architecture](#3-bitwise_vae-architecture)
4. [Multi-Scale Patch Levels](#4-multi-scale-patch-levels)
5. [Binary Spherical Quantization (BSQ)](#5-binary-spherical-quantization-bsq)
6. [MultiScaleBSQ](#6-multiscalebsq)
7. [Encoder & Decoder](#7-encoder--decoder)
8. [Why These Design Choices?](#8-why-these-design-choices)
9. [Data Normalization](#9-data-normalization)

---

## 1. Why Discretize Motion?

**Core insight from the paper:** Continuous motion generation with autoregressive models is difficult — the output space is unbounded and gradients from next-step prediction don't directly penalize temporal incoherence.

By mapping motion to **discrete codebook indices**, the AR model becomes a next-token prediction problem (like language modeling), which:
- Has well-understood training dynamics (cross-entropy loss)
- Naturally produces diverse outputs through sampling
- Enables hierarchical coarse-to-fine generation via multi-scale codes
- Decouples motion compression (VAE, Stage 1) from motion generation (AR model, Stage 2)

---

## 2. Temporal Multi-Scale VQ Autoencoder Overview

**Paper description:** "A temporal multi-scale VQ autoencoder that encodes motion sequences into multi-scale token representations."

**Code:** `motion/vae/bitwise_vae.py` → `BITWISE_VAE`

The VAE operates on 100-frame motion windows (`CHUNK_FRAMES = 100`) and produces a pyramid of codes:

```
Input: motion (100, 106)
         │
         ▼ Encoder (8-layer Transformer)
     latent (100, D)
         │
         ▼ MultiScaleBSQ
         │
         ├── Scale 1:  1 code   (1 token  → represents full 100 frames)
         ├── Scale 2:  5 codes  (1 token  per 20 frames)
         ├── Scale 3: 25 codes  (1 token  per  4 frames)
         ├── Scale 4: 50 codes  (1 token  per  2 frames)
         └── Scale 5:100 codes  (1 token  per  1 frame)
         │
         ▼ Decoder (8-layer Transformer)
Output: reconstructed motion (100, 106)
```

---

## 3. BITWISE_VAE Architecture

**Code:** `motion/vae/bitwise_vae.py` → `BITWISE_VAE`

**Encoder:** 8-layer Transformer
- Input: motion sequence `(T, 106)` → linear project to hidden dim
- Positional encoding
- 8 transformer blocks (8 heads, 512 hidden dims per paper)
- Output: latent sequence `(T, D)`

**Decoder:** 8-layer Transformer (symmetric)
- Input: quantized latent `(T, D)` reconstructed from multi-scale codes
- 8 transformer blocks
- Linear project to `(T, 106)` motion space
- Output: reconstructed `MotionParams`

**VAE config** (from `data/assets/config/config.json`):
```json
{
  "MOTION_DIM": 106,
  "V_CODE_DIM": 32,
  "V_PATCH_NUMS": [1, 5, 25, 50, 100],
  "T_DEPTH": 8
}
```

---

## 4. Multi-Scale Patch Levels

**Paper:** "Multi-scale sequence representation: [1, 5, 25, 50, 100] frames for 100-frame windows."

**Why these specific numbers?**

| Scale | Tokens | Temporal resolution | Represents |
|-------|--------|---------------------|------------|
| l=1 | 1 | 100 frames | Global motion trend for the entire window |
| l=2 | 5 | 20 frames | Low-frequency head movement rhythm |
| l=3 | 25 | 4 frames | Syllable-level articulation (≈6 syllables/sec) |
| l=4 | 50 | 2 frames | Phoneme-level lip motion |
| l=5 | 100 | 1 frame | Per-frame fine detail |

**Residual quantization process (from paper):**
```
h^(l) = Interp(Quant(r^(l-1)), k_l)
r^(l) = r^(l-1) - h^(l)
```
Where:
- `r^(0)` = encoder output
- `Quant()` assigns each feature to its nearest codebook entry
- `Interp()` resamples from scale l's resolution back to full T resolution
- `r^(l)` = residual after removing scale l's contribution

This means: **each subsequent scale refines the motion representation left unexplained by coarser scales**, forming a coarse-to-fine hierarchy.

**Code location:** `motion/vae/quantizer.py` → `MultiScaleBSQ`

---

## 5. Binary Spherical Quantization (BSQ)

**Standard VQ vs BSQ:**

Standard Vector Quantization uses a learned codebook of K vectors. Each input is assigned to the nearest codebook entry by L2 distance. Problems: codebook collapse, requires careful initialization.

**BSQ (Binary Spherical Quantization):** An alternative where each code is a binary vector of length `n_bits`, normalized to the unit sphere. The codebook size is implicitly `2^n_bits`.

With `V_CODE_DIM = 32` bits:
- Implicit codebook size: 2³² ≈ 4 billion entries
- No learnable codebook required
- Avoids codebook collapse
- Quantization = round each bit to {-1, +1} after L2 normalization

**Code:** `motion/vae/quantizer.py` → `BSQ` (base class), `MultiScaleBSQ` (multi-scale wrapper)

---

## 6. MultiScaleBSQ

**Code:** `motion/vae/quantizer.py` → `MultiScaleBSQ`

Applies BSQ independently at each patch level:

```python
for level_idx, patch_num in enumerate([1, 5, 25, 50, 100]):
    # Downsample latent to patch_num tokens
    downsampled = temporal_avg_pool(latent, target_len=patch_num)
    # Quantize with BSQ
    codes[level_idx], quantized[level_idx] = bsq(downsampled)
    # Upsample back to T
    upsampled[level_idx] = temporal_upsample(quantized[level_idx], target_len=T)

# Sum all scale contributions
combined_latent = sum(upsampled)
```

During **autoregressive generation**, only the code indices are passed between VAE and AR model — the AR model predicts `codes[l]` for each scale l, then the VAE decoder reconstructs motion from those codes.

**Commitment loss** (`L_cb`): Encourages encoder outputs to stay close to their quantized counterparts, preventing the encoder from ignoring quantization:
```
L_cb = ||z - sg(q)||² + β||sg(z) - q||²
```
Where `sg()` = stop-gradient, `z` = encoder output, `q` = quantized value.

---

## 7. Encoder & Decoder

**Why Transformers (not CNNs)?**

Motion sequences have long-range temporal dependencies — a head nod at frame 10 affects the natural resting position at frame 80. Transformers with self-attention naturally capture these dependencies. CNNs would need very deep stacks or dilated convolutions.

**Why shared weights across scales?**

The paper uses a shared codebook vocabulary across scales (per the architecture description). This keeps the total parameter count manageable and forces the model to learn a unified motion vocabulary where coarse and fine tokens live in the same representational space.

---

## 8. Why These Design Choices?

**Why 100-frame windows?**
- 4 seconds at 25fps covers a natural speech utterance chunk
- Long enough to capture phrase-level head motion
- Short enough for streaming (generates one chunk at a time)
- `CHUNK_FRAMES = 100` in `core/constants.py`

**Why 50-frame context?**
- 2 seconds of "memory" — the AR model sees the previous window's finest codes
- Prevents discontinuities at window boundaries
- `CONTEXT_FRAMES = 50` in `core/constants.py`

**Why 106 motion dimensions?**
- FLAME decomposition: 100 expression + 3 head rotation + 3 jaw = 106
- `MOTION_DIM = 106` in `core/constants.py`
- This is the natural dimensionality of the FLAME parameterization (see `flame-face3d.md`)

**Why `V_CODE_DIM = 32`?**
- 32-bit BSQ → implicit codebook of 2³² entries
- Practically unlimited vocabulary for motion primitives
- 32-bit operations are hardware-efficient

---

## 9. Data Normalization

**Code:** `motion/data_stats.py` → `ALLTALKEMICA_MEAN`, `ALLTALKEMICA_STD`

Before feeding motion into the VAE, and after decoding, motion parameters are normalized using statistics computed over the ALLTALKEMICA training dataset:
```python
normalized = (motion - ALLTALKEMICA_MEAN) / ALLTALKEMICA_STD
```

This is a standard practice ensuring:
- Each dimension of the 106-dim motion vector has zero mean and unit variance
- The VAE sees a consistent input distribution regardless of speaking style
- After decoding, denormalization restores the original motion scale

**In the code:** `engine.py` applies denormalization after `BITWISE_VAE.decode()` before passing to the FLAME model.
