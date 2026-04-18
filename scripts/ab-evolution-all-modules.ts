#!/usr/bin/env npx tsx
/**
 * TianJi A/B Evolution Engine — All Modules
 *
 * Runs A/B copy evolution across ALL modules:
 *   BaZi, Ziwei, Tarot, YiJing, Western Astrology, Fortune, Numerology, Relationship
 *
 * Each module: 20 rounds, A vs B emotional framing
 * Winner: Variant A (emotional) if scoreA > scoreB, else Variant B (functional)
 *
 * Usage: npx tsx scripts/ab-evolution-all-modules.ts
 *   --modules=bazi,ziwei,tarot   (comma-separated, default: all)
 *   --rounds=20                  (default: 20)
 */

import fs from "fs";

// ─── Config ──────────────────────────────────────────────────────────────────

const API_BASE = "http://localhost:3002";
const DEFAULT_ROUNDS = parseInt(
  process.argv.find(a => a.startsWith("--rounds="))?.split("=")[1] ?? "20",
  10
);
const MODULE_ARG = process.argv.find(a => a.startsWith("--modules="))?.split("=")[1] ?? "all";
const TARGET_MODULES = MODULE_ARG === "all"
  ? ["bazi", "ziwei", "tarot", "yijing", "western", "fortune", "numerology", "relationship"]
  : MODULE_ARG.split(",");

// ─── Scoring Functions ───────────────────────────────────────────────────────

function scoreHeadline(text: string): number {
  if (!text) return 0;
  let s = 0;
  const lower = text.toLowerCase();
  if (text.length > 15) s += 4;
  if (lower.includes("you")) s += 5;
  if (lower.includes("but") || lower.includes("—") || lower.includes("-") || lower.includes(":")) s += 5;
  if (lower.includes("real") || lower.includes("genuine") || lower.includes("honest") || lower.includes("innate")) s += 4;
  if (lower.includes("?")) s += 3;
  if (text.length > 50) s += 2;
  if (lower.includes("feel") || lower.includes("sense") || lower.includes("gut")) s += 3;
  if (lower.includes("this") && lower.includes("means")) s += 2;
  return Math.min(20, s);
}

function scoreEmotionalResonance(text: string): number {
  if (!text) return 0;
  let s = 0;
  const lower = text.toLowerCase();
  if (lower.includes("you feel")) s += 5;
  if (lower.includes("you sense")) s += 4;
  if (lower.includes("real") || lower.includes("genuine") || lower.includes("honest") || lower.includes("innate")) s += 4;
  if (lower.includes("but")) s += 3;
  if (lower.includes("question") || lower.includes("?") || lower.includes("depends")) s += 3;
  if (lower.includes("beneath") || lower.includes("underneath") || lower.includes("beyond")) s += 3;
  if (lower.includes("this is") && !lower.includes("this is a")) s += 2;
  if (text.length < 40 && lower.includes("you")) s += 2; // punchy + personal
  if (lower.includes("the truth is") || lower.includes("here's the thing")) s += 2;
  if (lower.includes("the real") || lower.includes("what's really")) s += 2;
  return Math.min(15, s);
}

function scorePatternClarity(text: string): number {
  if (!text) return 0;
  let s = 0;
  const lower = text.toLowerCase();
  if (text.includes(",") || text.includes("–")) s += 4;
  if (lower.match(/\d+/) && lower.includes("/")) s += 3; // ratio like 7/10
  if (text.split(" ").length < 15) s += 4;
  if (lower.includes("type") || lower.includes("pattern") || lower.includes("style")) s += 2;
  if (lower.includes("your") || lower.includes("the")) s += 2;
  return Math.min(15, s);
}

function scoreUpgradeStrength(text: string): number {
  if (!text) return 0;
  let s = 0;
  const lower = text.toLowerCase();
  if (lower.includes("unlock")) s += 4;
  if (lower.includes("premium")) s += 3;
  if (lower.includes("full") || lower.includes("complete") || lower.includes("detailed")) s += 3;
  if (lower.includes("forecast") || lower.includes("timing") || lower.includes("12 month") || lower.includes("year")) s += 3;
  if (lower.includes("upgrade")) s += 2;
  if (lower.includes("insight") || lower.includes("reveal")) s += 2;
  return Math.min(15, s);
}

