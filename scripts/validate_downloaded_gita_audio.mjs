import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const VERSE_COUNTS = [47, 72, 43, 42, 29, 47, 30, 28, 34, 42, 55, 20, 35, 27, 20, 24, 28, 78];
const VARIANTS = [
  ["sanskrit", "male"], ["sanskrit", "female"],
  ["english", "male"], ["english", "female"],
  ["hindi", "male"], ["hindi", "female"],
];

function valueFor(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

function printUsage() {
  console.log(`
Validate a local download of all Bhagavad Gita audio files.

Usage:
  node validate_downloaded_gita_audio.mjs [options]

Options:
  --output PATH        Download root to validate. Default: ./bhagavad-gita-audio
  --json-report PATH   Optional path to save a detailed JSON result.
  --help               Show this help message.

The validator expects exactly 4,206 files under:
  PATH/data/audio/{chapter}/{verse}/chapter-{chapter}-verse-{verse}-{language}-{gender}.wav

It checks every expected filename, detects missing/extra WAV and .part files, and validates
each WAV as 24 kHz mono 16-bit PCM. It runs entirely offline and exits with code 1 on failure.
`);
}

if (process.argv.includes("--help")) {
  printUsage();
  process.exit(0);
}

const outputRoot = path.resolve(valueFor("--output") ?? "bhagavad-gita-audio");
const audioRoot = path.join(outputRoot, "data", "audio");
const jsonReportPath = valueFor("--json-report");

function assertPcmWavHeader(bytes, filePath) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const text = (start, length) => Buffer.from(bytes.subarray(start, start + length)).toString("ascii");
  if (
    bytes.length < 44 || text(0, 4) !== "RIFF" || text(8, 4) !== "WAVE" || text(12, 4) !== "fmt " ||
    view.getUint16(20, true) !== 1 || view.getUint16(22, true) !== 1 ||
    view.getUint32(24, true) !== 24000 || view.getUint16(34, true) !== 16
  ) throw new Error(`${filePath}: not a 24 kHz mono 16-bit PCM WAV.`);
}

async function findFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async entry => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return findFiles(entryPath);
    return entry.isFile() ? [entryPath] : [];
  }));
  return nested.flat();
}

const expected = [];
for (let chapter = 1; chapter <= VERSE_COUNTS.length; chapter += 1) {
  for (let verse = 1; verse <= VERSE_COUNTS[chapter - 1]; verse += 1) {
    for (const [language, gender] of VARIANTS) {
      const filename = `chapter-${chapter}-verse-${verse}-${language}-${gender}.wav`;
      expected.push(path.join(audioRoot, String(chapter), String(verse), filename));
    }
  }
}

const results = {
  validatedAt: new Date().toISOString(),
  outputRoot,
  expectedFiles: expected.length,
  validFiles: 0,
  missingFiles: [],
  invalidFiles: [],
  unexpectedWavFiles: [],
  partialFiles: [],
  valid: false,
};

for (const filePath of expected) {
  try {
    const file = await stat(filePath);
    if (file.size <= 44) throw new Error("file is too small to be a valid WAV");
    assertPcmWavHeader(await readFile(filePath), filePath);
    results.validFiles += 1;
  } catch (error) {
    if (error?.code === "ENOENT") {
      results.missingFiles.push(path.relative(outputRoot, filePath));
    } else {
      results.invalidFiles.push({
        path: path.relative(outputRoot, filePath),
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}

try {
  const discoveredFiles = await findFiles(audioRoot);
  const expectedSet = new Set(expected.map(filePath => path.resolve(filePath)));
  for (const filePath of discoveredFiles) {
    const normalized = path.resolve(filePath);
    if (filePath.endsWith(".part")) results.partialFiles.push(path.relative(outputRoot, filePath));
    if (filePath.endsWith(".wav") && !expectedSet.has(normalized)) {
      results.unexpectedWavFiles.push(path.relative(outputRoot, filePath));
    }
  }
} catch (error) {
  if (error?.code === "ENOENT") {
    results.missingFiles = expected.map(filePath => path.relative(outputRoot, filePath));
  } else {
    results.invalidFiles.push({ path: "data/audio", error: error instanceof Error ? error.message : String(error) });
  }
}

results.valid = (
  results.validFiles === results.expectedFiles &&
  results.missingFiles.length === 0 &&
  results.invalidFiles.length === 0 &&
  results.unexpectedWavFiles.length === 0 &&
  results.partialFiles.length === 0
);

if (jsonReportPath) {
  const reportPath = path.resolve(jsonReportPath);
  await mkdir(path.dirname(reportPath), { recursive: true });
  await writeFile(reportPath, `${JSON.stringify(results, null, 2)}\n`);
}

console.log(`Expected WAV files: ${results.expectedFiles}`);
console.log(`Valid WAV files: ${results.validFiles}`);
console.log(`Missing files: ${results.missingFiles.length}`);
console.log(`Invalid files: ${results.invalidFiles.length}`);
console.log(`Unexpected WAV files: ${results.unexpectedWavFiles.length}`);
console.log(`Incomplete .part files: ${results.partialFiles.length}`);

if (!results.valid) {
  const issues = [
    ...results.missingFiles.map(filePath => `MISSING ${filePath}`),
    ...results.invalidFiles.map(file => `INVALID ${file.path}: ${file.error}`),
    ...results.unexpectedWavFiles.map(filePath => `UNEXPECTED ${filePath}`),
    ...results.partialFiles.map(filePath => `PARTIAL ${filePath}`),
  ];
  for (const issue of issues.slice(0, 30)) console.error(issue);
  if (issues.length > 30) console.error(`... plus ${issues.length - 30} additional issue(s).`);
  console.error("Validation failed. Re-run the downloader to resume missing or incomplete files.");
  process.exitCode = 1;
} else {
  console.log("Validation passed: all 4,206 expected standalone WAV files are present and valid.");
}
