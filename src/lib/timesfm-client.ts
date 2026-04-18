/**
 * TimesFM API Client — TianJi Global
 *
 * Calls the Modal.com-hosted TimesFM 2.5 endpoint for
 * planetary cycle forecasting.
 */

const TIMESFM_API_URL = process.env.TIMESFM_API_URL || '';

export interface TimesFMForecastRequest {
  signal: number[];
  context_len?: number;
  horizon?: number;
  series_id?: string;
}

export interface TimesFMForecastResponse {
  point_forecast: number[];
  quantile_forecast: number[][]; // [quantile][horizon]
  model_version: string;
  inference_time_ms: number;
  series_id?: string;
  context_used?: number;
  horizon?: number;
  error?: string;
  status?: number;
}

// ─── Planet Signal Generation ─────────────────────────────────────────────────

/**
 * Generate a planetary speed signal from astronomia positions.
 * Returns normalized speed values (roughly -1 to 1) for TimesFM input.
 *
 * @param positions  Array of {lon, speed} for consecutive days
 * @param normalize  Z-score normalize the signal
 */
export function generateSpeedSignal(
  positions: Array<{ lon: number; speed: number }>,
  normalize = true,
): number[] {
  if (positions.length === 0) return [];

  const speeds = positions.map((p) => p.speed);

  if (normalize) {
    const mean = speeds.reduce((a, b) => a + b, 0) / speeds.length;
    const std = Math.sqrt(
      speeds.reduce((a, b) => a + (b - mean) ** 2, 0) / speeds.length,
    );
    if (std === 0) return speeds.map(() => 0);
    return speeds.map((s) => (s - mean) / std);
  }

  return speeds;
}

/**
 * Generate a planetary longitude signal (0-360 → normalized).
 * Useful for detecting zodiac sign transitions and cyclic patterns.
 */
export function generateLongitudeSignal(
  longitudes: number[],
  normalize = true,
): number[] {
  if (longitudes.length === 0) return [];

  // Convert to radians and use cosine/sine representation
  // This captures the circular nature of zodiac positions
  const radians = longitudes.map((lon) => (lon * Math.PI) / 180);

  if (normalize) {
    const cosMean = radians.reduce((a, r) => a + Math.cos(r), 0) / radians.length;
    const sinMean = radians.reduce((a, r) => a + Math.sin(r), 0) / radians.length;
    const magnitude = Math.sqrt(cosMean ** 2 + sinMean ** 2);

    // Normalized deviation from mean position
    return radians.map((r) => {
      const deviation = Math.cos(r - Math.atan2(sinMean, cosMean));
      return deviation * magnitude;
    });
  }

  return radians.map((r) => Math.cos(r));
}

// ─── API Client ──────────────────────────────────────────────────────────────

/**
 * Call TimesFM /forecast endpoint.
 *
 * Falls back gracefully if TIMESFM_API_URL is not configured.
 */
export async function timesfmForecast(
  req: TimesFMForecastRequest,
): Promise<TimesFMForecastResponse> {
  const {
    signal,
    context_len = 128,
    horizon = 12,
    series_id,
  } = req;

  // ── Fallback: seeded pseudo-forecast (no TimesFM available) ──
  if (!TIMESFM_API_URL) {
    console.warn('[TimesFM] No API URL configured — using seeded fallback');
    return seededFallbackForecast(signal, horizon);
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000); // 30s timeout

    const response = await fetch(`${TIMESFM_API_URL}/forecast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        signal,
        context_len,
        horizon,
        series_id,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const error = await response.text();
      console.error(`[TimesFM] API error ${response.status}: ${error}`);
      return seededFallbackForecast(signal, horizon);
    }

    const data: TimesFMForecastResponse = await response.json();
    return data;
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      console.error('[TimesFM] Request timed out after 30s');
    } else {
      console.error('[TimesFM] Fetch error:', err);
    }
    return seededFallbackForecast(signal, horizon);
  }
}

/**
 * Check if TimesFM API is ready (model loaded).
 */
export async function timesfmReady(): Promise<boolean> {
  if (!TIMESFM_API_URL) return false;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${TIMESFM_API_URL}/ready`, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return false;
    const data = await res.json();
    return data.status === 'ready';
  } catch {
    return false;
  }
}

// ─── Seeded Fallback ──────────────────────────────────────────────────────────

