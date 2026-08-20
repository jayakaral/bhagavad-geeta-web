import { describe, expect, it } from "vitest";
import { buildGitaAudioUrl, getAudioBucketUrl } from "../client/src/lib/gitaAudio";

describe("buildGitaAudioUrl", () => {
  it("uses the Chapter 1–4 project and maps a dotted source verse label to the zero-padded filename suffix", () => {
    expect(buildGitaAudioUrl(1, "1.1", "sanskrit", "male")).toBe(
      "https://hfcgbfjvnwhnazdizcvg.supabase.co/storage/v1/object/public/gita-audio/chapter-01/chapter-01-verse-01-sanskrit-male.wav",
    );
  });

  it("uses the Chapter 16–18 project and the final portion of the full chapter-and-verse label for upper-bound entries", () => {
    expect(buildGitaAudioUrl(18, "18.78", "hindi", "female")).toBe(
      "https://aalfhacqgcnylbcrwuea.supabase.co/storage/v1/object/public/gita-audio/chapter-18/chapter-18-verse-78-hindi-female.wav",
    );
  });

  it("selects the correct public project at every chapter-group boundary", () => {
    expect(getAudioBucketUrl(4)).toContain("hfcgbfjvnwhnazdizcvg.supabase.co");
    expect(getAudioBucketUrl(5)).toContain("xwahakifdjnjpmwyrjto.supabase.co");
    expect(getAudioBucketUrl(11)).toContain("vsfbmifquhpoyuhxxhat.supabase.co");
    expect(getAudioBucketUrl(16)).toContain("aalfhacqgcnylbcrwuea.supabase.co");
  });

  it("rejects chapter numbers outside the configured 18-chapter text", () => {
    expect(() => getAudioBucketUrl(19)).toThrow(
      "No audio storage project is configured for chapter 19",
    );
  });
});
