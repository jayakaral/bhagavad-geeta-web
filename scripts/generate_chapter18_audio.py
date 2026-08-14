"""Generate one standalone WAV file per verse, language, and voice for Chapter 18.

This script intentionally creates each requested output independently. It never joins
multiple verses into a shared source or output file.
"""

from __future__ import annotations

import argparse
import asyncio
import json
import subprocess
import sys
from pathlib import Path

import edge_tts


ROOT = Path(__file__).resolve().parents[1]
CHAPTER = 18
VOICE_MAP = {
    "sanskrit": {"male": "hi-IN-MadhurNeural", "female": "hi-IN-SwaraNeural"},
    "english": {"male": "en-IN-PrabhatNeural", "female": "en-IN-NeerjaNeural"},
    "hindi": {"male": "hi-IN-MadhurNeural", "female": "hi-IN-SwaraNeural"},
}


def load_sources() -> tuple[dict[int, dict], dict[int, dict]]:
    english = json.loads(
        (ROOT / "client/public/data/en/chapter_18.json").read_text(encoding="utf-8")
    )
    hindi = json.loads(
        (ROOT / "client/public/data/hi/chapter_18.json").read_text(encoding="utf-8")
    )
    return (
        {int(item["verse"]): item for item in english},
        {int(item["verse"]): item for item in hindi},
    )


async def write_one(text: str, voice: str, output: Path) -> None:
    temp = output.with_suffix(".tmp.mp3")
    for attempt in range(1, 4):
        try:
            communicator = edge_tts.Communicate(text=text, voice=voice)
            await communicator.save(str(temp))
            subprocess.run(
                [
                    "ffmpeg",
                    "-y",
                    "-loglevel",
                    "error",
                    "-i",
                    str(temp),
                    "-ar",
                    "24000",
                    "-ac",
                    "1",
                    "-c:a",
                    "pcm_s16le",
                    str(output),
                ],
                check=True,
            )
            temp.unlink(missing_ok=True)
            return
        except Exception as exc:  # noqa: BLE001
            temp.unlink(missing_ok=True)
            if attempt == 3:
                raise RuntimeError(f"Failed to generate {output}: {exc}") from exc
            await asyncio.sleep(attempt * 2)


async def generate_verse(
    verse: int,
    english: dict[int, dict],
    hindi: dict[int, dict],
    semaphore: asyncio.Semaphore,
) -> list[Path]:
    en = english[verse]
    hi = hindi[verse]
    texts = {
        "sanskrit": en["sanskrit"],
        "english": en["translation"],
        "hindi": hi["translation"],
    }
    output_dir = ROOT / f"data/audio/{CHAPTER}/{verse}"
    output_dir.mkdir(parents=True, exist_ok=True)

    async def limited_write(language: str, gender: str) -> Path:
        output = output_dir / f"chapter-{CHAPTER}-verse-{verse}-{language}-{gender}.wav"
        async with semaphore:
            await write_one(texts[language], VOICE_MAP[language][gender], output)
        return output

    return await asyncio.gather(
        *[
            limited_write(language, gender)
            for language in ("sanskrit", "english", "hindi")
            for gender in ("male", "female")
        ]
    )


async def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--start", type=int, default=15)
    parser.add_argument("--end", type=int, default=78)
    parser.add_argument("--concurrency", type=int, default=4)
    args = parser.parse_args()

    english, hindi = load_sources()
    requested = list(range(args.start, args.end + 1))
    if any(verse not in english or verse not in hindi for verse in requested):
        raise ValueError("The requested verse range is not present in both source files.")

    semaphore = asyncio.Semaphore(args.concurrency)
    completed: list[str] = []
    for verse in requested:
        outputs = await generate_verse(verse, english, hindi, semaphore)
        completed.extend(str(path.relative_to(ROOT)) for path in outputs)
        print(f"Generated Verse {verse}: {len(outputs)} files", flush=True)

    manifest = ROOT / "data/audio/18/chapter-18-verses-15-78-audio-manifest.json"
    manifest.write_text(json.dumps(completed, indent=2), encoding="utf-8")
    print(f"Generated {len(completed)} standalone WAV files.")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        sys.exit(130)