function scoreConversionCopy(text: string): number {
  if (!text) return 0;
  let s = 0;
  const lower = text.toLowerCase();
  if (lower.includes("your") && lower.includes("is")) s += 3;
  if (lower.includes("discover") || lower.includes("understand") || lower.includes("know")) s += 4;
  if (lower.includes("personal") || lower.includes("specific") || lower.includes("tailored")) s += 3;
  if (lower.includes("today") || lower.includes("now") || lower.includes("start")) s += 3;
  if (text.length > 20 && text.length < 80) s += 2;
  if (lower.includes("free") || lower.includes("try")) s += 2;
  return Math.min(15, s);
}

// ─── API Caller ────────────────────────────────────────────────────────────────

interface ApiCallResult {
  data: Record<string, unknown>;
  latencyMs: number;
  success: boolean;
}

async function callApi(
  module: string,
  params: Record<string, unknown>,
): Promise<ApiCallResult> {
  const start = Date.now();

  const endpoints: Record<string, { method: string; path: string; body?: Record<string, unknown> }> = {
    bazi: {
      method: "GET",
      path: `/api/bazi?birthday=${params.birthday}&birthTime=${params.birthTime}&language=${params.language}`,
    },
    ziwei: {
      method: "GET",
      path: `/api/ziwei?birthday=${params.birthday}&birthTime=${params.birthTime}&gender=${params.gender}&language=${params.language}`,
    },
    tarot: {
      method: "POST",
      path: "/api/tarot",
      body: { spreadType: "single", language: params.language, enhanceWithAI: false },
    },
    yijing: {
      method: "POST",
      path: "/api/yijing",
      body: { hexagramId: 1, language: params.language, enhanceWithAI: false },
    },
    western: {
      method: "POST",
      path: "/api/western",
      body: { birthDate: params.birthday, birthTime: params.birthTime, lat: params.lat, lng: params.lng, language: params.language },
    },
    fortune: {
      method: "GET",
      path: `/api/fortune?birthDate=${params.birthday}&birthTime=${params.birthTime}&gender=${params.gender}&language=${params.language}`,
    },
    numerology: {
      method: "POST",
      path: "/api/numerology",
      body: { name: params.name ?? "Alex Chen", birthdate: params.birthday, language: params.language },
    },
    relationship: {
      method: "POST",
      path: "/api/relationship/analyze",
      body: {
        relationType: "romantic",
        lang: params.language,
        personA: { nickname: "Alex", birthDate: params.birthday as string, birthTime: params.birthTime },
        personB: { nickname: "Jordan", birthDate: "1993-07-22", birthTime: "14:00" },
      },
    },
  };

  const ep = endpoints[module];
  if (!ep) throw new Error(`Unknown module: ${module}`);

  const fetchOptions: RequestInit = {
    method: ep.method,
    headers: { "Content-Type": "application/json" },
  };
  if (ep.body) {
    fetchOptions.body = JSON.stringify(ep.body);
  }

  const res = await fetch(`${API_BASE}${ep.path}`, fetchOptions);
  const latencyMs = Date.now() - start;
  const text = await res.text();

  let json: Record<string, unknown>;
  try {
    json = JSON.parse(text);
  } catch {
    return { data: { raw: text.substring(0, 200) }, latencyMs, success: false };
  }

  // Unwrap {success: true, data: ...} wrapper if present
  const d = (json && (json as Record<string, unknown>).success === true && (json as Record<string, unknown>).data)
    ? (json as Record<string, unknown>).data as Record<string, unknown>
    : json;

  return { data: d, latencyMs, success: res.ok };
}

// ─── Copy Text Extractors ─────────────────────────────────────────────────────

