import { execFileSync, spawnSync } from "node:child_process";

const [input, maleOutput, femaleOutput] = process.argv.slice(2);

if (!input || !maleOutput || !femaleOutput) {
  throw new Error(
    "Usage: node scripts/split_dual_tts.mjs <input.wav> <male.wav> <female.wav>",
  );
}

const probe = spawnSync(
  "ffmpeg",
  [
    "-hide_banner",
    "-i",
    input,
    "-af",
    "silencedetect=noise=-38dB:d=0.5",
    "-f",
    "null",
    "-",
  ],
  { encoding: "utf8" },
);

if (probe.status !== 0) {
  throw new Error(probe.stderr || `Unable to inspect ${input}`);
}

const stderr = probe.stderr || "";
const starts = [...stderr.matchAll(/silence_start:\s*([\d.]+)/g)].map((match) =>
  Number(match[1]),
);
const ends = [
  ...stderr.matchAll(/silence_end:\s*([\d.]+)\s*\|\s*silence_duration:\s*([\d.]+)/g),
].map((match) => ({ end: Number(match[1]), duration: Number(match[2]) }));

const pauses = ends
  .map((entry, index) => ({ start: starts[index], ...entry }))
  .filter((entry) => Number.isFinite(entry.start) && entry.duration >= 0.7)
  .sort((a, b) => b.duration - a.duration);

const separator = pauses[0];

if (!separator) {
  throw new Error(`No usable speaker-separator pause found in ${input}`);
}

const maleEnd = Math.max(0.1, separator.start - 0.03).toFixed(3);
const femaleStart = (separator.end + 0.03).toFixed(3);

const render = (args) =>
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...args], {
    stdio: "inherit",
  });

render([
  "-i",
  input,
  "-t",
  maleEnd,
  "-ar",
  "24000",
  "-ac",
  "1",
  "-c:a",
  "pcm_s16le",
  maleOutput,
]);

render([
  "-ss",
  femaleStart,
  "-i",
  input,
  "-ar",
  "24000",
  "-ac",
  "1",
  "-c:a",
  "pcm_s16le",
  femaleOutput,
]);

console.log(
  `Split at ${separator.start.toFixed(3)}–${separator.end.toFixed(3)} seconds into ${maleOutput} and ${femaleOutput}`,
);
