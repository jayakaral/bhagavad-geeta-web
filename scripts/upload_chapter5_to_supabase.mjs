import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const chapter = "5";
const bucket = "gita-audio";
// Audio bytes stay outside the repository after upload to avoid checkpoint limits.
const sourceDirectory = path.resolve(
  process.env.CHAPTER5_AUDIO_SOURCE ?? "/home/ubuntu/webdev-static-assets/bhagavad-geeta-audio-backup/chapter-5",
);
const manifestPath = path.resolve("data", "audio", "manifests", `chapter-${chapter}-supabase.json`);
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

async function upload(filePath) {
  const relativeFilePath = path.relative(sourceDirectory, filePath).split(path.sep).join("/");
  const objectPath = `data/audio/${chapter}/${relativeFilePath}`;
  const payload = await readFile(filePath);

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const response = await fetch(
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
    );

    if (response.ok) {
      return {
        objectPath,
        bytes: payload.byteLength,
        publicUrl: `${baseUrl}/storage/v1/object/public/${bucket}/${encodeObjectPath(objectPath)}`,
      };
    }

    const responseText = await response.text();
    if (attempt === 3) {
      throw new Error(`${objectPath}: upload failed with HTTP ${response.status}: ${responseText}`);
    }
    await new Promise(resolve => setTimeout(resolve, attempt * 1000));
  }

  throw new Error(`Unreachable upload failure for ${objectPath}`);
}

async function runPool(items, worker, limit) {
  const results = [];
  let nextIndex = 0;

  async function runWorker() {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await worker(items[index]);
      process.stdout.write(`Uploaded ${index + 1}/${items.length}: ${results[index].objectPath}\n`);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, runWorker));
  return results;
}

const files = (await findWavFiles(sourceDirectory)).sort();
if (files.length !== 174) {
  throw new Error(`Expected 174 Chapter 5 WAV files, found ${files.length}.`);
}

const outputs = await runPool(files, upload, concurrency);
const sourceBytes = (await Promise.all(files.map(file => stat(file)))).reduce((total, file) => total + file.size, 0);

await mkdir(path.dirname(manifestPath), { recursive: true });
await writeFile(
  manifestPath,
  `${JSON.stringify(
    {
      chapter: Number(chapter),
      bucket,
      objectPrefix: `data/audio/${chapter}`,
      fileCount: outputs.length,
      sourceBytes,
      files: outputs,
    },
    null,
    2,
  )}\n`,
  "utf8",
);

console.log(`Completed ${outputs.length} uploads (${sourceBytes} bytes).`);
