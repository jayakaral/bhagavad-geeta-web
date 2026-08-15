import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const bucket = "gita-audio";
const audioRoot = path.resolve(process.env.AUDIO_SOURCE_ROOT ?? "data/audio");
const manifestRoot = path.resolve("data", "audio", "manifests");
const expectedFileCounts = new Map([
  [6, 282], [7, 180], [8, 168], [9, 204], [10, 252], [11, 330], [12, 120],
  [13, 210], [14, 162], [15, 120], [16, 144], [17, 168], [18, 468],
]);
const args = process.argv.slice(2);
const chapterArgument = args.find(arg => arg.startsWith("--chapters="))?.split("=")[1];
const chapters = (chapterArgument ? chapterArgument.split(",") : [...expectedFileCounts.keys()].map(String))
  .map(value => Number(value.trim()))
  .filter(chapter => expectedFileCounts.has(chapter));
const concurrency = Number(args.find(arg => arg.startsWith("--concurrency="))?.split("=")[1] ?? 4);
const baseUrl = process.env.SUPABASE_URL?.replace(/\/+$/, "");
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!baseUrl || !serviceRoleKey) throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
if (chapters.length === 0) throw new Error("Provide at least one valid chapter with --chapters=6,7,...");
if (!Number.isInteger(concurrency) || concurrency < 1) throw new Error("--concurrency must be a positive integer.");

const sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
const encodeObjectPath = objectPath => objectPath.split("/").map(encodeURIComponent).join("/");

async function findWavFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async entry => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return findWavFiles(fullPath);
    return entry.isFile() && entry.name.endsWith(".wav") ? [fullPath] : [];
  }));
  return nested.flat();
}

async function runPool(items, worker) {
  const results = new Array(items.length);
  let nextIndex = 0;
  async function runWorker() {
    while (nextIndex < items.length) {
      const index = nextIndex++;
      results[index] = await worker(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, runWorker));
  return results;
}

function objectPathFor(chapter, sourceDirectory, filePath) {
  const relative = path.relative(sourceDirectory, filePath).split(path.sep).join("/");
  return `data/audio/${chapter}/${relative}`;
}

async function requestWithRetry(label, request) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await request();
      if (response.ok) return response;
      lastError = new Error(`${label}: HTTP ${response.status}: ${await response.text()}`);
    } catch (error) {
      lastError = error;
    }
    if (attempt < 3) await sleep(attempt * 1000);
  }
  throw lastError;
}

async function uploadFile(chapter, sourceDirectory, filePath) {
  const objectPath = objectPathFor(chapter, sourceDirectory, filePath);
  const payload = await readFile(filePath);
  await requestWithRetry(objectPath, () => fetch(
    `${baseUrl}/storage/v1/object/${bucket}/${encodeObjectPath(objectPath)}`,
    {
      method: "POST",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": "audio/wav",
        "x-upsert": "true",
      },
      body: payload,
    },
  ));
  return {
    objectPath,
    bytes: payload.byteLength,
    publicUrl: `${baseUrl}/storage/v1/object/public/${bucket}/${encodeObjectPath(objectPath)}`,
  };
}

async function listVerseObjects(chapter, verse) {
  const prefix = `data/audio/${chapter}/${verse}`;
  const response = await requestWithRetry(prefix, () => fetch(`${baseUrl}/storage/v1/object/list/${bucket}`, {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prefix, limit: 100, offset: 0 }),
  }));
  const entries = await response.json();
  if (!Array.isArray(entries) || entries.length !== 6) {
    throw new Error(`${prefix}: expected six standalone recordings, found ${Array.isArray(entries) ? entries.length : "an invalid response"}.`);
  }
  return entries.map(entry => ({
    objectPath: `${prefix}/${entry.name}`,
    bytes: Number(entry.metadata?.size),
  }));
}

function assertPcmWavHeader(bytes, objectPath) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const text = (start, length) => Buffer.from(bytes.subarray(start, start + length)).toString("ascii");
  if (
    bytes.length < 44 || text(0, 4) !== "RIFF" || text(8, 4) !== "WAVE" || text(12, 4) !== "fmt " ||
    view.getUint16(20, true) !== 1 || view.getUint16(22, true) !== 1 ||
    view.getUint32(24, true) !== 24000 || view.getUint16(34, true) !== 16
  ) throw new Error(`${objectPath}: expected a 24 kHz mono 16-bit PCM WAV header.`);
}

async function validateRemoteFile(remote) {
  const response = await requestWithRetry(remote.objectPath, () => fetch(
    `${baseUrl}/storage/v1/object/public/${bucket}/${encodeObjectPath(remote.objectPath)}`,
    { headers: { Range: "bytes=0-43" } },
  ));
  assertPcmWavHeader(new Uint8Array(await response.arrayBuffer()), remote.objectPath);
}

async function migrateChapter(chapter) {
  const sourceDirectory = path.join(audioRoot, String(chapter));
  const files = (await findWavFiles(sourceDirectory)).sort();
  const expectedCount = expectedFileCounts.get(chapter);
  if (files.length !== expectedCount) throw new Error(`Chapter ${chapter}: expected ${expectedCount} files, found ${files.length}.`);
  const localFiles = await Promise.all(files.map(async filePath => ({
    filePath,
    objectPath: objectPathFor(chapter, sourceDirectory, filePath),
    bytes: (await stat(filePath)).size,
  })));
  const localByObjectPath = new Map(localFiles.map(file => [file.objectPath, file]));

  console.log(`Chapter ${chapter}: uploading ${files.length} standalone WAV files.`);
  const uploadedFiles = await runPool(files, async (filePath, index) => {
    const result = await uploadFile(chapter, sourceDirectory, filePath);
    console.log(`Chapter ${chapter}: uploaded ${index + 1}/${files.length} — ${result.objectPath}`);
    return result;
  });

  const verseFolders = [...new Set(localFiles.map(file => file.objectPath.split("/")[3]))].sort((a, b) => Number(a) - Number(b));
  const remoteFiles = (await runPool(verseFolders, verse => listVerseObjects(chapter, verse))).flat();
  if (remoteFiles.length !== expectedCount) throw new Error(`Chapter ${chapter}: expected ${expectedCount} remote objects, found ${remoteFiles.length}.`);
  for (const remote of remoteFiles) {
    const local = localByObjectPath.get(remote.objectPath);
    if (!local) throw new Error(`Chapter ${chapter}: unexpected remote object ${remote.objectPath}.`);
    if (local.bytes !== remote.bytes) throw new Error(`${remote.objectPath}: remote size ${remote.bytes} differs from local size ${local.bytes}.`);
  }
  for (const objectPath of localByObjectPath.keys()) {
    if (!remoteFiles.some(remote => remote.objectPath === objectPath)) throw new Error(`Chapter ${chapter}: missing remote object ${objectPath}.`);
  }
  await runPool(remoteFiles, validateRemoteFile);

  await mkdir(manifestRoot, { recursive: true });
  await writeFile(path.join(manifestRoot, `chapter-${chapter}-supabase.json`), `${JSON.stringify({
    chapter,
    bucket,
    objectPrefix: `data/audio/${chapter}`,
    fileCount: uploadedFiles.length,
    sourceBytes: uploadedFiles.reduce((total, file) => total + file.bytes, 0),
    files: uploadedFiles,
  }, null, 2)}\n`);
  console.log(`Chapter ${chapter}: upload and full remote validation complete.`);
}

for (const chapter of chapters.sort((a, b) => b - a)) await migrateChapter(chapter);
console.log(`Completed Supabase migration for Chapters ${chapters.sort((a, b) => a - b).join(", ")}.`);
