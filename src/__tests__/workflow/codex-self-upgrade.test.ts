import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('codex-self-upgrade workflow', () => {
  it('reads the monetization program and self-driving growth skill', () => {
    const workflowPath = path.resolve(process.cwd(), '.github/workflows/codex-self-upgrade.yml');
    const workflow = fs.readFileSync(workflowPath, 'utf8');

    expect(workflow).toContain('program.md');
    expect(workflow).toContain('.claude/skills/tianji-self-driving-growth.md');
    expect(workflow).toContain('Follow the program and skill constraints');
  });
});
