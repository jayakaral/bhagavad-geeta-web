export const SAVED_VERSES_STORAGE_KEY = "gita-saved-verses-v1";

/**
 * Source verse identifiers already include their chapter context (for example,
 * `1.1` and `15.2`), so no separate chapter prefix is needed in browser storage.
 */
export function createSavedVerseKey(verseNumber: string | number) {
  return String(verseNumber).trim();
}

/** Converts old `chapter:verseNumber` entries to the current direct identifier. */
export function normalizeSavedVerseKey(value: string) {
  const trimmed = value.trim();
  const delimiterIndex = trimmed.indexOf(":");
  return delimiterIndex >= 0 ? trimmed.slice(delimiterIndex + 1).trim() : trimmed;
}

export function deserializeSavedVerseKeys(value: string | null) {
  if (!value) return new Set<string>();

  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return new Set<string>();
    return new Set(
      parsed
        .filter((item): item is string => typeof item === "string")
        .map(normalizeSavedVerseKey)
        .filter(Boolean),
    );
  } catch {
    return new Set<string>();
  }
}

export function serializeSavedVerseKeys(keys: Iterable<string>) {
  return JSON.stringify(Array.from(new Set(Array.from(keys))).sort());
}

export function toggleSavedVerseKey(keys: Set<string>, key: string) {
  const nextKeys = new Set(keys);
  if (nextKeys.has(key)) {
    nextKeys.delete(key);
  } else {
    nextKeys.add(key);
  }
  return nextKeys;
}
