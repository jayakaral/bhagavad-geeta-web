import { useEffect, useRef, useState } from "react";
import { AudioLanguage, AudioVoice, buildGitaAudioUrl } from "@/lib/gitaAudio";
import { getNarrationAction, narrationKey } from "@/lib/narration";

type UseVerseNarrationOptions = {
  chapterNumber: number;
  verseNumber: string | number;
  voice: AudioVoice;
};

export function useVerseNarration({ chapterNumber, verseNumber, voice }: UseVerseNarrationOptions) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const activeKeyRef = useRef<string | null>(null);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioIssue, setAudioIssue] = useState<string | null>(null);

  useEffect(() => {
    const player = audioRef.current;
    if (player) {
      player.pause();
      player.removeAttribute("src");
      player.load();
    }
    activeKeyRef.current = null;
    setActiveKey(null);
    setIsPlaying(false);
    setAudioIssue(null);
  }, [chapterNumber, verseNumber, voice]);

  const toggleNarration = async (language: AudioLanguage) => {
    const player = audioRef.current;
    if (!player) return;

    const requestedKey = narrationKey(language, voice);
    const action = getNarrationAction(activeKeyRef.current, player.paused, requestedKey);
    setAudioIssue(null);

    if (action === "pause") {
      player.pause();
      return;
    }

    if (action === "switch") {
      player.pause();
      player.currentTime = 0;
      player.src = buildGitaAudioUrl(chapterNumber, verseNumber, language, voice);
      player.load();
      activeKeyRef.current = requestedKey;
      setActiveKey(requestedKey);
      setIsPlaying(false);
    }

    try {
      await player.play();
    } catch {
      setIsPlaying(false);
      setAudioIssue("This recording could not be played. Please try again shortly.");
    }
  };

  const isNarrationActive = (language: AudioLanguage) => activeKey === narrationKey(language, voice);

  return {
    audioRef,
    audioIssue,
    isNarrationActive,
    isPlaying,
    toggleNarration,
    handleEnded: () => setIsPlaying(false),
    handlePause: () => setIsPlaying(false),
    handlePlay: () => setIsPlaying(true),
    handleError: () => {
      setIsPlaying(false);
      setAudioIssue("This recording is unavailable right now. Please try another narration.");
    },
  };
}
