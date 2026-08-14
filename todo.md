# Data Integration Checklist

- [x] Inspect `en.zip`, `hi.zip`, and `chapters.json` structure and identify the canonical chapter / verse keys.
- [x] Copy the supplied source files into a project `data/` folder without altering source content.
- [x] Build a typed content adapter for chapter metadata, English verses, and Hindi verses.
- [x] Replace hardcoded chapter and verse presentation with the supplied data.
- [x] Add a language toggle and verify Hindi typography / fallback rendering.
- [x] Run typecheck, production build, and responsive screenshots before saving the updated checkpoint.
- [x] Add `/chapter/:chapterNumber` routing with a dedicated reading page.
- [x] Load and render the selected chapter’s imported English and Hindi verses with per-verse detail.
- [x] Add verse navigation, language switching, copy / bookmark actions, and return links.
- [x] Validate direct routes, invalid chapter fallback, mobile reading layout, and production build.
