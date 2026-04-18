"""
TimesFM 2.5 Inference Server — Modal.com Deployment
TianJi Global | 天机全球

Deploy with: modal deploy deploy.py

Endpoints:
  POST /forecast          — Forecast from planetary cycle signals
  GET  /health            — Health check
  GET  /ready             — Readiness (model loaded)
"""

from __future__ import annotations

import json
import logging
import os
import time
from dataclasses import dataclass
from typing import Any

import modal

# ─── App Definition ─────────────────────────────────────────────────────────

app = modal.App(name="tianji-timesfm")

# ─── Image Setup ─────────────────────────────────────────────────────────────

# Modal image with PyTorch, CUDA, and all dependencies
base_image = (
    modal.Image.debian_slim(python_version="3.10")
    .pip_install(
        "torch>=2.0.0",
        "numpy>=1.26.4",
        "huggingface_hub[cli]>=0.23.0",
        "safetensors>=0.5.3",
        "fastapi>=0.115.0",
        "uvicorn[standard]>=0.30.0",
        "pydantic>=2.0.0",
    )
    .run_commands(
        # Pre-install CUDA kernel to reduce cold start
        "pip install torch torchvision --index-url https://download.pytorch.org/whl/cu121",
        error_ok=True,
    )
)

# ─── Volume for Model Cache ──────────────────────────────────────────────────
# Models persist across cold starts via Modal's volume
model_volume = modal.Volume.create(name="tianji-timesfm-models", persist=True)

# ─── GPU Configuration ───────────────────────────────────────────────────────
# T4: cheapest GPU, sufficient for 200M model batch inference
GPU_CONFIG = modal.gpu.T4()

# ─── System Requirements ─────────────────────────────────────────────────────
# Min 8 GB RAM for TimesFM 2.5 on CPU fallback
MEMORY = 2048  # MB


# ─── Request/Response Models ─────────────────────────────────────────────────

@dataclass
class ForecastRequest:
    """A planetary cycle signal to forecast."""
    # Unix timestamp → planetary longitude (0-360°) or speed (deg/day)
    # We use planetary speed anomalies as the signal:
    # positive = planet moving fast (expansion phase)
    # negative = planet moving slow retrograde (contraction phase)
    signal: list[float]  # e.g. [0.5, 0.3, -0.2, 0.8, ...]  normalized to roughly -1 to 1

    # Context length (number of historical data points)
    context_len: int = 128

    # Forecast horizon (number of future steps to predict)
    horizon: int = 12

    # Optional: series identifier (for logging/debugging)
    series_id: str | None = None


@dataclass
class ForecastResponse:
    """TimesFM forecast result with confidence intervals."""
    point_forecast: list[float]  # Point predictions (same unit as input signal)
    quantile_forecast: list[list[float]]  # [q10, q20, ..., q90] × horizon
    model_version: str = "timesfm-2.5-200m-pytorch"
    inference_time_ms: float = 0.0


# ─── Model Loader ────────────────────────────────────────────────────────────

MODEL: Any = None
MODEL_LOADED: bool = False
LOAD_START: float = 0


def download_model() -> None:
    """Download TimesFM 2.5 from HuggingFace on first cold start."""
    global MODEL, MODEL_LOADED, LOAD_START
    import numpy as np
    import torch
    import timesfm

    LOAD_START = time.perf_counter()

    logging.info("Loading TimesFM 2.5 (200M) — this happens once per cold start...")

    # Determine device
    if torch.cuda.is_available():
        device = "cuda"
    elif torch.backends.mps.is_available():
        device = "mps"
    else:
        device = "cpu"

    logging.info(f"Device: {device}")

    # Load model
    torch.set_float32_matmul_precision("high")

    model = timesfm.TimesFM_2p5_200M_torch.from_pretrained(
        "google/timesfm-2.5-200m-pytorch",
        device=device,
    )

    model.compile(
        timesfm.ForecastConfig(
            max_context=1024,
            max_horizon=256,
            normalize_inputs=True,
            use_continuous_quantile_head=True,
            force_flip_invariance=True,
            infer_is_positive=True,
            fix_quantile_crossing=True,
        )
    )

    MODEL = model
    MODEL_LOADED = True

    elapsed = time.perf_counter() - LOAD_START
    logging.info(f"TimesFM 2.5 loaded in {elapsed:.1f}s")


