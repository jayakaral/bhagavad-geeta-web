import { useCallback, useEffect, useState } from "react";
import {
  createSavedVerseKey,
  deserializeSavedVerseKeys,
  SAVED_VERSES_STORAGE_KEY,
  serializeSavedVerseKeys,
  toggleSavedVerseKey,
} from "@/lib/savedVerses";

export function useSavedVerses() {
  const [savedVerseKeys, setSavedVerseKeys] = useState<Set<string>>(() => new Set());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setSavedVerseKeys(deserializeSavedVerseKeys(window.localStorage.getItem(SAVED_VERSES_STORAGE_KEY)));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(SAVED_VERSES_STORAGE_KEY, serializeSavedVerseKeys(savedVerseKeys));
  }, [hydrated, savedVerseKeys]);

  const isVerseSaved = useCallback((verseNumber: string | number) => {
    return savedVerseKeys.has(createSavedVerseKey(verseNumber));
  }, [savedVerseKeys]);

  const toggleVerse = useCallback((verseNumber: string | number) => {
    const key = createSavedVerseKey(verseNumber);
    setSavedVerseKeys((currentKeys) => toggleSavedVerseKey(currentKeys, key));
  }, []);

  return { isVerseSaved, toggleVerse };
}
