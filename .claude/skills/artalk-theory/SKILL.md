---
name: artalk-theory
description: >
  Theoretical foundation of the ARTalk module (src/artalk/) based on the paper
  "ARTalk: Speech-Driven 3D Head Animation via Autoregressive Model"
  (SIGGRAPH Asia 2025, Chu et al.). Use this skill when asked to:
  - Explain the theory or research behind ARTalk code
  - Understand why specific architectural decisions were made (transformer depth,
    quantization levels, chunk sizes, FLAME dims, etc.)
  - Trace how paper concepts map to specific classes/functions in the codebase
  - Explain the audio-to-motion pipeline, VAE quantization, or FLAME face model
  - Answer questions like "what does BitwiseARModel do theoretically?" or
    "why are there 5 patch levels in the VAE?"
---

# ARTalk Theory Skill

Paper: [ARTalk – SIGGRAPH Asia 2025](https://arxiv.org/html/2502.20323v5)

## Quick Reference

| Concept | Code Location | Reference |
|---------|--------------|-----------|
| Audio-to-motion AR model | `src/artalk/motion/ar_model.py` | [architecture.md](references/architecture.md) |
| Multi-scale VAE + BSQ | `src/artalk/motion/vae/` | [vae-quantization.md](references/vae-quantization.md) |
| FLAME face model + LBS | `src/artalk/face3d/` | [flame-face3d.md](references/flame-face3d.md) |
| Style encoder | `src/artalk/motion/style_encoder.py` | [architecture.md](references/architecture.md) |
| Pipeline orchestration | `src/artalk/pipeline/engine.py` | [architecture.md](references/architecture.md) |
| Experiments, hyperparams, ablations | All training/eval | [experiments-and-params.md](references/experiments-and-params.md) |
| Original repo, confirmed impl details | github.com/xg-chu/ARTalk | [original-repo.md](references/original-repo.md) |

## When to Read Which File

- **Full pipeline or AR model questions** → [references/architecture.md](references/architecture.md)
- **Quantization, codebook, VAE, BSQ questions** → [references/vae-quantization.md](references/vae-quantization.md)
- **FLAME, mesh, vertices, LBS, expression space** → [references/flame-face3d.md](references/flame-face3d.md)
- **Hyperparameters, training config, ablations, datasets, benchmark results** → [references/experiments-and-params.md](references/experiments-and-params.md)
- **Original repo structure, confirmed impl details, BSQ params, env setup, model weights** → [references/original-repo.md](references/original-repo.md)

## Key Constants (Paper → Code)

| Paper | Value | Code Constant |
|-------|-------|--------------|
| Motion dim | 106 | `MOTION_DIM = 106` in `core/constants.py` |
| Expression dims | 100 | `EXPRESSION_DIM = 100` |
| Patch levels | [1, 5, 25, 50, 100] | `V_PATCH_NUMS` in VAE config |
| Window size | 100 frames (4s @ 25fps) | `CHUNK_FRAMES = 100` |
| Context window | 50 frames (2s) | `CONTEXT_FRAMES = 50` |
| FLAME vertices | 5,023 | `FLAME_VERTEX_COUNT = 5023` |
| AR transformer layers | 12 | `T_DEPTH: 12` in AR config |
| AR attention heads | 12 | `T_NUM_HEADS: 12` |
