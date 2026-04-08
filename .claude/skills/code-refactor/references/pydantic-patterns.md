# Pydantic v2 Patterns for This Repo

## Model Structure

Every Pydantic model must have an explicit `model_config`:

```python
from pydantic import BaseModel, ConfigDict, Field

class MyModel(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    internal_name: str = Field(default="", alias="externalName")
```

## Field Naming

- Field names: `snake_case` (Python convention)
- External/API names (camelCase, kebab-case): use `Field(alias=...)`
- Always add `populate_by_name=True` when using aliases so both names work

```python
class TtsProviderParams(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    url: str = ""
    unith_api_key: str = Field(default="", alias="unithApiKey")

# Construction via alias still works:
p = TtsProviderParams(unithApiKey="key")
# Attribute access uses snake_case:
assert p.unith_api_key == "key"
```

## Enums in Models

Use `StrEnum` for constrained string fields; Pydantic coerces strings automatically:

```python
from enum import StrEnum
from pydantic import BaseModel

class Provider(StrEnum):
    KOKORO = "kokoro"
    ELEVENLABS = "elevenlabs"

class Config(BaseModel):
    provider: Provider = Provider.KOKORO

# Both work:
Config(provider="kokoro")
Config(provider=Provider.KOKORO)
```

## Validators

Use `@field_validator` (v2) — not the deprecated `@validator` (v1):

```python
from pydantic import field_validator, model_validator
from typing import Self

class DateRange(BaseModel):
    start: int
    end: int

    @field_validator("end")
    @classmethod
    def end_after_start(cls, v: int, info) -> int:
        if v <= info.data.get("start", 0):
            raise ValueError("end must be after start")
        return v

    @model_validator(mode="after")
    def check_range(self) -> Self:
        if self.end - self.start > 1000:
            raise ValueError("range too large")
        return self
```

## Settings / Config Classes

For env-var driven config, consolidate all `os.getenv` calls into a single `BaseSettings`-style dataclass or Pydantic model instead of scattered reads:

```python
from __future__ import annotations

import os
from dataclasses import dataclass

@dataclass(frozen=True)
class KokoroConfig:
    voice: str = "af_heart"
    lang: str = "en-us"
    speed: float = 1.0
    model_path: str | None = None
    voices_path: str | None = None

    @classmethod
    def from_env(cls) -> KokoroConfig:
        return cls(
            voice=os.getenv("TTS_KOKORO_VOICE", "af_heart"),
            lang=os.getenv("TTS_KOKORO_LANG", "en-us"),
            speed=float(os.getenv("TTS_KOKORO_SPEED", "1.0")),
            model_path=os.getenv("TTS_KOKORO_MODEL_PATH"),
            voices_path=os.getenv("TTS_KOKORO_VOICES_PATH"),
        )
```

## Serialization

Use v2 API:

| v1 (deprecated) | v2 (use this) |
|-----------------|---------------|
| `.dict()` | `.model_dump()` |
| `.json()` | `.model_dump_json()` |
| `.parse_obj()` | `.model_validate()` |
| `.parse_raw()` | `.model_validate_json()` |
| `@validator` | `@field_validator` |
| `@root_validator` | `@model_validator` |
| `class Config` | `model_config = ConfigDict(...)` |
