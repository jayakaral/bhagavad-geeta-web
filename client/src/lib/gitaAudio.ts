export const GITA_AUDIO_BUCKET_URL =
  "https://unypvhipmubisgsghmxj.supabase.co/storage/v1/object/public/gita-audio";

export type AudioLanguage = "sanskrit" | "english" | "hindi";
export type AudioVoice = "male" | "female";

function padAudioSegment(value: number) {
  return String(value).padStart(2, "0");
}

function verseFilenameSegment(verseIdentifier: string | number) {
  const finalSegment = String(verseIdentifier).trim().split(".").at(-1) ?? "";
  if (!/^\d+$/.test(finalSegment)) {
    throw new Error(`Invalid verse identifier: ${verseIdentifier}`);
  }

  return padAudioSegment(Number(finalSegment));
}

/**
 * Builds a public Supabase URL for one discrete verse recording. Audio remains
 * outside the application repository; each URL addresses exactly one language
 * and voice variant for a single chapter and verse.
 */
export function buildGitaAudioUrl(
  chapterNumber: number,
  verseIdentifier: string | number,
  language: AudioLanguage,
  voice: AudioVoice,
) {
  const chapter = padAudioSegment(chapterNumber);
  const verse = verseFilenameSegment(verseIdentifier);
  const filename = `chapter-${chapter}-verse-${verse}-${language}-${voice}.wav`;

  return `${GITA_AUDIO_BUCKET_URL}/chapter-${chapter}/${filename}`;
}