# ─── Modal Stub ─────────────────────────────────────────────────────────────

@app.cls(
    image=base_image,
    gpu=GPU_CONFIG,
    memory=MEMORY,
    volumes={"/models": model_volume},
    timeout=600,  # 10 min max per call
    retries=modal.Retries(max_retries=2, backoff_coefficient=2.0),
)
class TimesFMServer:
    """Modal serverless class — one instance per cold start."""

    @modal.enter()
    def load_model(self):
        """Called once when the container starts (cold start)."""
        os.environ["HF_HOME"] = "/models/huggingface"
        os.environ["TRANSFORMERS_CACHE"] = "/models/transformers"
        os.makedirs("/models/huggingface", exist_ok=True)

        download_model()

    @modal.method()
    def forecast(self, req: dict) -> dict:
        """Run TimesFM forecast on a planetary signal."""
        global MODEL, MODEL_LOADED

        if not MODEL_LOADED:
            return {"error": "Model not loaded yet", "status": 503}

        import numpy as np
        import timesfm

        t0 = time.perf_counter()

        # Parse request
        signal = req.get("signal", [])
        context_len = req.get("context_len", 128)
        horizon = req.get("horizon", 12)
        series_id = req.get("series_id", "unknown")

        if len(signal) < 32:
            return {
                "error": f"Signal too short: {len(signal)} < 32 minimum",
                "status": 400,
            }

        if len(signal) > 2048:
            return {
                "error": f"Signal too long: {len(signal)} > 2048 maximum",
                "status": 400,
            }

        # Normalize signal to reasonable range
        arr = np.array(signal, dtype=np.float32)
        # Clip outliers
        arr = np.clip(arr, -5, 5)
        # Z-score normalize (TimesFM does its own instance normalization too)
        mean, std = arr.mean(), arr.std()
        if std > 0:
            arr_norm = (arr - mean) / std
        else:
            arr_norm = arr - mean

        # Ensure float64→float32 for torch
        arr_norm = arr_norm.astype(np.float32)

        # Pad context if too short (TimesFM needs ≥ 32)
        if len(arr_norm) < context_len:
            arr_norm = np.pad(arr_norm, (context_len - len(arr_norm), 0), mode="edge")

        # Run forecast
        point_fc, quant_fc = MODEL.forecast(
            horizon=horizon,
            inputs=[arr_norm[-context_len:]],
        )

        # point_fc: (1, horizon), quant_fc: (1, horizon, 10)
        point = point_fc[0].tolist()
        # Denormalize
        point = [p * std + mean for p in point]

        # Quantile forecasts: [mean, q10, q20, ..., q90]
        # Index 0 = mean, index 1 = q10, ..., index 9 = q90
        quantiles = quant_fc[0]  # (horizon, 10)
        q_forecast = []
        for q in quantiles.T:  # Each column is a quantile across horizon
            q_denorm = [v * std + mean for v in q.tolist()]
            q_forecast.append(q_denorm)

        elapsed_ms = (time.perf_counter() - t0) * 1000

        return {
            "point_forecast": point,
            "quantile_forecast": q_forecast,
            "model_version": "timesfm-2.5-200m-pytorch",
            "inference_time_ms": round(elapsed_ms, 2),
            "series_id": series_id,
            "context_used": min(len(signal), context_len),
            "horizon": horizon,
        }

    @modal.method()
    def batch_forecast(self, requests: list[dict]) -> list[dict]:
        """Batch forecast for multiple signals."""
        global MODEL, MODEL_LOADED

        if not MODEL_LOADED:
            return [{"error": "Model not loaded yet", "status": 503}] * len(requests)

        import numpy as np

        t0 = time.perf_counter()

        # Collect all signals
        all_signals = []
        valid_indices = []
        for i, req in enumerate(requests):
            sig = req.get("signal", [])
            if len(sig) >= 32:
                all_signals.append(np.array(sig, dtype=np.float32))
                valid_indices.append(i)

        if not all_signals:
            return [{"error": "No valid signals (all < 32 points)", "status": 400}] * len(requests)

        horizon = min(req.get("horizon", 12) for req in requests)
        context_len = min(req.get("context_len", 128) for req in requests)

        # Batch forecast (TimesFM handles batching internally)
        import timesfm
        point_fc, quant_fc = MODEL.forecast(
            horizon=horizon,
            inputs=all_signals,
        )

        results = []
        for i, req in enumerate(requests):
            if i in valid_indices:
                idx = valid_indices.index(i)
                mean = all_signals[idx].mean()
                std = all_signals[idx].std()
                p = (point_fc[idx] * (std if std > 0 else 1) + mean).tolist()
                results.append({
                    "point_forecast": p,
                    "model_version": "timesfm-2.5-200m-pytorch",
                    "inference_time_ms": round((time.perf_counter() - t0) * 1000, 2),
                    "series_id": req.get("series_id", f"series_{i}"),
                })
            else:
                results.append({"error": "Signal too short", "status": 400})

        return results

    @modal.method()
    def health(self) -> dict:
        """Health check."""
        return {
            "status": "ok",
            "model_loaded": MODEL_LOADED,
        }

    @modal.method()
    def ready(self) -> dict:
        """Readiness probe — model must be loaded."""
        global LOAD_START
        if not MODEL_LOADED:
            return {"status": "loading", "model_loaded": False}
        return {
            "status": "ready",
            "model_loaded": True,
            "cold_start_time_s": round(time.perf_counter() - LOAD_START, 1),
        }


