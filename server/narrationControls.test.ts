import { describe, expect, it } from "vitest";
import { getNarrationAction, getNarrationIconState, narrationKey } from "../client/src/lib/narration";

describe("verse narration controls", () => {
  it("resumes the same paused narration without replacing its source", () => {
    const key = narrationKey("sanskrit", "male");
    expect(getNarrationAction(key, true, key)).toBe("resume");
  });

  it("pauses the currently playing narration and resets only when switching sources", () => {
    const sanskritMale = narrationKey("sanskrit", "male");
    const englishMale = narrationKey("english", "male");
    expect(getNarrationAction(sanskritMale, false, sanskritMale)).toBe("pause");
    expect(getNarrationAction(sanskritMale, true, englishMale)).toBe("switch");
  });

  it("shows speaker for inactive narrations, play for paused narration, and pause while playing", () => {
    expect(getNarrationIconState(false, false)).toBe("speaker");
    expect(getNarrationIconState(true, false)).toBe("play");
    expect(getNarrationIconState(true, true)).toBe("pause");
  });
});
