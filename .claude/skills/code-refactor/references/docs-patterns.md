# Documentation Patterns for This Repo

## Docstring Format

Use Google-style docstrings. Every public module, class, and function requires one.

### Module docstring

```python
"""Short one-line description of the module.

Longer explanation if needed — purpose, design decisions, usage notes.
References to related modules or external docs go here.
"""
```

### Class docstring

```python
class TtsStreamHandler:
    """Synchronous streaming TTS handler.

    Routes audio generation to either the ElevenLabs remote provider
    or the local Kokoro ONNX model based on :attr:`provider`.

    Must be configured via :meth:`configure` before calling
    :meth:`stream_generator`.
    """
```

### Function docstring

Simple functions — one line is enough:

```python
def kokoro_stream(text: str, voice: str = "af_heart") -> Generator[bytes, None, None]:
    """Generate 1024-byte WAV chunks from Kokoro TTS."""
```

Non-trivial functions — include Args / Returns / Raises:

```python
def tts(self, text: str, tts_voice: str, tts_provider_params: TtsProviderParams) -> str:
    """Fetch full TTS audio and write to a temporary WAV file.

    Args:
        text: Input text to synthesise.
        tts_voice: Voice ID string for the provider.
        tts_provider_params: Provider endpoint configuration.

    Returns:
        Path to the temporary WAV file on disk.

    Raises:
        httpx.TimeoutException: If the provider does not respond in time.
        httpx.HTTPStatusError: If the provider returns a non-2xx status.
    """
```

### Dataclass / Pydantic model docstring

Document fields in the class body docstring using `Attributes:`:

```python
@dataclass(frozen=True)
class StreamingConfig:
    """Configuration for accumulator-based streaming inference.

    Attributes:
        sample_rate: Audio sample rate in Hz.
        motion_fps: Motion frame rate.
        chunk_frames: Frames per AR inference window (fixed at 100).
    """

    sample_rate: int = 16_000
    motion_fps: float = 25.0
    chunk_frames: int = 100
```

## Module-Level Constants

Document constants with a trailing comment or a short docstring variable:

```python
TARGET_SAMPLE_RATE = 16_000
"""Target sample rate expected by the downstream pipeline (Hz)."""

CHUNK_SIZE = 1024
"""Size of each yielded WAV byte chunk."""
```

## When NOT to Add Docstrings

- Private methods/functions (`_name`) — only add if the logic is non-obvious
- One-liner helpers that are self-evident from their name and type signature
- Test functions — test name is the documentation
