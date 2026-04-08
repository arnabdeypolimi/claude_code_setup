# FLAME Face Model: Theory ↔ Code

## Table of Contents
1. [What is FLAME?](#1-what-is-flame)
2. [FLAME Parameterization](#2-flame-parameterization)
3. [Why ARTalk Uses FLAME](#3-why-artalk-uses-flame)
4. [Code Architecture](#4-code-architecture)
5. [Linear Blend Skinning (LBS)](#5-linear-blend-skinning-lbs)
6. [MotionParams: The Bridge Between AR Model and FLAME](#6-motionparams-the-bridge-between-ar-model-and-flame)
7. [Shape vs Expression: Identity vs Behavior](#7-shape-vs-expression-identity-vs-behavior)
8. [The 106-Dimensional Motion Space](#8-the-106-dimensional-motion-space)
9. [FLAME in the Tracking Pipeline](#9-flame-in-the-tracking-pipeline)
10. [From Vertices to Video](#10-from-vertices-to-video)

---

## 1. What is FLAME?

**FLAME (Faces Learned with an Articulated Model and Expressions)** is a statistical 3D morphable face model. It represents any human face as a weighted combination of learned shape basis vectors, learned expression basis vectors, and articulated pose (jaw, neck, eyes).

**Original paper:** Li et al., "Learning a model of facial shape and expression from 4D scans" (SIGGRAPH Asia 2017).

FLAME is widely adopted in the face animation community because:
- **Compact**: 100 numbers fully describe all facial expressions
- **Disentangled**: shape (identity) is separate from expression (behavior)
- **Differentiable**: can be used end-to-end in neural training
- **Interoperable**: many face reconstruction systems (EMICA, DECA, etc.) output FLAME parameters

---

## 2. FLAME Parameterization

The FLAME model produces a 3D mesh as:

```
TP(β, θ, ψ) = T̄ + B_S(β; S) + B_P(θ; P) + B_E(ψ; E)
```

Where:
- `T̄` — mean face template (a neutral, average face mesh with 5,023 vertices)
- `B_S(β; S)` — **shape** blend shapes: identity-specific deformations (who the person is)
- `B_P(θ; P)` — **pose** blend shapes: corrective deformations caused by joint rotations (jaw open/close)
- `B_E(ψ; E)` — **expression** blend shapes: facial expressions (smile, brow raise, etc.)

**Parameters:**

| Symbol | Dim | Meaning | Code field |
|--------|-----|---------|-----------|
| β (beta) | 300 | Shape/identity | Fixed per avatar (`FLAME_SHAPE_DIM = 300`) |
| ψ (psi) | 100 | Expression | `MotionParams.expression` |
| θ_global | 3 | Head orientation (axis-angle) | `MotionParams.head_rotation` |
| θ_jaw | 3 | Jaw rotation (axis-angle) | `MotionParams.jaw` |

**Output:** 5,023 vertices in 3D space `(5023, 3)` — `FLAME_VERTEX_COUNT = 5023`

---

## 3. Why ARTalk Uses FLAME

**Paper reasoning:** FLAME provides a compact, disentangled parameterization that:

1. **Separates identity from motion**: The AR model only generates the 106-dim motion parameters (expression, rotation, jaw). The identity (shape β) is fixed per avatar, set during the tracking phase.

2. **Enables style transfer**: Because expressions are identity-independent, the same motion sequence can be applied to any avatar by substituting their shape parameters.

3. **Ensures smooth mesh generation**: FLAME's basis vectors are smooth, so small changes in parameter space produce smooth, artifact-free vertex movements.

4. **Integrates with GAGAvatar**: The photorealistic Gaussian Splatting renderer (GAGAvatar) was designed to work with FLAME-space inputs, enabling seamless integration.

---

## 4. Code Architecture

**Code location:** `src/artalk/face3d/`

```
face3d/
├── flame/
│   ├── flame_model.py     # FLAME nn.Module implementation
│   ├── lbs.py             # Linear Blend Skinning utilities
│   └── face3d_utils.py    # Helper functions
└── converter.py           # MotionToVerticesConverter (high-level API)
```

**`MotionToVerticesConverter`** (`face3d/converter.py`):
```python
converter = MotionToVerticesConverter(flame_model, shape_params)
vertices = converter(motion_params)  # MotionParams → FaceVertices
```

This is the boundary between the motion generation stage and the rendering stage. It holds the per-avatar `shape_params` (β, `FLAME_SHAPE_DIM = 300`) fixed while applying the dynamic `MotionParams` frame-by-frame.

---

## 5. Linear Blend Skinning (LBS)

**Code:** `face3d/flame/lbs.py`

LBS is the mechanism by which joint rotations (jaw, neck) deform the mesh. Each vertex is associated with nearby joints through blend weights, and its final position is computed as a weighted average of its position under each joint's transform.

```
v_posed = Σ_j  W(v, j) · J_j · v_shaped
```

Where:
- `v_shaped` = vertex position after shape+expression blend shapes
- `J_j` = rotation matrix for joint j (computed from axis-angle θ_j)
- `W(v, j)` = skinning weight (how much joint j influences vertex v)

**In FLAME:** The relevant joints are:
- **Jaw joint**: rotates the lower jaw, driving lip/chin vertices
- **Neck joint**: rotates the entire head relative to the neck
- **Global rotation**: rotates the entire head in world space

**Why LBS matters for ARTalk:** The jaw rotation parameter `θ_jaw` (3-dim) drives lip movements through LBS. This is why jaw parameters are treated separately from expression parameters in `MotionParams` — they have fundamentally different deformation mechanisms (joint rotation via LBS vs. linear basis blend for expressions).

---

## 6. MotionParams: The Bridge Between AR Model and FLAME

**Code:** `core/types.py` → `MotionParams`

```python
@dataclass
class MotionParams:
    expression:    Tensor  # (B, T, 100) — FLAME expression ψ
    head_rotation: Tensor  # (B, T, 3)   — global head orientation θ_global
    jaw:           Tensor  # (B, T, 3)   — jaw rotation θ_jaw
```

**Total: 100 + 3 + 3 = 106 dimensions = `MOTION_DIM`**

This is exactly what the AR model generates and what the FLAME model consumes. The 106-dim concatenation `[expression | head_rotation | jaw]` is the format used in:
- The BITWISE_VAE (encodes/decodes motion in this space)
- The style motion files (`data/assets/style_motion/*.pt`)
- The data statistics normalization (`ALLTALKEMICA_MEAN`, `ALLTALKEMICA_STD`)

**Helper methods:**
- `MotionParams.to_tensor()` → concatenates into `(B, T, 106)`
- `MotionParams.from_tensor(t)` → splits `(B, T, 106)` back into fields
- `MotionParams.scale(factor)` → scales expression/jaw amplitude (used for "motion scale" UI slider)

---

## 7. Shape vs Expression: Identity vs Behavior

**A critical distinction in FLAME:**

| | Shape β | Expression ψ |
|-|---------|-------------|
| Dim | 300 | 100 |
| Meaning | Who the person **is** (face geometry) | What the face **does** (animation) |
| Set when | Avatar tracking (once per avatar) | Generated per-frame by AR model |
| Varies with | Avatar | Speech + style |
| Code | `FLAMEModel.shape_params` | `MotionParams.expression` |

**Why 300 shape dims but only 100 expression dims?**

Shape needs to capture the full diversity of human face geometry (bone structure, nose shape, eye placement, etc.). Expression only needs to capture deformations from the neutral pose, which is a much lower-dimensional space (smiles, brow raises, etc. decompose into fewer independent directions).

**In practice:** The AR model never touches shape parameters. It only generates `MotionParams` (expression, rotation, jaw). The shape is loaded from the tracked avatar cache (`data/avatars/`) and held fixed throughout inference.

---

## 8. The 106-Dimensional Motion Space (Code) vs 56-Dim (Paper)

**Important discrepancy:** The paper (Section 3.1) states D=56 (50 expression + 6 pose). The code uses D=106 (100 expression + 3 head_rotation + 3 jaw). The code is the authoritative implementation. The paper describes a simplified data annotation view (EMICA outputs 50-dim expression subset). See `experiments-and-params.md` Section 12 for the full comparison.



**Why not more dims?** The paper trains on the ALLTALKEMICA dataset, which provides FLAME parameter annotations. 106 dims captures all speech-relevant facial motion:
- **Expression (100)**: FLAME's expression basis covers all observable facial muscle movements
- **Head rotation (3)**: Full 3-DOF head orientation in axis-angle representation
- **Jaw (3)**: Jaw open/close and lateral jaw movement

**What's excluded from the 106 dims:**
- Eye gaze (not speech-driven in ARTalk)
- Neck pose (collapsed into head rotation)
- Eyelid movement (minor for talking-head applications)

**Normalization of the 106 dims:** Each of the 106 dimensions has different scale and variance in real data. `ALLTALKEMICA_MEAN` and `ALLTALKEMICA_STD` normalize these so the VAE sees a zero-mean, unit-variance input. This is stored in `motion/data_stats.py`.

---

## 9. FLAME in the Tracking Pipeline

**Code:** `tracking/encoders/emica.py` → `EmicaEncoder`

Before ARTalk can animate a custom avatar, it must estimate that person's FLAME shape parameters β from their image. This is the tracking pipeline:

```
Input image
    │
    ▼ Face detection (VGGHead / FAN / InsightFace)
Detected face crop
    │
    ▼ EMICA encoder (a pre-trained FLAME fitting model)
FLAME params (β, ψ, θ, camera)
    │
    ▼ Camera optimization (fit camera to landmarks)
TrackedAvatar (stores β, camera params, texture)
```

**EMICA** is a neural encoder that directly regresses FLAME parameters from a face image in a single forward pass. The output β (300-dim shape) is what uniquely identifies the avatar and is stored in `data/avatars/`.

**Why track once, animate many times?** Tracking is expensive (~1.1GB of models). Once the shape β is extracted, all subsequent animations just feed new `MotionParams` into the FLAME model with that fixed β.

---

## 10. From Vertices to Video

After FLAME produces vertices `(B, T, 5023, 3)`, two rendering paths are available:

**Path 1: Mesh rendering (PyTorch3D)**
- `renderer/mesh/pytorch3d_renderer.py`
- Applies Phong shading with configurable lighting
- Fast, no avatar-specific training needed
- Produces cartoon/schematic-looking output

**Path 2: Gaussian Splatting (GAGAvatar)**
- `renderer/gaussian/wrapper.py` → `GAGAvatar`
- Uses 3D Gaussian Splatting for photorealistic rendering
- Requires avatar-specific Gaussian model (created during tracking)
- Produces photorealistic video output
- From paper: "Downstream Integration: FLAME-based design enables seamless integration with avatar reconstruction systems (demonstrated with GAGAvatar)"

**254 lip vertices** are tracked specifically in the evaluation metrics (LVE measures only lip vertex error) — these are defined in FLAME's mesh topology as the vertices around the mouth region. The reconstruction loss `L_recon` in VAE training also applies higher weight `w_lips` to these vertices.
