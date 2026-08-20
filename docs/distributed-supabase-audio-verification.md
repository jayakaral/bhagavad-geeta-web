# Distributed Supabase Audio Verification

Initial public-object checks performed on 20 August 2026 used the filename pattern `chapter-{chapter:02d}/chapter-{chapter:02d}-verse-{verse:02d}-english-male.wav` in the public `gita-audio` bucket.

| Assigned chapters | Project reference | Representative URL | Result |
|---|---|---|---|
| 1–4 | `hfcgbfjvnwhnazdizcvg` | `https://hfcgbfjvnwhnazdizcvg.supabase.co/storage/v1/object/public/gita-audio/chapter-01/chapter-01-verse-01-english-male.wav` | `200 OK`, `audio/wav` |
| 5–10 | `xwahakifdjnjpmwyrjto` | `https://xwahakifdjnjpmwyrjto.supabase.co/storage/v1/object/public/gita-audio/chapter-05/chapter-05-verse-01-english-male.wav` | `200 OK`, `audio/wav` |
| 11–15 | `vsfbmifquhpoyuhxxhat` | `https://vsfbmifquhpoyuhxxhat.supabase.co/storage/v1/object/public/gita-audio/chapter-11/chapter-11-verse-01-english-male.wav` | `200 OK`, `audio/wav` |
| 16–18 | `aalfhacqgcnylbcrwuea` | `https://aalfhacqgcnylbcrwuea.supabase.co/storage/v1/object/public/gita-audio/chapter-16/chapter-16-verse-01-english-male.wav` | `200 OK`, `audio/wav` |

All four distributed projects now serve the expected public `gita-audio` object pattern. The reader routes each chapter to its assigned project while retaining the canonical per-verse filename convention.
