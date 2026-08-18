import { Pause, Play, Volume2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AudioLanguage,
  AudioVoice,
  buildGitaAudioUrl,
} from "@/lib/gitaAudio";

type VerseAudioPlayerProps = {
  chapterNumber: number;
  verseNumber: string | number;
};

const languageOptions: Array<{ value: AudioLanguage; label: string }> = [
  { value: "sanskrit", label: "Sanskrit" },
  { value: "english", label: "English" },
  { value: "hindi", label: "Hindi" },
];

const voiceOptions: Array<{ value: AudioVoice; label: string }> = [
  { value: "male", label: "Male voice" },
  { value: "female", label: "Female voice" },
];

export function VerseAudioPlayer({ chapterNumber, verseNumber }: VerseAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [language, setLanguage] = useState<AudioLanguage>("sanskrit");
  const [voice, setVoice] = useState<AudioVoice>("male");
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioIssue, setAudioIssue] = useState<string | null>(null);

  const source = useMemo(
    () => buildGitaAudioUrl(chapterNumber, verseNumber, language, voice),
    [chapterNumber, language, verseNumber, voice],
  );

  useEffect(() => {
    const player = audioRef.current;
    if (!player) return;

    player.pause();
    player.currentTime = 0;
    setIsPlaying(false);
    setAudioIssue(null);
  }, [source]);

  const togglePlayback = async () => {
    const player = audioRef.current;
    if (!player) return;

    setAudioIssue(null);
    if (!player.paused) {
      player.pause();
      return;
    }

    try {
      await player.play();
    } catch {
      setIsPlaying(false);
      setAudioIssue("This recording could not be played. Please try another voice or language.");
    }
  };

  return (
    <section className="verse-audio-player" aria-labelledby="verse-audio-heading">
      <div className="verse-audio-heading-row">
        <div>
          <p className="reader-section-label" id="verse-audio-heading">Listen to this verse</p>
          <p className="verse-audio-caption">Select a language and voice. Each recording is a single verse.</p>
        </div>
        <Volume2 aria-hidden="true" size={19} strokeWidth={1.5} />
      </div>

      <div className="verse-audio-options">
        <div className="verse-audio-choice" role="group" aria-label="Audio language">
          <span>Language</span>
          <div className="verse-audio-pills">
            {languageOptions.map((option) => (
              <button
                type="button"
                key={option.value}
                className={language === option.value ? "verse-audio-pill--active" : ""}
                aria-pressed={language === option.value}
                onClick={() => setLanguage(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="verse-audio-choice" role="group" aria-label="Narrator voice">
          <span>Voice</span>
          <div className="verse-audio-pills">
            {voiceOptions.map((option) => (
              <button
                type="button"
                key={option.value}
                className={voice === option.value ? "verse-audio-pill--active" : ""}
                aria-pressed={voice === option.value}
                onClick={() => setVoice(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="verse-audio-playback">
        <button type="button" className="verse-audio-play" onClick={togglePlayback} aria-label={isPlaying ? "Pause verse audio" : "Play verse audio"}>
          {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
          {isPlaying ? "Pause recording" : "Play recording"}
        </button>
        <span aria-live="polite">{language} · {voice} voice</span>
      </div>

      <audio
        ref={audioRef}
        src={source}
        preload="none"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onError={() => {
          setIsPlaying(false);
          setAudioIssue("This recording is unavailable right now. Please try again shortly.");
        }}
      />
      {audioIssue ? <p className="verse-audio-error" role="status">{audioIssue}</p> : null}
    </section>
  );
}
