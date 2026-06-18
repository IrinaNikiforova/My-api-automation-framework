
import fs from 'fs';
import path from 'path';

interface Metrics {
  totalFiles: number;
  totalCases: number;
  e2eFiles: number;
  e2eCases: number;
}

const metrics: Metrics = {
  totalFiles: 0,
  totalCases: 0,
  e2eFiles: 0,
  e2eCases: 0,
};

const EXCLUDED_DIRS = [
  'node_modules',
  'dist',
  'build',
  'coverage',
  'playwright-report',
  'test-results',
];

const TEST_FILE_REGEX = /\.(spec|test)\.ts$/;

const TEST_CASE_REGEX =
  /test\.(only|skip|fixme)\s*\(|(?<!\.)test\s*\(/g;

function isE2E(filePath: string): boolean {
  const normalized = filePath.toLowerCase();

  return (
    normalized.includes('/e2e/') ||
    normalized.includes('\\e2e\\') ||
    normalized.includes('end-to-end')
  );
}

function countTests(content: string): number {
  const matches = content.match(TEST_CASE_REGEX);
  return matches ? matches.length : 0;
}

function walk(dir: string): void {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (
      entry.isDirectory() &&
      EXCLUDED_DIRS.includes(entry.name)
    ) {
      continue;
    }

    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      walk(fullPath);
      continue;
    }

    if (!TEST_FILE_REGEX.test(entry.name)) {
      continue;
    }

    metrics.totalFiles++;

    const content = fs.readFileSync(fullPath, 'utf8');
    const testCount = countTests(content);

    metrics.totalCases += testCount;

    if (isE2E(fullPath)) {
      metrics.e2eFiles++;
      metrics.e2eCases += testCount;
    }
  }
}

walk(process.cwd());

console.log(JSON.stringify(metrics, null, 2));