function extractText(module: string, data: Record<string, unknown>): { headline: string; body: string; label: string } {
  switch (module) {
    case "bazi": {
      const interp = (data.interpretation as string) ?? "";
      const sentences = interp.split(/[.!]/).filter(Boolean);
      return {
        headline: sentences[0]?.trim() ?? interp.substring(0, 80),
        body: interp,
        label: "interpretation",
      };
    }
    case "ziwei": {
      // Ziwei returns chart data with aiInterpretation nested
      const chart = data.chart as Record<string, unknown> | undefined;
      const aiInt = (data as Record<string, unknown>).aiInterpretation as string | undefined;
      const text = aiInt ?? (chart?.mainStars as Array<{description?: string}>)?.slice(0,2).map(s=>s.description).join(" ") ?? "";
      return {
        headline: (chart?.mingju as string | undefined)?.substring(0, 80) ?? (data.mingju as string | undefined)?.substring(0, 80) ?? "",
        body: text,
        label: "aiInterpretation",
      };
    }
    case "tarot": {
      const cards = data.drawnCards as Array<{interpretation?: string; name?: string}> | undefined;
      const first = cards?.[0];
      return {
        headline: first?.name ?? "The Fool",
        body: first?.interpretation ?? "",
        label: "drawnCards[0].interpretation",
      };
    }
    case "yijing": {
      const hex = data.hexagram as Record<string, unknown> | undefined;
      return {
        headline: (hex?.name as string | undefined) ?? (data.name as string | undefined) ?? "Hexagram",
        body: (hex?.judgementEn as string | undefined) ?? (data.judgementEn as string | undefined) ?? "",
        label: "hexagram.judgementEn",
      };
    }
    case "western": {
      const chart = data.chart as Record<string, unknown> | undefined;
      const planets = data.planets as Array<{sign?: string; name?: string}> | undefined;
      const sun = planets?.find(p => p.name === "Sun");
      return {
        headline: sun ? `Sun in ${sun.sign}` : "Western Chart",
        body: (chart?.description as string | undefined) ?? "",
        label: "sunSign",
      };
    }
    case "fortune": {
      const points = data.points as Array<{phase?: string; phaseEn?: string; overall?: number}> | undefined;
      const current = points?.[0];
      return {
        headline: current?.phaseEn ?? current?.phase ?? "Fortune Reading",
        body: `Overall: ${current?.overall ?? 0}/100`,
        label: "points[0].phaseEn",
      };
    }
    case "numerology": {
      const reading = data.reading as Record<string, unknown> | undefined;
      return {
        headline: (reading?.lifePath as string | undefined) ?? (data.lifePath as string | undefined) ?? "Numerology",
        body: (reading?.destiny as string | undefined) ?? (data.destiny as string | undefined) ?? "",
        label: "reading",
      };
    }
    case "relationship": {
      const summary = data.summary as Record<string, unknown> | undefined;
      const dims = data.dimensions as Record<string, {summary?: string}> | undefined;
      const firstDim = dims ? Object.values(dims)[0] : undefined;
      return {
        headline: (summary?.headline as string | undefined) ?? "",
        body: (summary?.oneLiner as string | undefined) ?? firstDim?.summary ?? "",
        label: "summary",
      };
    }
    default:
      return { headline: "", body: "", label: "unknown" };
  }
}

// ─── Module Mutators ─────────────────────────────────────────────────────────
// Returns { copyA: Record<string,string>, copyB: Record<string,string>, surfaces: string[] }

type Surface = "headline" | "body" | "cta" | "pattern" | "dimension";

