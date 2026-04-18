const fs = require('node:fs');
const path = require('node:path');

type RouteCheck = {
  label: string;
  candidates: string[];
};

const routeChecks: RouteCheck[] = [
  {
    label: 'homepage',
    candidates: ['src/app/page.tsx', 'src/app/(main)/page.tsx'],
  },
  {
    label: 'pricing page',
    candidates: ['src/app/pricing/page.tsx', 'src/app/(main)/pricing/page.tsx'],
  },
  {
    label: 'relationship flow',
    candidates: ['src/app/relationship/page.tsx', 'src/app/relationship/new/page.tsx'],
  },
  {
    label: 'fortune page',
    candidates: ['src/app/fortune/page.tsx', 'src/app/(main)/fortune/page.tsx'],
  },
  {
    label: 'result page',
    candidates: ['src/app/(main)/reading/[id]/page.tsx', 'src/app/(main)/report/[id]/page.tsx'],
  },
];

function resolveExisting(candidates: string[]): string | null {
  for (const candidate of candidates) {
    const absolute = path.resolve(process.cwd(), candidate);
    if (fs.existsSync(absolute)) {
      return candidate;
    }
  }

  return null;
}

const missing: RouteCheck[] = [];

for (const check of routeChecks) {
  if (!resolveExisting(check.candidates)) {
    missing.push(check);
  }
}

if (missing.length > 0) {
  console.error('Missing required routes or route files:');
  for (const check of missing) {
    console.error(`- ${check.label}: expected one of ${check.candidates.join(', ')}`);
  }
  process.exit(1);
}

console.log('audit-routes: OK');

export {};
import { execSync } from "child_process";
import fs from "fs";

const errors: string[] = [];

function checkRoute(file: string): boolean {
  if (!fs.existsSync(file)) {
    errors.push(`Missing route file: ${file}`);
    return false;
  }
  return true;
}

// Check main routes exist
const routes = [
  "src/app/(main)/page.tsx",
  "src/app/(main)/ziwei/page.tsx",
  "src/app/(main)/bazi/page.tsx",
  "src/app/(main)/yijing/page.tsx",
  "src/app/(main)/tarot/page.tsx",
  "src/app/(main)/love-match/page.tsx",
  "src/app/(main)/relationship/page.tsx",
];

routes.forEach((r) => checkRoute(r));

// Build test
try {
  execSync("npm run build", { stdio: "pipe", timeout: 120000 });
} catch (e: any) {
  errors.push(`Build failed: ${e.message}`);
}

const result = {
  ok: errors.length === 0,
  errors,
};

fs.writeFileSync("audit-routes.json", JSON.stringify(result, null, 2));
console.log("Routes audit:", errors.length === 0 ? "✅ OK" : `❌ ${errors.length} errors`);
errors.forEach((e) => console.log(" -", e));
