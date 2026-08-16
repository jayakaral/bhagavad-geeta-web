import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import { describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);

describe("all-audio download script", () => {
  it("documents the complete public download inventory and resumable output structure", async () => {
    const scriptPath = path.join(process.cwd(), "scripts", "download_all_gita_audio.mjs");
    const { stdout } = await execFileAsync(process.execPath, [scriptPath, "--help"]);

    expect(stdout).toContain("4,206 standalone WAV files");
    expect(stdout).toContain("data/audio/{chapter}/{verse}/");
    expect(stdout).toContain("--supabase-url URL");
    expect(stdout).toContain("--output PATH");
    expect(stdout).toContain("--concurrency N");
    expect(stdout).toContain("--overwrite");
    expect(stdout).toContain("Existing valid WAV\nfiles are skipped");
  });
});