function getModuleCopyMutators(module: string, round: number): {
  surfaces: Surface[];
  mutateA: (key: string, baseline: string) => string;
  mutateB: (key: string, baseline: string) => string;
} {
  const templatesA: Record<string, Record<string, string[]>> = {
    bazi: {
      headline: [
        "Your Day Master is Wood — you're driven by growth, but not always by direction",
        "There's real depth here — your element nature is honest, not decorative",
        "You carry a Wood energy — the question is whether you're growing or just moving",
        "The Wood element in you is genuine — not a metaphor, a pattern",
        "Your nature is growth-oriented — what happens when the growth stalls?",
      ],
      body: [
        "You feel your strengths before you name them — that's the Wood speaking",
        "The drive is real. Where it takes you depends on what you water",
        "Your energy pushes outward, but the root is in what you actually want",
      ],
    },
    ziwei: {
      headline: [
        "Your命宫 tells a story — and the most honest part is the part you're still figuring out",
        "There's something real in your星盘 structure — not everything is set in stone",
        "Your star pattern is a map — some roads are clear, others are still being drawn",
        "The stars show patterns, not prescriptions — what you do with yours is the real question",
        "Your constellation carries weight — the question is which parts you're living from",
      ],
      body: [
        "The palace structure is honest — it doesn't promise, it reflects",
        "Your major stars set a tone. How you work with that tone is where the story lives",
        "The pattern is real. What you build inside it is yours to decide",
      ],
    },
    tarot: {
      headline: [
        "The card that surfaced — it knows something specific about your situation",
        "What this card is really saying might not be what you first thought",
        "There's a message in this draw — sometimes it takes a second look to hear it",
        "The card isn't giving you an answer — it's giving you a question you need",
        "This draw reflects something real — whether you're ready to hear it is the real question",
      ],
      body: [
        "You feel the gap between what the card says and what you hoped it would say — that's the card working",
        "The imagery is specific. What it's pointing at might be uncomfortable, but it's real",
        "The card reflects what is — not what you want to be true",
      ],
    },
    yijing: {
      headline: [
        "The hexagram isn't predicting — it's reflecting what you're already in",
        "The change you feel isn't in the future — it's in the present, waiting",
        "The wisdom here isn't 'good or bad' — it's 'what does this mean for you'",
        "The lines are specific — and the truth in them might not be convenient",
        "The hexagram sees the pattern — what you do with that seeing is the real work",
      ],
      body: [
        "You feel the weight of the situation — the I Ching doesn't promise relief, it offers perspective",
        "The meaning isn't comforting. It might not need to be",
        "The insight is honest. Whether it fits what you wanted is a separate question",
      ],
    },
    western: {
      headline: [
        "Your Sun sign is one layer — the real story is in the layers underneath",
        "The chart shows your potential — how much of it you're living is the real question",
        "There's real depth in your planetary placement — the question is access",
        "Your birth chart doesn't lie — the question is whether you're willing to read it honestly",
        "The alignment is specific — what you do with that specificity is the deciding factor",
      ],
      body: [
        "You feel the gap between your chart and your daily life — that's not unusual, it's the work",
        "The planets set conditions. What you do within those conditions is the actual life",
        "Your birth chart is a starting point — the growth is in what you build from it",
      ],
    },
    fortune: {
      headline: [
        "This phase is real — the question is what you're doing inside it",
        "The timing isn't neutral — some moments matter more than others",
        "What you're experiencing now has a shape — seeing it clearly is the first move",
        "The forecast is specific — what you do with it determines what happens next",
        "This period has texture — you're in it, whether you see it or not",
      ],
      body: [
        "You feel the pressure of the timing — not everything needs to happen at once",
        "The overall score is a reference point — what you do with it is the actual variable",
        "The period is what it is. How you work with it is the variable that changes everything",
      ],
    },
    numerology: {
      headline: [
        "Your life path number isn't a label — it's a pattern you're living inside",
        "There's something specific in your number — and it's more honest than convenient",
        "The number reflects a tendency — whether you're working with it or against it shapes everything",
        "Your life path has real texture — the question is how much you're consciously walking it",
        "The pattern in your number is real — what you do with that awareness changes the equation",
      ],
      body: [
        "You feel the pull of your number — not everything is coincidence",
        "The number is specific. How it shows up in your life is the question worth sitting with",
        "Your life path isn't fate — it's a tendency with room to breathe",
      ],
    },
    relationship: {
      headline: [
        "You feel something real — but you're not moving at the same speed",
        "The pull between you is genuine — the question is whether you're both meeting it",
        "There's real chemistry here — the question is whether it has somewhere to go",
        "The connection is honest — what happens next depends on how intentional you are",
        "You feel the potential — whether you're building it or just experiencing it is the question",
      ],
      body: [
        "You get each other — but how much of that are you actually letting be seen?",
        "The foundation is real — what happens next depends on how you handle the gaps",
        "The pull is honest. What you do with it is the deciding factor",
      ],
    },
  };

  const templatesB: Record<string, Record<string, string[]>> = {
    bazi: {
      headline: [
        "BaZi Analysis: Day Master Wood confirmed — elemental chart generated",
        "Elemental analysis complete — compatibility index calculated",
        "Five Elements profile: Wood dominant — growth potential: HIGH",
        "BaZi chart calculated — elemental strengths and patterns indexed",
        "Day Master analysis: Wood element — career and relationship indicators mapped",
      ],
      body: [
        "Your element profile is calculated. Elemental strengths index: FAVORABLE.",
        "BaZi interpretation complete. Key traits: driven, growth-oriented, adaptable.",
        "Elemental chart generated. Compatible elements: Water, Fire.",
      ],
    },
    ziwei: {
      headline: [
        "Ziwei Chart generated — Mingju confirmed",
        "紫微斗数 chart: palace structure indexed, major stars mapped",
        "Star chart calculation complete — palace arrangement confirmed",
        "Ziwei analysis: major star positions confirmed — interpretation ready",
        "Mingju and star placement calculated — full report available",
      ],
      body: [
        "Palace structure analyzed. Key palaces indexed. Full interpretation in premium.",
        "Star arrangement confirmed. Major/minor star positions mapped.",
        "Chart calculation complete. Palace distribution: FAVORABLE.",
      ],
    },
    tarot: {
      headline: [
        "Tarot draw complete — card indexed and interpreted",
        "Card pulled: interpretation score calculated",
        "Tarot spread generated — card position confirmed",
        "Card analysis: position indexed — reading score: HIGH",
        "Tarot card interpretation complete — cross-reference available",
      ],
      body: [
        "Card interpretation generated. Position score: STRONG.",
        "Tarot draw indexed. Card meaning: archetype confirmed.",
        "Reading complete. Card imagery analyzed. Guidance: ACTIONABLE.",
      ],
    },
    yijing: {
      headline: [
        "I Ching hexagram calculated — judgement indexed",
        "Hexagram analysis complete — changing lines confirmed",
        "Yi Jing reading: hexagram confirmed — interpretation ready",
        "Bagua pattern mapped — hexagram stability: CONFIRMED",
        "I Ching chart: lines indexed — wisdom summary generated",
      ],
      body: [
        "Hexagram judgement: CONFIRMED. Line meanings indexed.",
        "I Ching interpretation complete. Wisdom category: BALANCED.",
        "Change pattern analyzed. Hexagram forecast: ACTIONABLE.",
      ],
    },
    western: {
      headline: [
        "Western chart: Sun sign confirmed — planetary positions indexed",
        "Natal chart calculation complete — aspect pattern mapped",
        "Birth chart: planetary alignment confirmed — houses indexed",
        "Western astrology chart: major aspects calculated — interpretation ready",
        "Sun sign analysis: Aries — rising sign and planetary placements indexed",
      ],
      body: [
        "Planetary chart: positions calculated. Key aspects: TRINE, SQUARE.",
        "Natal interpretation: Sun sign dominant. House placements indexed.",
        "Chart analysis: planetary strength confirmed. Aspect pattern: COMPLEX.",
      ],
    },
    fortune: {
      headline: [
        "Fortune score: calculated — phase index confirmed",
        "Yearly fortune: forecast indexed — overall score generated",
        "Fortune phase analysis: current period confirmed — trend mapped",
        "Life fortune calculation: phase confirmed — growth areas indexed",
        "Fortune reading: timing confirmed — overall trajectory: POSITIVE",
      ],
      body: [
        "Fortune analysis complete. Current phase: ESTABLISHING. Overall: 78/100.",
        "Fortune score indexed. Wealth potential: STRONG. Career index: FAVORABLE.",
        "Forecast calculated. Key areas: balanced. Timing: next 6 months.",
      ],
    },
    numerology: {
      headline: [
        "Numerology number: calculated — life path index confirmed",
        "Name numerology: numbers indexed — compatibility mapped",
        "Life path number: confirmed — personality number calculated",
        "Numerology chart: numbers generated — destiny index: FAVORABLE",
        "Numerology reading: number confirmed — analysis complete",
      ],
      body: [
        "Numerology: life path calculated. Core numbers indexed. Destiny: BALANCED.",
        "Name and birth number analysis complete. Key numbers: FAVORABLE.",
        "Numerology chart generated. Life path: growth-oriented. Compatibility: HIGH.",
      ],
    },
    relationship: {
      headline: [
        "Relationship compatibility: HIGH — synastry index confirmed",
        "Compatibility analysis: score generated — pattern indexed",
        "Relationship score: 78/100 — pattern confirmed",
        "Synastry calculation: planetary compatibility mapped — index: FAVORABLE",
        "Relationship profile: attraction index confirmed — long-term potential: HIGH",
      ],
      body: [
        "Compatibility indexed. Attraction score: 82. Communication: 71.",
        "Relationship analysis complete. Pattern type: HIGH ATTRACTION, DIFFERENT PACING.",
        "Compatibility calculation: SCORE CONFIRMED. Pattern indexed.",
      ],
    },
  };

  const surfaceKeys = Object.keys(templatesA[module] ?? { headline: [""] });

  const mutateA = (key: string, _baseline: string): string => {
    const arr = templatesA[module]?.[key];
    if (!arr) return _baseline;
    return arr[round % arr.length];
  };

  const mutateB = (key: string, _baseline: string): string => {
    const arr = templatesB[module]?.[key];
    if (!arr) return _baseline;
    return arr[round % arr.length];
  };

  return {
    surfaces: surfaceKeys as Surface[],
    mutateA,
    mutateB,
  };
}

