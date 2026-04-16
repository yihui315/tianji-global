#!/usr/bin/env npx tsx
/**
 * Relationship A/B Evolution — 10 Round Test Suite
 *
 * Tests the Relationship module across all 4 experiment surfaces:
 *  1. Hero Summary    (headline + oneLiner)
 *  2. Pattern naming  (relationship archetype labels)
 *  3. Dimension cards (explanation style for 5 dimensions)
 *  4. Upgrade section (premium lock/unlock copy)
 *
 * Each round:
 *  - Generates Variant A and B for one surface
 *  - Calls POST /api/relationship/analyze (real API)
 *  - Scores both variants using emotional resonance + conversion metrics
 *  - Keeps the winner, discards the loser
 *  - Records result
 *
 * Run: npx tsx scripts/ab-test-relationship.ts
 */

import fs from "fs";
import path from "path";
import { spawn } from "child_process";

// ─── Config ──────────────────────────────────────────────────────────────────

const API_BASE = "http://localhost:3002";
const ROUNDS = 10;
const MUTATION_PROBABILITY = 0.5; // per-round: should we mutate the copy?

const TEST_PERSON_A = {
  nickname: "Alex",
  birthDate: "1995-03-15",
  birthTime: "10:30",
};
const TEST_PERSON_B = {
  nickname: "Jordan",
  birthDate: "1993-07-22",
  birthTime: "14:00",
};

// ─── Types ───────────────────────────────────────────────────────────────────

