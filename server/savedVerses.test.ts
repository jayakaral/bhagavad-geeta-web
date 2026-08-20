import { describe, expect, it } from "vitest";
import {
  createSavedVerseKey,
  deserializeSavedVerseKeys,
  serializeSavedVerseKeys,
  toggleSavedVerseKey,
} from "../client/src/lib/savedVerses";

describe("saved verse helpers", () => {
  it("uses the full source verse identifier directly because it already includes chapter context", () => {
    expect(createSavedVerseKey("1.1")).toBe("1.1");
    expect(createSavedVerseKey("15.2")).toBe("15.2");
  });

  it("normalizes legacy chapter-prefixed entries while handling corrupted storage", () => {
    expect(deserializeSavedVerseKeys('["1:1.1", "15.2", "15:15.2", 4, ""]')).toEqual(new Set(["1.1", "15.2"]));
    expect(deserializeSavedVerseKeys("not-json")).toEqual(new Set());
  });

  it("toggles direct verse identifiers and serializes only the compact inventory", () => {
    const first = toggleSavedVerseKey(new Set<string>(), "2.47");
    const second = toggleSavedVerseKey(first, "1.1");
    const cleared = toggleSavedVerseKey(second, "2.47");

    expect(serializeSavedVerseKeys(second)).toBe('["1.1","2.47"]');
    expect(cleared).toEqual(new Set(["1.1"]));
  });
});
