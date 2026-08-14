/**
 * Design note: Parchment & Ink — the source layer stays quiet and typed so the
 * reading interface can change language without changing the editorial rhythm.
 */
export type Language = "en" | "hi";

export type ChapterMetadata = {
  chapter: number;
  sanskritName: string;
  englishName: string;
  title: string;
  description: string;
  verseCount: number;
  sourceUrl?: string;
};

export type Verse = {
  verse: number;
  sanskrit: string;
  transliteration: string;
  translation: string;
  interpretation: string;
  chapter: number;
  verseNumber: string;
};

export type GitaData = {
  chapters: ChapterMetadata[];
  verses: Record<Language, Record<number, Verse[]>>;
};

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Unable to load ${url}`);
  }
  return response.json() as Promise<T>;
}

export async function loadGitaData(): Promise<GitaData> {
  const chapters = await getJson<ChapterMetadata[]>("/data/chapters.json");
  const chapterRecords = await Promise.all(
    chapters.map(async ({ chapter }) => {
      const [english, hindi] = await Promise.all([
        getJson<Verse[]>(`/data/en/chapter_${chapter}.json`),
        getJson<Verse[]>(`/data/hi/chapter_${chapter}.json`),
      ]);

      return { chapter, english, hindi };
    }),
  );

  return {
    chapters,
    verses: {
      en: Object.fromEntries(chapterRecords.map(({ chapter, english }) => [chapter, english])),
      hi: Object.fromEntries(chapterRecords.map(({ chapter, hindi }) => [chapter, hindi])),
    },
  };
}
