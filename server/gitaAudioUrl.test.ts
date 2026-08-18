import { describe, expect, it } from "vitest";
import { buildGitaAudioUrl } from "../client/src/lib/gitaAudio";

describe("buildGitaAudioUrl", () => {
  it("uses the public bucket and zero-padded chapter, verse, language, and voice pattern", () => {
    expect(buildGitaAudioUrl(1, 1, "sanskrit", "male")).toBe(
      "https://unypvhipmubisgsghmxj.supabase.co/storage/v1/object/public/gita-audio/chapter-01/chapter-01-verse-01-sanskrit-male.wav",
    );
  });

  it("preserves two-digit chapter and verse segments for upper-bound entries", () => {
    expect(buildGitaAudioUrl(18, 78, "hindi", "female")).toBe(
      "https://unypvhipmubisgsghmxj.supabase.co/storage/v1/object/public/gita-audio/chapter-18/chapter-18-verse-78-hindi-female.wav",
    );
  });
});