/**
 * Seeded pseudo-forecast when TimesFM is unavailable.
 * Uses a deterministic hash so same inputs always get same outputs.
 */
function seededFallbackForecast(signal: number[], horizon: number): TimesFMForecastResponse {
  // Simple deterministic noise based on signal content hash
  const seed = Math.abs(
    signal.slice(0, 16).reduce((a, b, i) => a + Math.round(b * 1e6) * (i + 1), 0),
  );

  let rng = lcgRandom(seed);
  const mean = signal.reduce((a, b) => a + b, 0) / signal.length;
  const std = Math.sqrt(
    signal.reduce((a, b) => a + (b - mean) ** 2, 0) / signal.length,
  );

  const point_forecast = Array.from({ length: horizon }, () => {
    // Mean reversion + small random walk
    const noise = (rng() - 0.5) * 0.5;
    return Math.tanh(mean + noise) * (std || 1);
  });

  // Generate quantiles (10%, 20%, ..., 90%)
  const quantile_forecast: number[][] = [];
  for (let q = 1; q <= 9; q++) {
    const factor = (q - 5) * 0.3; // Spread around mean
    quantile_forecast.push(
      point_forecast.map((p) => Math.tanh(p + factor * (std || 1))),
    );
  }

  return {
    point_forecast,
    quantile_forecast,
    model_version: 'seeded-fallback-v1',
    inference_time_ms: 0,
  };
}

/** Linear Congruential Generator for deterministic RNG */
function lcgRandom(seed: number): () => number {
  let s = seed ^ 0xdeadbeef;
  return () => {
    s = Math.imul(s ^ (s >>> 16), 0x45d9f3b);
    s = Math.imul(s ^ (s >>> 16), 0x45d9f3b);
    s ^= s >>> 16;
    return (s >>> 0) / 0xffffffff;
  };
}

// ─── Fortune Integration ──────────────────────────────────────────────────────

/**
 * Generate a fortune forecast for a life dimension using TimesFM.
 *
 * @param planetSignals  Historical planetary signals (speed/longitude over time)
 * @param dimension      'career' | 'wealth' | 'love' | 'health'
 * @param birthSeed      Birth date hash for fallback determinism
 * @param horizon        Number of periods to forecast
 */
export async function generateTimesFMFortune(
  planetSignals: Array<{ lon: number; speed: number; date: string }>,
  dimension: 'career' | 'wealth' | 'love' | 'health',
  birthSeed: number,
  horizon = 12,
): Promise<{
  scores: number[];
  confidence: number[];
  method: 'timesfm' | 'seeded';
}> {
  // Generate speed-based signal
  const signal = generateSpeedSignal(
    planetSignals.map((p) => ({ lon: p.lon, speed: p.speed })),
    true,
  );

  // Add dimension-specific frequency modulation
  const freqMap = { career: 1.0, wealth: 0.7, love: 1.3, health: 0.9 };
  const freq = freqMap[dimension];
  const modulatedSignal = signal.map(
    (v, i) => v * Math.sin((i * freq * Math.PI) / signal.length),
  );

  const result = await timesfmForecast({
    signal: modulatedSignal,
    context_len: Math.min(128, signal.length),
    horizon,
    series_id: `fortune_${dimension}_${birthSeed}`,
  });

  if (result.error) {
    // Fallback to seeded
    const fallback = seededFallbackForecast(signal, horizon);
    return {
      scores: fallback.point_forecast.map((v) => Math.round(Math.abs(v) * 100)),
      confidence: fallback.quantile_forecast[4].map(
        (v, i) =>
          Math.round(
            Math.abs(fallback.quantile_forecast[8][i] - fallback.quantile_forecast[0][i]) * 50,
          ),
      ),
      method: 'seeded',
    };
  }

  // Normalize to 0-100 score range
  const scores = result.point_forecast.map((v) =>
    Math.round(Math.min(100, Math.max(0, Math.abs(v) * 100))),
  );

  // Confidence from quantile spread (narrower = higher confidence)
  const q90 = result.quantile_forecast[8] ?? result.point_forecast;
  const q10 = result.quantile_forecast[0] ?? result.point_forecast;
  const confidence = q90.map(
    (high, i) =>
      Math.round(
        Math.min(100, Math.max(0, 100 - Math.abs(high - (q10[i] ?? 0)) * 50)),
      ),
  );

  return { scores, confidence, method: 'timesfm' };
}
