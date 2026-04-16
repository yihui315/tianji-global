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