# ─── Web Endpoint (FastAPI) ──────────────────────────────────────────────────

@app.function(
    image=base_image,
    gpu=GPU_CONFIG,
    memory=MEMORY,
    allow_concurrent_inputs=10,
    timeout=120,
)
@modal.asgi_app()
def fastapi_app():
    """FastAPI web server — public HTTP endpoint for TianJi Global."""
    from fastapi import FastAPI, HTTPException
    from fastapi.middleware.cors import CORSMiddleware
    from pydantic import BaseModel, Field

    web_app = FastAPI(title="TianJi TimesFM API", version="1.0.0")

    # CORS — allow Vercel frontend
    web_app.add_middleware(
        CORSMiddleware,
        allow_origins=["https://tianji-global.vercel.app", "http://localhost:3000"],
        allow_credentials=True,
        allow_methods=["POST", "GET"],
        allow_headers=["*"],
    )

    class ForecastInput(BaseModel):
        signal: list[float] = Field(..., min_length=32, max_length=2048)
        context_len: int = Field(default=128, ge=32, le=2048)
        horizon: int = Field(default=12, ge=1, le=256)
        series_id: str | None = None

    class BatchInput(BaseModel):
        requests: list[ForecastInput] = Field(..., max_length=100)

    @web_app.post("/forecast")
    async def forecast(input: ForecastInput) -> dict:
        """Single series forecast."""
        server = TimesFMServer()
        result = server.forecast.call({
            "signal": input.signal,
            "context_len": input.context_len,
            "horizon": input.horizon,
            "series_id": input.series_id,
        })
        if "error" in result and result.get("status") == 400:
            raise HTTPException(status_code=400, detail=result["error"])
        return result

    @web_app.post("/batch-forecast")
    async def batch_forecast(input: BatchInput) -> dict:
        """Batch forecast for multiple series."""
        server = TimesFMServer()
        req_dicts = [{
            "signal": r.signal,
            "context_len": r.context_len,
            "horizon": r.horizon,
            "series_id": r.series_id,
        } for r in input.requests]
        results = server.batch_forecast.call(req_dicts)
        return {"results": results, "count": len(results)}

    @web_app.get("/health")
    async def health() -> dict:
        server = TimesFMServer()
        return server.health.call()

    @web_app.get("/ready")
    async def ready() -> dict:
        server = TimesFMServer()
        return server.ready.call()

    return web_app


# ─── Local Development ────────────────────────────────────────────────────────

if __name__ == "__main__":
    # Run locally: modal run deploy.py::app
    # Or: modal deploy deploy.py
    print("TimesFM 2.5 Modal.com Deployment")
    print("=" * 50)
    print("Deploy: modal deploy deploy.py")
    print("Local dev: modal run deploy.py")
    print("Inspect: modal app list tianji-timesfm")
