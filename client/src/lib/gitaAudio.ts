const GITA_AUDIO_BUCKET = "gita-audio";

export const CHAPTER_AUDIO_CONNECTIONS = [
  {
    projectId: "hfcgbfjvnwhnazdizcvg",
    chapters: [1, 2, 3, 4],
  },
  {
    projectId: "xwahakifdjnjpmwyrjto",
    chapters: [5, 6, 7, 8, 9, 10],
  },
  {
    projectId: "vsfbmifquhpoyuhxxhat",
    chapters: [11, 12, 13, 14, 15],
  },
  {
    projectId: "aalfhacqgcnylbcrwuea",
    chapters: [16, 17, 18],
  },
] as const;

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

export function getAudioBucketUrl(chapterNumber: number) {
  const connection = CHAPTER_AUDIO_CONNECTIONS.find(({ chapters }) =>
    chapters.includes(chapterNumber as never),
  );

  if (!connection) {
    throw new Error(`No audio storage project is configured for chapter ${chapterNumber}`);
  }

  return `https://${connection.projectId}.supabase.co/storage/v1/object/public/${GITA_AUDIO_BUCKET}`;
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

  return `${getAudioBucketUrl(chapterNumber)}/chapter-${chapter}/${filename}`;
}
