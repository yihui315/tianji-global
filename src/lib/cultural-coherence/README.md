# Cultural Coherence Checker

八字/紫微斗数/七政四余/西方占星 报告内容文化一致性检查

## Usage

```typescript
import { checkCoherence, validateReport, type SystemType } from '@/lib/cultural-coherence';

const result = checkCoherence('报告内容...', 'bazi');
if (!result.valid) {
  console.error('文化污染检测失败:', result.violations);
}

// Pipeline-friendly version
const { passed, errors, warnings } = validateReport('报告内容...', 'bazi');
```