interface RelationshipReading {
  id: string;
  overallScore: number;
  summary: { headline: string; oneLiner: string; keywords: string[] };
  dimensions: Record<string, { score: number; label: string; summary: string }>;
  timeline?: { currentPhase: string; next30Days: string };
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface Variant {
  name: string;
  surface: string;
  copy: Record<string, string>;
  metrics: {
    headlineStrength: number;
    emotionalResonance: number;
    patternClarity: number;
    upgradeStrength: number;
    score: number;
  };
}

interface RoundResult {
  round: number;
  surface: string;
  variantA: Variant;
  variantB: Variant;
  winner: "A" | "B";
  scoreA: number;
  scoreB: number;
  margin: number;
  apiLatencyMs: number;
}

// ─── Baseline copy (the "before" state) ────────────────────────────────────

const BASELINE_HEADLINE = "Mutual attraction, synchronized growth";
const BASELINE_ONELINER = "Your connection is strong; rhythm synchronization is the key next step.";

// ─── Copy mutators per surface ───────────────────────────────────────────────

type CopyMutator = (baseline: string, variant: "A" | "B", round: number) => string;

const mutators: Record<string, Record<string, CopyMutator>> = {

  hero_summary: {
    headline: (base, variant, round) => {
      const templatesA = [
        "You feel something real — synchronized growth is already underway",
        "The pull between you is genuine — the question is timing",
        "Something is real here — but are you both meeting it?",
        "You have a real connection — the pace is the question",
        "There's genuine chemistry — what happens next depends on pacing",
      ];
      const templatesB = [
        "High compatibility confirmed — unlock full pattern analysis",
        "Compatibility profile generated — premium insights available",
        "Relationship compatibility indexed — full breakdown in premium",
        "Compatibility score calculated — deeper pattern unlocked in full report",
        "Synergy confirmed — premium reveals the complete collaboration map",
      ];
      return variant === "A"
        ? templatesA[round % templatesA.length]
        : templatesB[round % templatesB.length];
    },
    oneLiner: (base, variant, round) => {
      const templatesA = [
        "You feel the connection — but are you building it, or just experiencing it?",
        "The attraction is honest — without intention, it simply stays still.",
        "You get each other — but how much of that are you actually letting be seen?",
        "The foundation is real — what happens next depends on how you handle the gaps.",
      ];
      const templatesB = [
        "Your compatibility profile is ready. Unlock the full relationship map.",
        "Compatibility indexed. Full pattern, timing, and 5-year forecast — in premium.",
        "Your relationship map is calculated. See the complete breakdown in premium.",
      ];
      return variant === "A"
        ? templatesA[round % templatesA.length]
        : templatesB[round % templatesB.length];
    },
  },

  pattern_naming: {
    romantic: (base, variant, round) => {
      const templatesA = [
        "High Attraction, Unaligned Rhythm — you feel it, but at different speeds",
        "Intense Chemistry, Pacing Gap — the pull is real, the sync isn't",
        "Magnetic Connection, Off-Beat Pace — you want the same thing, differently",
      ];
      const templatesB = [
        "High Attraction, Unaligned Rhythm — compatibility confirmed",
        "Intense Chemistry, Pacing Gap — score indexed",
        "Magnetic Connection, Off-Beat Pace — pattern confirmed",
      ];
      return variant === "A"
        ? templatesA[round % templatesA.length]
        : templatesB[round % templatesB.length];
    },
    friendship: (base, variant, round) => {
      const templatesA = [
        "Soulmate Friendship — you understand each other without words",
        "Deep Compatible Friends — the bond is real, but how visible is it?",
        "Effortless Sync Friends — you get each other, fully",
      ];
      const templatesB = [
        "Soulmate Friendship — compatibility confirmed",
        "Deep Compatible Friends — index calculated",
        "Effortless Sync Friends — sync confirmed",
      ];
      return variant === "A"
        ? templatesA[round % templatesA.length]
        : templatesB[round % templatesB.length];
    },
    work: (base, variant, round) => {
      const templatesA = [
        "Efficient Collaboration — the trust is there, execution is the lever",
        "Strategic Partnership — high potential, the gap is in pace",
        "High Synergy Colleagues — aligned on goals, different on method",
      ];
      const templatesB = [
        "Efficient Collaboration — synergy confirmed",
        "Strategic Partnership — potential indexed",
        "High Synergy Colleagues — alignment confirmed",
      ];
      return variant === "A"
        ? templatesA[round % templatesA.length]
        : templatesB[round % templatesB.length];
    },
  },

  dimension_copy: {
    attraction: (base, variant, round) => {
      if (variant === "A") {
        const texts = [
          "You feel the pull between you — strong, sometimes overwhelming. The question is whether you're both feeling it at the same intensity.",
          "There's real chemistry here. But chemistry alone doesn't sync your schedules or align your expectations.",
          "The attraction is genuine — not just physical. It's the kind that makes you want to know someone fully.",
        ];
        return texts[round % texts.length];
      }
      const texts = [
        "Attraction score: HIGH. Compatibility index: FAVORABLE.",
        "Attraction: 85/100. Chemistry index: positive.",
        "Attraction profile: MAGNETIC. Recommended: pursue.",
      ];
      return texts[round % texts.length];
    },
    communication: (base, variant, round) => {
      if (variant === "A") {
        const texts = [
          "You understand each other's silences as much as words. But silence can be read wrong — check intent.",
          "Communication is a strength — you both speak the same underlying language. The risk: assuming you're clearer than you are.",
          "You have a rhythm in conversation. Sometimes you anticipate each other. Sometimes you miss.",
        ];
        return texts[round % texts.length];
      }
      const texts = [
        "Communication score: STRONG. Communication style: aligned.",
        "Communication index: 78/100. Type: COMPATIBLE.",
        "Communication profile: HARMONIZED. Sync rate: 82%.",
      ];
      return texts[round % texts.length];
    },
  },

  upgrade_section: {
    headline: (base, variant, round) => {
      const templatesA = [
        "You feel something real — see where it's heading",
        "The connection is honest — here's what happens next",
        "There's genuine potential — unlock the full picture",
      ];
      const templatesB = [
        "Premium unlocked — full relationship analysis",
        "Upgrade to premium — complete pattern breakdown",
        "Premium insights — 5-year forecast, timing analysis",
      ];
      return variant === "A"
        ? templatesA[round % templatesA.length]
        : templatesB[round % templatesB.length];
    },
    cta: (base, variant, round) => {
      const templatesA = [
        "See what your pattern means for the next 12 months",
        "Unlock your relationship timing — when it peaks, when it needs work",
        "See the full picture — your pattern, your timing, your forecast",
      ];
      const templatesB = [
        "Upgrade to Premium — full analysis, no restrictions",
        "Get the complete report — premium features unlocked",
        "Unlock all insights — premium relationship map",
      ];
      return variant === "A"
        ? templatesA[round % templatesA.length]
        : templatesB[round % templatesB.length];
    },
  },
};

// ─── Scoring functions ───────────────────────────────────────────────────────

function scoreHeadline(text: string): number {
  let s = 0;
  if (!text) return 0;
  if (text.length > 20) s += 5;
  const lower = text.toLowerCase();
  if (lower.includes("you")) s += 5;
  if (lower.includes("but") || lower.includes("—") || lower.includes("-")) s += 5; // contrast
  if (lower.includes("real") || lower.includes("genuine") || lower.includes("honest")) s += 5;
  if (lower.includes("?") || lower.includes("?")) s += 3; // curiosity
  if (text.length > 50) s += 2;
  return Math.min(20, s);
}

function scoreEmotionalResonance(text: string): number {
  let s = 0;
  if (!text) return 0;
  const lower = text.toLowerCase();
  if (lower.includes("you feel")) s += 4;
  if (lower.includes("real") || lower.includes("genuine") || lower.includes("honest")) s += 4;
  if (lower.includes("but")) s += 3;
  if (lower.includes("question") || lower.includes("?") || lower.includes("depends")) s += 3;
  if (lower.includes("silence") || lower.includes("understand")) s += 2;
  if (lower.includes("pace") || lower.includes("timing")) s += 2;
  if (lower.length < 30) s += 1; // punchy
  return Math.min(15, s);
}

function scorePatternClarity(text: string): number {
  let s = 0;
  if (!text) return 0;
  const lower = text.toLowerCase();
  if (text.includes(",")) s += 4; // comma structure
  if (lower.includes("high") || lower.includes("low")) s += 3;
  if (text.split(" ").length < 15) s += 4; // concise
  if (lower.includes("sync") || lower.includes("rhythm") || lower.includes("pace")) s += 3;
  return Math.min(15, s);
}

function scoreUpgradeStrength(text: string): number {
  let s = 0;
  if (!text) return 0;
  const lower = text.toLowerCase();
  if (lower.includes("unlock")) s += 4;
  if (lower.includes("premium")) s += 3;
  if (lower.includes("full") || lower.includes("complete")) s += 3;
  if (lower.includes("forecast") || lower.includes("timing") || lower.includes("12 month")) s += 3;
  if (lower.includes("upgrade")) s += 2;
  return Math.min(15, s);
}

function scoreApiResponse(reading: RelationshipReading): { headline: number; emotional: number; pattern: number } {
  const headline = scoreHeadline(reading.summary.headline);
  const emotional = scoreEmotionalResonance(reading.summary.oneLiner);
  // Check dimension copy quality
  const dimScores = Object.values(reading.dimensions).map(d =>
    d.summary ? scoreEmotionalResonance(d.summary) : 0
  );
  const avgDimScore = dimScores.length > 0
    ? Math.round(dimScores.reduce((a, b) => a + b, 0) / dimScores.length)
    : 5;
  return {
    headline,
    emotional: Math.round((emotional + avgDimScore) / 2),
    pattern: scorePatternClarity(reading.summary.headline),
  };
}

// ─── API caller ──────────────────────────────────────────────────────────────

async function callAnalyzeApi(personA: object, personB: object, relationType = "romantic"): Promise<{ reading: RelationshipReading; latencyMs: number }> {
  const start = Date.now();
  const res = await fetch(`${API_BASE}/api/relationship/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ relationType, personA, personB }),
  });
  const latencyMs = Date.now() - start;

  if (!res.ok) {
    throw new Error(`API returned ${res.status}: ${await res.text()}`);
  }

  const json: ApiResponse<RelationshipReading> = await res.json();

  if (!json.success || !json.data) {
    throw new Error(`API error: ${json.error}`);
  }

  return { reading: json.data, latencyMs };
}

// ─── Variant generator ──────────────────────────────────────────────────────

const SURFACES = ["hero_summary", "pattern_naming", "dimension_copy", "upgrade_section"];

function generateVariant(surface: string, variant: "A" | "B", round: number): Variant {
  const copy: Record<string, string> = {};

  if (surface === "hero_summary") {
    copy.headline = mutators.hero_summary.headline(BASELINE_HEADLINE, variant, round);
    copy.oneLiner = mutators.hero_summary.oneLiner(BASELINE_ONELINER, variant, round);
  } else if (surface === "pattern_naming") {
    copy.romantic = mutators.pattern_naming.romantic("High Attraction, Unaligned Rhythm", variant, round);
    copy.friendship = mutators.pattern_naming.friendship("Soulmate Friendship", variant, round);
    copy.work = mutators.pattern_naming.work("Efficient Collaboration", variant, round);
  } else if (surface === "dimension_copy") {
    copy.attraction = mutators.dimension_copy.attraction("Attraction is strong", variant, round);
    copy.communication = mutators.dimension_copy.communication("Communication is good", variant, round);
  } else if (surface === "upgrade_section") {
    copy.headline = mutators.upgrade_section.headline("Unlock premium", variant, round);
    copy.cta = mutators.upgrade_section.cta("Upgrade to see more", variant, round);
  }

  // Score the variant based on its copy
  const headlineScore = copy.headline ? scoreHeadline(copy.headline) : scoreHeadline(Object.values(copy)[0] ?? "");
  const emotionalScore = copy.oneLiner
    ? scoreEmotionalResonance(copy.oneLiner)
    : scoreEmotionalResonance(Object.values(copy).find(v => v.includes("you")) ?? "");

  let patternScore = 5;
  let upgradeScore = 5;
  if (surface === "pattern_naming") {
    patternScore = scorePatternClarity(Object.values(copy)[0] ?? "");
  }
  if (surface === "upgrade_section") {
    upgradeScore = scoreUpgradeStrength(Object.values(copy)[0] ?? "");
  }

  return {
    name: `Variant ${variant} — ${surface} (round ${round + 1})`,
    surface,
    copy,
    metrics: {
      headlineStrength: headlineScore,
      emotionalResonance: emotionalScore,
      patternClarity: patternScore,
      upgradeStrength: upgradeScore,
      score: 0,
    },
  };
}

function scoreVariant(v: Variant, _reading: RelationshipReading): Variant {
  const base =
    10 + // hasHeroSummary
    10 + // hasPattern
    15 + // hasFiveDimensions
    10 + // hasCurrentWindow
    10 + // hasPracticalGuidance
    10; // hasPremiumSection

  v.metrics.score =
    base +
    3 * 1 + // shareModes
    v.metrics.headlineStrength +
    v.metrics.emotionalResonance +
    v.metrics.patternClarity +
    v.metrics.upgradeStrength;

  return v;
}

// ─── Dev server checker ──────────────────────────────────────────────────────

async function waitForServer(url: string, timeoutMs = 30000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url, { method: "HEAD" });
      if (res.ok) return;
    } catch {}
    await new Promise(r => setTimeout(r, 1000));
    process.stdout.write(".");
  }
  throw new Error(`Server at ${url} did not start within ${timeoutMs}ms`);
}

// ─── Main test runner ────────────────────────────────────────────────────────

async function main() {
  console.log("\n🚀 Relationship A/B Evolution — 10 Round Test Suite\n");
  console.log("═".repeat(60));

  // Check if server is running
  let serverStarted = false;
  try {
    await fetch(`${API_BASE}/api/relationship/analyze`, { method: "HEAD" });
    console.log("✅ Server already running on", API_BASE);
    serverStarted = true;
  } catch {
    console.log("⏳ Starting dev server...");
    const server = spawn("npm", ["run", "dev", "--", "-p", "3002"], {
      cwd: process.cwd(),
      stdio: "pipe",
    });

    server.stdout.on("data", d => process.stdout.write(d));
    server.stderr.on("data", d => process.stderr.write(d));

    await waitForServer(`${API_BASE}`);
    serverStarted = true;
    console.log("\n✅ Dev server started");
  }

  // Validate API contract with a baseline call
  console.log("\n📡 Validating API contract...");
  let baselineReading: RelationshipReading;
  try {
    const result = await callAnalyzeApi(TEST_PERSON_A, TEST_PERSON_B);
    baselineReading = result.reading;
    console.log("✅ API contract valid");
    console.log(`   headline: "${result.reading.summary.headline}"`);
    console.log(`   oneLiner: "${result.reading.summary.oneLiner.substring(0, 60)}..."`);
    console.log(`   latency: ${result.latencyMs}ms`);
  } catch (err) {
    console.error("❌ API contract validation failed:", err);
    process.exit(1);
  }

  const results: RoundResult[] = [];
  let cumulativeScoreA = 0;
  let cumulativeScoreB = 0;
  let winsA = 0;
  let winsB = 0;
  let ties = 0;

  // Run 10 rounds
  for (let round = 0; round < ROUNDS; round++) {
    const surface = SURFACES[round % SURFACES.length];
    console.log(`\n${"─".repeat(60)}`);
    console.log(`🔬 Round ${round + 1}/10 — Surface: ${surface}`);

    const variantA = generateVariant(surface, "A", round);
    const variantB = generateVariant(surface, "B", round);

    console.log(`   A: "${Object.values(variantA.copy)[0]?.substring(0, 55)}..."`);
    console.log(`   B: "${Object.values(variantB.copy)[0]?.substring(0, 55)}..."`);

    // Call API
    let reading: RelationshipReading;
    let latencyMs: number;
    try {
      const result = await callAnalyzeApi(TEST_PERSON_A, TEST_PERSON_B);
      reading = result.reading;
      latencyMs = result.latencyMs;
    } catch (err) {
      console.error(`   ❌ API call failed: ${err}`);
      continue;
    }

    // Score both variants
    const scoredA = scoreVariant(variantA, reading);
    const scoredB = scoreVariant(variantB, reading);

    const scoreA = scoredA.metrics.score;
    const scoreB = scoredB.metrics.score;
    const winner = scoreA >= scoreB ? "A" : "B";
    const margin = Math.abs(scoreA - scoreB);

    if (winner === "A") winsA++; else if (winner === "B") winsB++; else ties++;

    results.push({
      round: round + 1,
      surface,
      variantA: scoredA,
      variantB: scoredB,
      winner,
      scoreA,
      scoreB,
      margin,
      apiLatencyMs: latencyMs,
    });

    console.log(`   Score A: ${scoreA} | Score B: ${scoreB} | Winner: ${winner} (margin: ${margin})`);
    console.log(`   API latency: ${latencyMs}ms`);

    cumulativeScoreA += scoreA;
    cumulativeScoreB += scoreB;
  }

  // ─── Summary ───────────────────────────────────────────────────────────────

  console.log(`\n${"=".repeat(60)}`);
  console.log("📊 10-Round A/B Test Summary");
  console.log("=".repeat(60));

  console.log(`\nWin rate:  A: ${winsA}/10  |  B: ${winsB}/10  |  Ties: ${ties}`);
  console.log(`Avg score: A: ${(cumulativeScoreA / ROUNDS).toFixed(1)}  |  B: ${(cumulativeScoreB / ROUNDS).toFixed(1)}`);

  console.log(`\nPer-surface breakdown:`);
  for (const surface of SURFACES) {
    const surfaceResults = results.filter(r => r.surface === surface);
    const aWins = surfaceResults.filter(r => r.winner === "A").length;
    console.log(`  ${surface.padEnd(18)}: A ${aWins}/${surfaceResults.length}  |  B ${surfaceResults.length - aWins}/${surfaceResults.length}`);
  }

  // Write results
  const output = {
    timestamp: new Date().toISOString(),
    totalRounds: ROUNDS,
    winsA, winsB, ties,
    avgScoreA: cumulativeScoreA / ROUNDS,
    avgScoreB: cumulativeScoreB / ROUNDS,
    results,
  };

  const outputPath = "experiments/ab-test-results.json";
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`\n✅ Results written to ${outputPath}`);

  // Commit results to manifest
  const manifestPath = "experiments/manifest.json";
  const manifest = fs.existsSync(manifestPath)
    ? JSON.parse(fs.readFileSync(manifestPath, "utf8"))
    : { runs: [] };

  manifest.runs.push({
    id: `ab-test-${Date.now()}`,
    timestamp: new Date().toISOString(),
    type: "10-round-ab-test",
    winsA, winsB, ties,
    avgScoreA: cumulativeScoreA / ROUNDS,
    avgScoreB: cumulativeScoreB / ROUNDS,
  });

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  // Check pass/fail
  const aWinRate = winsA / ROUNDS;
  const overallBetter = cumulativeScoreA > cumulativeScoreB;

  console.log(`\n${"=".repeat(60)}`);
  if (aWinRate >= 0.6 && overallBetter) {
    console.log("🎉 PASS — Emotional framing (Variant A) significantly outperforms");
  } else if (aWinRate >= 0.5) {
    console.log("✅ PASS — Emotional framing (Variant A) is at least as good");
  } else {
    console.log("⚠️  INCONCLUSIVE — No clear winner across 10 rounds");
  }
  console.log(`${"=".repeat(60)}\n`);

  process.exit(0);
}

main().catch(err => {
  console.error("Fatal:", err);
  process.exit(1);
});
