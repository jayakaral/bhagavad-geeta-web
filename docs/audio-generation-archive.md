# Bhagavad Gita Audio Generation Archive

This document preserves the completed audio-generation history that was moved out of the active project checklist on 19 August 2026. It records the completed delivery without retaining thousands of individual checkbox rows in `todo.md`.

## Final Audio Inventory

Every verse has six separate recordings: **Sanskrit, English, and Hindi**, each in **male and female** voices. All 4,206 files were validated in the public Supabase `gita-audio` bucket with the required 24 kHz mono 16-bit PCM WAV format.

| Chapter | Verses | Standalone WAV files |
|---:|---:|---:|
| 1 | 47 | 282 |
| 2 | 72 | 432 |
| 3 | 43 | 258 |
| 4 | 42 | 252 |
| 5 | 29 | 174 |
| 6 | 47 | 282 |
| 7 | 30 | 180 |
| 8 | 28 | 168 |
| 9 | 34 | 204 |
| 10 | 42 | 252 |
| 11 | 55 | 330 |
| 12 | 20 | 120 |
| 13 | 35 | 210 |
| 14 | 27 | 162 |
| 15 | 20 | 120 |
| 16 | 24 | 144 |
| 17 | 28 | 168 |
| 18 | 78 | 468 |
| **Total** | **701** | **4,206** |

## Storage and Validation Record

The canonical source is the public Supabase bucket `gita-audio`. Repository-local audio artifacts were removed after remote validation, and external backups were preserved separately from the Git repository. The project includes user-facing download and local validation utilities for the full inventory.

The completed audio-generation work covered these outcomes:

- Individual pre-generation verse tasks were created for Chapters 1 and 2, then marked complete after validation.
- Standalone audio batches for Chapters 1 through 18 were generated, uploaded, and verified without combining verses in a file.
- Supabase object names, counts, byte sizes, and WAV headers were validated against the expected inventory.
- The chapter reader now streams public Supabase audio using the verified filename convention.
