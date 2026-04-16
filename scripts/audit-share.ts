import fs from "fs";
import path from "path";

const errors: string[] = [];

// Check share panel has privacy safeguards
const shareFiles = [
  "src/components/share/SharePanel.tsx",
  "src/components/SharePanel.tsx",
];

let hasSharePanel = false;
for (const f of shareFiles) {
  if (fs.existsSync(f)) {
    hasSharePanel = true;
    const content = fs.readFileSync(f, "utf8");
    // Must have age gate or privacy notice
    if (!/(age|年龄|privacy|隐私|consent|同意)/i.test(content)) {
      errors.push(`${f}: Missing privacy safeguard text`);
    }
  }
}

if (!hasSharePanel) {
  errors.push("No share panel found in expected locations");
}

const result = { ok: errors.length === 0, errors };
fs.writeFileSync("audit-share.json", JSON.stringify(result, null, 2));
console.log("Share audit:", errors.length === 0 ? "✅ OK" : `❌ ${errors.length} issues`);
errors.forEach((e) => console.log(" -", e));
