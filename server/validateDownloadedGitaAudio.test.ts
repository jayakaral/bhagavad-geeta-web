import { execFile } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { afterEach, describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);
const temporaryFolders: string[] = [];

afterEach(async () => {
  await Promise.all(temporaryFolders.splice(0).map(folder => rm(folder, { recursive: true, force: true })));
});

describe("downloaded audio validator", () => {
  it("reports an incomplete download as missing and documents the complete expected inventory", async () => {
    const emptyDownload = await mkdtemp(path.join(os.tmpdir(), "gita-audio-validation-"));
    temporaryFolders.push(emptyDownload);
    const scriptPath = path.join(process.cwd(), "scripts", "validate_downloaded_gita_audio.mjs");

    await expect(execFileAsync(process.execPath, [scriptPath, "--output", emptyDownload]))
      .rejects.toMatchObject({ code: 1, stdout: expect.stringContaining("Expected WAV files: 4206") });

    try {
      await execFileAsync(process.execPath, [scriptPath, "--output", emptyDownload]);
    } catch (error) {
      expect(error.stdout).toContain("Missing files: 4206");
      expect(error.stderr).toContain("Validation failed");
    }

    const { stdout } = await execFileAsync(process.execPath, [scriptPath, "--help"]);
    expect(stdout).toContain("4,206 files");
    expect(stdout).toContain("24 kHz mono 16-bit PCM");
    expect(stdout).toContain("--json-report PATH");
  });
});