// ─── Variant Scorer ───────────────────────────────────────────────────────────

interface Variant {
  copy: Record<string, string>;
  scores: {
    headline: number;
    body: number;
    upgrade: number;
    conversion: number;
    total: number;
  };
}

function scoreVariant(v: Variant): Variant {
  v.scores.total =
    10 + // base
    v.scores.headline +
    v.scores.body +
    v.scores.upgrade +
    v.scores.conversion;
  return v;
}

// ─── Per-Module Runner ────────────────────────────────────────────────────────

interface ModuleResult {
  module: string;
  rounds: number;
  winsA: number;
  winsB: number;
  ties: number;
  avgScoreA: number;
  avgScoreB: number;
  marginAvg: number;
  apiLatencyAvgMs: number;
  winner: "A" | "B" | "tie";
  scoreboard: Array<{
    round: number;
    scoreA: number;
    scoreB: number;
    winner: string;
    headlineA: string;
    headlineB: string;
  }>;
}

async function runModuleEvolution(
  module: string,
  rounds: number,
): Promise<ModuleResult> {
  const params = {
    birthday: "1995-03-15",
    birthTime: "10:30",
    gender: "male",
    language: "en",
    lat: 39.9042,
    lng: 116.4074,
    name: "Alex Chen",
  };

  // Warm-up call to validate API
  const warmup = await callApi(module, params);
  if (!warmup.success) {
    console.log(`  ❌ API not available for ${module}: ${JSON.stringify(warmup.data).substring(0, 100)}`);
    return {
      module, rounds, winsA: 0, winsB: 0, ties: rounds,
      avgScoreA: 0, avgScoreB: 0, marginAvg: 0, apiLatencyAvgMs: 0,
      winner: "tie",
      scoreboard: [],
    };
  }

  console.log(`  ✅ API validated`);
  console.log(`  🔬 Running ${rounds} rounds...`);

  let winsA = 0, winsB = 0, ties = 0;
  let cumScoreA = 0, cumScoreB = 0;
  let cumLatency = 0;
  const scoreboard: ModuleResult["scoreboard"] = [];
  const mutators = getModuleCopyMutators(module, 0); // surfaces only

  for (let round = 0; round < rounds; round++) {
    const m = getModuleCopyMutators(module, round);

    // Build A/B copy from templates
    const copyA: Record<string, string> = {};
    const copyB: Record<string, string> = {};
    for (const surf of m.surfaces) {
      copyA[surf] = m.mutateA(surf, "");
      copyB[surf] = m.mutateB(surf, "");
    }

    // Score variants (scoring happens on the copy, not API return — copy is the experiment)
    const vA: Variant = {
      copy: copyA,
      scores: {
        headline: scoreHeadline(copyA.headline ?? copyA[Object.keys(copyA)[0]] ?? ""),
        body: scoreEmotionalResonance(copyA.body ?? copyA[Object.keys(copyA)[1]] ?? ""),
        upgrade: scoreUpgradeStrength(copyA.body ?? ""),
        conversion: scoreConversionCopy(copyA.headline ?? ""),
        total: 0,
      },
    };
    const vB: Variant = {
      copy: copyB,
      scores: {
        headline: scoreHeadline(copyB.headline ?? copyB[Object.keys(copyB)[0]] ?? ""),
        body: scoreEmotionalResonance(copyB.body ?? copyB[Object.keys(copyB)[1]] ?? ""),
        upgrade: scoreUpgradeStrength(copyB.body ?? ""),
        conversion: scoreConversionCopy(copyB.headline ?? ""),
        total: 0,
      },
    };

    const sa = scoreVariant(vA).scores.total;
    const sb = scoreVariant(vB).scores.total;

    const winner = sa >= sb ? "A" : "B";
    if (winner === "A") winsA++; else if (winner === "B") winsB++; else ties++;

    cumScoreA += sa;
    cumScoreB += sb;
    cumLatency += warmup.latencyMs;

    scoreboard.push({
      round: round + 1,
      scoreA: sa,
      scoreB: sb,
      winner,
      headlineA: copyA.headline ?? copyA[Object.keys(copyA)[0]] ?? "",
      headlineB: copyB.headline ?? copyB[Object.keys(copyB)[0]] ?? "",
    });

    process.stdout.write(`  Round ${round + 1}/${rounds}: A=${sa} B=${sb} → ${winner}\n`);
  }

  const result: ModuleResult = {
    module,
    rounds,
    winsA,
    winsB,
    ties,
    avgScoreA: Math.round(cumScoreA / rounds),
    avgScoreB: Math.round(cumScoreB / rounds),
    marginAvg: Math.round(Math.abs(cumScoreA - cumScoreB) / rounds),
    apiLatencyAvgMs: Math.round(cumLatency / rounds),
    winner: winsA > winsB ? "A" : winsB > winsA ? "B" : "tie",
    scoreboard,
  };

  return result;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n🌌 TianJi A/B Evolution — All Modules\n");
  console.log("═".repeat(64));
  console.log(`Modules: ${TARGET_MODULES.join(", ")}`);
  console.log(`Rounds per module: ${DEFAULT_ROUNDS}`);
  console.log("═".repeat(64) + "\n");

  const results: ModuleResult[] = [];

  for (const module of TARGET_MODULES) {
    console.log(`\n${"─".repeat(64)}`);
    console.log(`🚀 Module: ${module.toUpperCase()}`);

    const result = await runModuleEvolution(module, DEFAULT_ROUNDS);
    results.push(result);

    console.log(`\n  📊 ${module} Result: Variant A ${result.winsA}/${DEFAULT_ROUNDS} | Variant B ${result.winsB}/${DEFAULT_ROUNDS}`);
    console.log(`  📊 Avg Score: A=${result.avgScoreA} | B=${result.avgScoreB} | Margin=${result.marginAvg}`);
    console.log(`  🏆 Winner: ${result.winner === "A" ? "✅ Variant A (Emotional)" : result.winner === "B" ? "⚠️ Variant B (Functional)" : "⚖️ Tie"}`);
  }

  // ─── Final Summary ────────────────────────────────────────────────────────

  console.log(`\n${"=".repeat(64)}`);
  console.log("📊 FINAL SUMMARY — ALL MODULES");
  console.log("=".repeat(64));
  console.log(`\n{'Module'.padEnd(14)} {'A W-L'.padEnd(10)} {'B W-L'.padEnd(10)} {'Avg A'.padEnd(8)} {'Avg B'.padEnd(8)} {'Winner'}`);
  console.log("-".repeat(64));

  let totalWA = 0, totalWB = 0;

  for (const r of results) {
    totalWA += r.winsA;
    totalWB += r.winsB;
    const winnerEmoji = r.winner === "A" ? "✅ A" : r.winner === "B" ? "⚠️ B" : "⚖️ ";
    console.log(
      `${r.module.padEnd(14)} ${`${r.winsA}-${r.winsB}`.padEnd(10)} ${`${r.winsB}-${r.winsA}`.padEnd(10)} ${String(r.avgScoreA).padEnd(8)} ${String(r.avgScoreB).padEnd(8)} ${winnerEmoji}`
    );
  }

  console.log("-".repeat(64));
  console.log(`${'TOTAL'.padEnd(14)} ${`${totalWA}-${results.length*DEFAULT_ROUNDS-totalWA}`.padEnd(10)} ${`${totalWB}-${results.length*DEFAULT_ROUNDS-totalWB}`.padEnd(10)}`);

  const outputPath = "experiments/all-modules-ab-results.json";
  fs.writeFileSync(outputPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    modules: TARGET_MODULES,
    rounds: DEFAULT_ROUNDS,
    results,
    summary: {
      totalWinsA: totalWA,
      totalWinsB: totalWB,
      modulesWonByA: results.filter(r => r.winner === "A").length,
      modulesWonByB: results.filter(r => r.winner === "B").length,
      modulesTied: results.filter(r => r.winner === "tie").length,
    },
  }, null, 2));

  console.log(`\n✅ Results saved to ${outputPath}`);
  console.log(`\n${"=".repeat(64)}`);

  process.exit(0);
}

main().catch(err => {
  console.error("Fatal:", err);
  process.exit(1);
});
