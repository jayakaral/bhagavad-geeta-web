import { mkdir, rename, stat, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

const VERSE_COUNTS = [47, 72, 43, 42, 29, 47, 30, 28, 34, 42, 55, 20, 35, 27, 20, 24, 28, 78];
const VARIANTS = [
  ["sanskrit", "male"], ["sanskrit", "female"],
  ["english", "male"], ["english", "female"],
  ["hindi", "male"], ["hindi", "female"],
];
const bucket = "gita-audio";

function valueFor(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

function printUsage() {
  console.log(`
Download all Bhagavad Gita audio files from public Supabase storage.

Usage:
  node download_all_gita_audio.mjs --supabase-url https://YOUR_PROJECT_REF.supabase.co [options]

Required:
  --supabase-url URL   Your Supabase project URL.

Options:
  --output PATH        Local destination directory. Default: ./bhagavad-gita-audio
  --concurrency N      Parallel downloads. Default: 6
  --overwrite          Re-download files that already exist.
  --help               Show this help message.

The script downloads 4,206 standalone WAV files into:
  PATH/data/audio/{chapter}/{verse}/chapter-{chapter}-verse-{verse}-{language}-{gender}.wav

It needs no Supabase key because the gita-audio bucket is public. Existing valid WAV
files are skipped, so re-running the script resumes an interrupted download safely.
`);
}

if (process.argv.includes("--help")) {
  printUsage();
  process.exit(0);
}

const supabaseUrl = (valueFor("--supabase-url") ?? process.env.SUPABASE_URL)?.replace(/\/+$/, "");
const outputRoot = path.resolve(valueFor("--output") ?? "bhagavad-gita-audio");
const concurrency = Number(valueFor("--concurrency") ?? 6);
const overwrite = process.argv.includes("--overwrite");

if (!supabaseUrl || !/^https:\/\//.test(supabaseUrl)) {
  console.error("Provide --supabase-url https://YOUR_PROJECT_REF.supabase.co");
  process.exit(1);
}
if (!Number.isInteger(concurrency) || concurrency < 1) {
  console.error("--concurrency must be a positive integer.");
  process.exit(1);
}

const sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
const encodeObjectPath = objectPath => objectPath.split("/").map(encodeURIComponent).join("/");

function assertPcmWavHeader(bytes, targetPath) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const text = (start, length) => Buffer.from(bytes.subarray(start, start + length)).toString("ascii");
  if (
    bytes.length < 44 || text(0, 4) !== "RIFF" || text(8, 4) !== "WAVE" || text(12, 4) !== "fmt " ||
    view.getUint16(20, true) !== 1 || view.getUint16(22, true) !== 1 ||
    view.getUint32(24, true) !== 24000 || view.getUint16(34, true) !== 16
  ) throw new Error(`${targetPath}: downloaded file is not a 24 kHz mono 16-bit PCM WAV.`);
}

async function existingFileIsValid(filePath) {
  try {
    const file = await stat(filePath);
    return file.size > 44;
  } catch {
    return false;
  }
}

async function fetchWithRetry(url, objectPath) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return response;
      lastError = new Error(`${objectPath}: HTTP ${response.status} ${await response.text()}`);
    } catch (error) {
      lastError = error;
    }
    if (attempt < 3) await sleep(attempt * 1000);
  }
  throw lastError;
}

async function runPool(items, worker) {
  let nextIndex = 0;
  const results = new Array(items.length);
  async function runWorker() {
    while (nextIndex < items.length) {
      const index = nextIndex++;
      results[index] = await worker(items[index]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, runWorker));
  return results;
}

const downloads = [];
for (let chapter = 1; chapter <= VERSE_COUNTS.length; chapter += 1) {
  for (let verse = 1; verse <= VERSE_COUNTS[chapter - 1]; verse += 1) {
    for (const [language, gender] of VARIANTS) {
      const filename = `chapter-${chapter}-verse-${verse}-${language}-${gender}.wav`;
      const objectPath = `data/audio/${chapter}/${verse}/${filename}`;
      downloads.push({
        objectPath,
        targetPath: path.join(outputRoot, objectPath),
        url: `${supabaseUrl}/storage/v1/object/public/${bucket}/${encodeObjectPath(objectPath)}`,
      });
    }
  }
}

console.log(`Preparing ${downloads.length} standalone WAV downloads in ${outputRoot}`);
const results = await runPool(downloads, async ({ objectPath, targetPath, url }) => {
  if (!overwrite && await existingFileIsValid(targetPath)) return "skipped";

  await mkdir(path.dirname(targetPath), { recursive: true });
  const temporaryPath = `${targetPath}.part`;
  try {
    await unlink(temporaryPath);
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }

  const response = await fetchWithRetry(url, objectPath);
  const bytes = new Uint8Array(await response.arrayBuffer());
  assertPcmWavHeader(bytes, targetPath);
  await writeFile(temporaryPath, bytes);
  await rename(temporaryPath, targetPath);
  return "downloaded";
});

const downloaded = results.filter(result => result === "downloaded").length;
const skipped = results.filter(result => result === "skipped").length;
console.log(`Completed: ${downloaded} downloaded, ${skipped} already present, ${downloads.length} total.`);
