import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

type CsvRow = Record<string, string>;

const repoRoot = process.cwd();
const queueDir = path.join(repoRoot, 'assets', 'marketing', 'publishing-queue');
const dataDir = path.join(repoRoot, 'data');
const reportDir = path.join(repoRoot, '.ai', 'reports');
const reportDate = process.env.GROWTH_REPORT_DATE || process.argv[2] || new Date().toISOString().slice(0, 10);

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && inQuotes && next === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  values.push(current);
  return values;
}

function parseCsv(input: string): CsvRow[] {
  const lines = input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? '']));
  });
}

async function readCsvIfExists(filePath: string): Promise<CsvRow[]> {
  try {
    return parseCsv(await readFile(filePath, 'utf8'));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw error;
  }
}

async function readPublishingQueueRows(): Promise<CsvRow[]> {
  try {
    const files = await readdir(queueDir);
    const csvFiles = files.filter((file) => file.endsWith('.csv'));
    const rows = await Promise.all(
      csvFiles.map((file) => readCsvIfExists(path.join(queueDir, file))),
    );

    return rows.flat();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw error;
  }
}

function toNumber(value: string | undefined): number {
  if (!value) return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function sum(rows: CsvRow[], field: string): number {
  return rows.reduce((total, row) => total + toNumber(row[field]), 0);
}

function sumAny(rows: CsvRow[], fields: string[]): number {
  return fields.reduce((total, field) => total + sum(rows, field), 0);
}

function rowMatchesDate(row: CsvRow, date: string): boolean {
  const rowDate = row.date || row.publish_date || '';
  return rowDate === date;
}

function rankedBy(rows: CsvRow[], field: string, labelField: string): string {
  const ranked = rows
    .map((row) => ({
      label: row[labelField] || row.title || row.id || 'untitled',
      value: toNumber(row[field]),
    }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 3);

  if (ranked.length === 0) return 'no real data yet';
  return ranked.map((item) => `${item.label} (${field}: ${item.value})`).join('; ');
}

function bestChannel(rows: CsvRow[]): string {
  const byChannel = new Map<string, number>();

  for (const row of rows) {
    const channel = row.channel || 'unknown';
    const score = toNumber(row.clicks) + toNumber(row.leads) + toNumber(row.paid_conversions);
    byChannel.set(channel, (byChannel.get(channel) ?? 0) + score);
  }

  const ranked = [...byChannel.entries()]
    .filter(([, score]) => score > 0)
    .sort((a, b) => b[1] - a[1]);

  if (ranked.length === 0) return 'no real data yet';
  return `${ranked[0][0]} (score: ${ranked[0][1]})`;
}

async function main() {
  const queueRows = await readPublishingQueueRows();
  const kpiRows = await readCsvIfExists(path.join(dataDir, 'love-test-marketing-kpi.csv'));
  const todayQueueRows = queueRows.filter((row) => rowMatchesDate(row, reportDate));
  const todayKpiRows = kpiRows.filter((row) => rowMatchesDate(row, reportDate));

  const clicks = sumAny(todayQueueRows, ['clicks']) + sumAny(todayKpiRows, ['clicks']);
  const leadCount =
    sumAny(todayQueueRows, ['leads', 'love_test_starts']) +
    sumAny(todayKpiRows, ['leads', 'love_test_starts']);
  const paidConversions =
    sumAny(todayQueueRows, ['paid_conversions']) +
    sumAny(todayKpiRows, ['paid_conversions']);
  const revenue = sumAny(todayQueueRows, ['revenue']) + sumAny(todayKpiRows, ['revenue']);
  const hasRealData = clicks > 0 || leadCount > 0 || paidConversions > 0 || revenue > 0;
  const noDataLine = hasRealData ? '' : '\n> no real data yet\n';

  const weakHookRows = todayQueueRows.filter(
    (row) => toNumber(row.impressions) > 0 && toNumber(row.clicks) === 0,
  );

  const report = `# TianJi Love Growth Daily Report - ${reportDate}
${noDataLine}
## Metrics

- Today's lead count: ${hasRealData ? leadCount : 'no real data yet'}
- Clicks: ${hasRealData ? clicks : 'no real data yet'}
- Paid conversions: ${hasRealData ? paidConversions : 'no real data yet'}
- Revenue: ${hasRealData ? revenue : 'no real data yet'}

## Hooks

- Top hooks: ${rankedBy(todayQueueRows, 'clicks', 'hook')}
- Weak hooks: ${hasRealData ? rankedBy(weakHookRows, 'impressions', 'hook') : 'no real data yet'}

## Channel

- Best channel: ${bestChannel(todayQueueRows)}

## Tomorrow Recommendation

${hasRealData
    ? 'Repeat the best real hook/channel pattern and keep every queued item under manual review.'
    : 'Collect real clicks/leads from manual publishing before changing the growth plan.'}

## Go/No-Go

- Growth reporting: ${hasRealData ? 'Go for manual analysis' : 'No-Go for performance conclusions'}
- Lead Capture Gate: ${hasRealData ? 'Go for observed local/manual data' : 'No-Go until real lead data exists'}
- Revenue execution: No-Go
- Paid smoke: No-Go
- Production deploy: No-Go
`;

  await mkdir(reportDir, { recursive: true });
  await writeFile(path.join(reportDir, `growth-report-${reportDate}.md`), report, 'utf8');
}

main().catch((error) => {
  console.error('[growth-daily-report] failed', error);
  process.exitCode = 1;
});
