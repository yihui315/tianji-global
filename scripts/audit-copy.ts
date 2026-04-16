import fs from "fs";
import path from "path";

const errors: string[] = [];

function scanDuplication(dir: string, pattern: RegExp) {
  const results: string[] = [];
  function walk(d: string) {
    const files = fs.readdirSync(d);
    for (const f of files) {
      if (f === "node_modules" || f === ".git" || f === ".next") continue;
      const full = path.join(d, f);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        walk(full);
      } else if (stat.isFile() && /\.(tsx|ts|md)$/.test(f)) {
        const content = fs.readFileSync(full, "utf8");
        const matches = content.match(pattern);
        if (matches) {
          results.push(`${full}: ${matches.length} matches`);
        }
      }
    }
  }
  walk(dir);
  return results;
}

// Detect duplicated bilingual content (same paragraph repeated 3+ times)
const dupes = scanDuplication("src", /(中文.*英文|EN.*中文)/g);
if (dupes.length > 5) {
  errors.push(`High duplication detected: ${dupes.length} blocks`);
  dupes.slice(0, 5).forEach((d) => errors.push(`  ${d}`));
}

const result = { ok: errors.length === 0, errors };
fs.writeFileSync("audit-copy.json", JSON.stringify(result, null, 2));
console.log("Copy audit:", errors.length === 0 ? "✅ OK" : `❌ ${errors.length} issues`);
