import { AudioLanguage, AudioVoice } from "@/lib/gitaAudio";

export type NarrationAction = "switch" | "resume" | "pause";
export type NarrationIconState = "speaker" | "play" | "pause";

export function narrationKey(language: AudioLanguage, voice: AudioVoice) {
  return `${language}:${voice}`;
}

export function getNarrationAction(
  activeKey: string | null,
  isPaused: boolean,
  requestedKey: string,
): NarrationAction {
  if (activeKey !== requestedKey) return "switch";
  return isPaused ? "resume" : "pause";
}

export function getNarrationIconState(isActive: boolean, isPlaying: boolean): NarrationIconState {
  if (!isActive) return "speaker";
  return isPlaying ? "pause" : "play";
}
