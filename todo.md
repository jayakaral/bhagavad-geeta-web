# Project TODO

## Completed Website Foundation

- [x] Import the supplied Bhagavad Gita source data and build the multilingual chapter reader.
- [x] Add dedicated routes for all 18 chapters with detailed per-verse reading, translation, interpretation, and navigation.
- [x] Replace the header search control with a language selector.
- [x] Integrate per-verse Supabase narration controls with language and voice selection.
- [x] Simplify the header by removing the “The Gita” and “About the text” navigation links.
- [x] Archive completed audio-generation history in `docs/audio-generation-archive.md`.

## Current Work

- [x] Repair “Save this verse” so saved status persists and updates correctly while navigating between verses.
- [x] Test the persistent saved-verse behavior and navigation on desktop and mobile layouts.
- [x] Store saved verses using the existing `verseNumber` identifier directly, normalize prior keys for compatibility, and verify persistence.
- [x] Route audio URLs to the assigned Supabase projects: Chapters 1–4, 5–10, 11–15, and 16–18.
- [x] Verify representative public audio objects in each assigned project and test distributed routing in the reader.
