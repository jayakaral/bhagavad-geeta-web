import { readdir, stat } from "node:fs/promises";
import path from "node:path";

const chapter = "5";
const bucket = "gita-audio";
// Audio bytes stay outside the repository after upload to avoid checkpoint limits.
const sourceDirectory = path.resolve(
  process.env.CHAPTER5_AUDIO_SOURCE ?? "/home/ubuntu/webdev-static-assets/bhagavad-geeta-audio-backup/chapter-5",
);
const concurrency = 4;
const baseUrl = process.env.SUPABASE_URL?.replace(/\/+$/, "");
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!baseUrl || !serviceRoleKey) {
  throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
}

async function findWavFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async entry => {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) return findWavFiles(fullPath);
      return entry.isFile() && entry.name.endsWith(".wav") ? [fullPath] : [];
    }),
  );
  return nested.flat();
}

function encodeObjectPath(objectPath) {
  return objectPath.split("/").map(encodeURIComponent).join("/");
}

async function listVerseObjects(verse) {
  const prefix = `data/audio/${chapter}/${verse}`;
  const response = await fetch(`${baseUrl}/storage/v1/object/list/${bucket}`, {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prefix, limit: 100, offset: 0 }),
  });
  if (!response.ok) throw new Error(`Unable to list ${prefix}: HTTP ${response.status}`);
  const entries = await response.json();
  if (!Array.isArray(entries) || entries.length !== 6) {
    throw new Error(`${prefix}: expected 6 objects, found ${Array.isArray(entries) ? entries.length : "invalid response"}`);
  }
  return entries.map(entry => ({
    objectPath: `${prefix}/${entry.name}`,
    bytes: Number(entry.metadata?.size),
  }));
}

async function runPool(items, worker, limit) {
  let nextIndex = 0;
  const results = [];
  async function runWorker() {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await worker(items[index]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, runWorker));
  return results;
}

function assertPcmWavHeader(bytes, objectPath) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const text = (start, length) => Buffer.from(bytes.subarray(start, start + length)).toString("ascii");
  if (
    bytes.length < 44 ||
    text(0, 4) !== "RIFF" ||
    text(8, 4) !== "WAVE" ||
    text(12, 4) !== "fmt " ||
    view.getUint16(20, true) !== 1 ||
    view.getUint16(22, true) !== 1 ||
    view.getUint32(24, true) !== 24000 ||
    view.getUint16(34, true) !== 16
  ) {
    throw new Error(`${objectPath}: remote file does not have the expected 24 kHz mono 16-bit PCM WAV header.`);
  }
}

const localFiles = (await findWavFiles(sourceDirectory)).sort();
if (localFiles.length !== 174) throw new Error(`Expected 174 local Chapter 5 WAV files, found ${localFiles.length}.`);

const localByObjectPath = new Map(
  await Promise.all(
    localFiles.map(async filePath => {
      const relative = path.relative(sourceDirectory, filePath).split(path.sep).join("/");
      return [`data/audio/${chapter}/${relative}`, { filePath, bytes: (await stat(filePath)).size }];
    }),
  ),
);

const remoteObjects = (await Promise.all(Array.from({ length: 29 }, (_, index) => listVerseObjects(index + 1)))).flat();
if (remoteObjects.length !== 174) throw new Error(`Expected 174 remote Chapter 5 WAV files, found ${remoteObjects.length}.`);

for (const remote of remoteObjects) {
  const local = localByObjectPath.get(remote.objectPath);
  if (!local) throw new Error(`Unexpected remote object: ${remote.objectPath}`);
  if (remote.bytes !== local.bytes) {
    throw new Error(`${remote.objectPath}: remote size ${remote.bytes} does not match local size ${local.bytes}.`);
  }
}

for (const localObjectPath of localByObjectPath.keys()) {
  if (!remoteObjects.some(remote => remote.objectPath === localObjectPath)) {
    throw new Error(`Missing remote object: ${localObjectPath}`);
  }
}

await runPool(
  remoteObjects,
  async remote => {
    const response = await fetch(
      `${baseUrl}/storage/v1/object/public/${bucket}/${encodeObjectPath(remote.objectPath)}`,
      { headers: { Range: "bytes=0-43" } },
    );
    if (!response.ok) throw new Error(`${remote.objectPath}: public read failed with HTTP ${response.status}.`);
    assertPcmWavHeader(new Uint8Array(await response.arrayBuffer()), remote.objectPath);
    process.stdout.write(`Verified ${remote.objectPath}\n`);
  },
  concurrency,
);

console.log("Validated 174 remote Chapter 5 objects: paths, byte sizes, and WAV headers all match the local source set.");
