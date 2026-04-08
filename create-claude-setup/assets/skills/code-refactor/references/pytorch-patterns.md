# PyTorch / Lightning Patterns for This Repo

Only apply this reference when the target module contains `torch`, `nn.Module`, or `LightningModule` imports.

## Module Structure

Organise PyTorch code into `LightningModule` to eliminate boilerplate:

```python
from __future__ import annotations

import lightning as L
import torch
import torch.nn as nn
from torch import Tensor

class MyModel(L.LightningModule):
    def __init__(self, lr: float = 1e-3) -> None:
        super().__init__()
        self.save_hyperparameters()
        self.net = nn.Linear(128, 64)
        self.loss = nn.MSELoss()

    def forward(self, x: Tensor) -> Tensor:
        return self.net(x)

    def training_step(self, batch: tuple[Tensor, Tensor], batch_idx: int) -> Tensor:
        x, y = batch
        loss = self.loss(self(x), y)
        self.log("train/loss", loss, prog_bar=True)
        return loss

    def configure_optimizers(self):
        return torch.optim.Adam(self.parameters(), lr=self.hparams.lr)
```

## Type Annotations for Tensors

- Always annotate tensor parameters and return values as `Tensor` (from `torch import Tensor`)
- For shapes, document in docstring: `# (B, T, D) — batch, time, dim`

## Frozen Config Dataclasses

Replace scattered `**kwargs` and magic numbers with a frozen config:

```python
from dataclasses import dataclass

@dataclass(frozen=True)
class ModelConfig:
    hidden_dim: int = 256
    num_layers: int = 12
    num_heads: int = 8
    dropout: float = 0.1
```

## Device Handling

Never hardcode `"cuda"` — use `self.device` inside `LightningModule` or pass device explicitly:

```python
# Bad
x = x.cuda()

# Good (inside LightningModule)
x = x.to(self.device)

# Good (outside Lightning)
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
```

## Logging

Use `self.log()` inside `LightningModule` — not `print()` or `logger.info()`:

```python
self.log("val/loss", loss, on_step=False, on_epoch=True)
self.log_dict({"val/acc": acc, "val/f1": f1})
```

## `nn.Module` Best Practices

- Define all submodules in `__init__`, not in `forward`
- Use `register_buffer` for non-parameter tensors that should move with the model:

```python
self.register_buffer("mean", torch.tensor([0.485, 0.456, 0.406]))
```

- Prefer `nn.Sequential` for simple feed-forward stacks

## Inference / No-Grad

Always wrap inference in `torch.no_grad()` or `@torch.inference_mode()`:

```python
@torch.inference_mode()
def predict(self, x: Tensor) -> Tensor:
    return self(x)
```
