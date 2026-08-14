/**
 * Design note: Parchment & Ink — the chapter reader is the quiet interior of
 * the folio. Verse navigation is a margin, the source text is the center, and
 * saffron only appears where the reader can act: language, copy, and movement.
 */
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Check,
  ChevronLeft,
  ChevronRight,
  Menu,
  Quote,
  X,
} from "lucide-react";
import { Link } from "wouter";
import { ChapterMetadata, GitaData, Language, Verse, loadGitaData } from "@/lib/gitaData";

type ChapterReaderProps = { chapterNumber: number };

function chapterLabel(chapter: ChapterMetadata) {
  return `Chapter ${String(chapter.chapter).padStart(2, "0")}`;
}

export default function ChapterReader({ chapterNumber }: ChapterReaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [language, setLanguage] = useState<Language>("en");
  const [data, setData] = useState<GitaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadGitaData()
      .then((loaded) => {
        if (!cancelled) {
          setData(loaded);
          setLoading(false);
        }
      })
      .catch((loadError: Error) => {
        if (!cancelled) {
          setError(loadError.message);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setActiveIndex(0);
    setSaved(false);
    setCopied(false);
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [chapterNumber]);

  const chapter = data?.chapters.find((item) => item.chapter === chapterNumber);
  const verses = useMemo(() => (chapter ? data?.verses[language][chapter.chapter] ?? [] : []), [chapter, data, language]);
  const activeVerse = verses[activeIndex] ?? verses[0];
  const previousChapter = data?.chapters.find((item) => item.chapter === chapterNumber - 1);
  const nextChapter = data?.chapters.find((item) => item.chapter === chapterNumber + 1);

  const copyVerse = async () => {
    if (!activeVerse?.translation) return;
    try {
      await navigator.clipboard.writeText(activeVerse.translation);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  if (!loading && error) {
    return (
      <div className="reader-state">
        <p className="eyebrow"><span className="eyebrow-line" />The reading room is quiet</p>
        <h1>We could not open this chapter.</h1>
        <p>{error}</p>
        <Link className="ink-button" href="/#chapters">Return to the chapter index <ArrowLeft size={16} /></Link>
      </div>
    );
  }

  if (!loading && !chapter) {
    return (
      <div className="reader-state">
        <p className="eyebrow"><span className="eyebrow-line" />A missing page</p>
        <h1>This chapter has not been written into the index.</h1>
        <p>Choose one of the 18 chapters from the supplied Bhagavad Gita source.</p>
        <Link className="ink-button" href="/#chapters">Return to the chapter index <ArrowLeft size={16} /></Link>
      </div>
    );
  }

  return (
    <div className="chapter-reader-shell">
      <header className="site-header chapter-reader-header">
        <Link className="brand" href="/" aria-label="Gita home" onClick={() => setMenuOpen(false)}>
          <span className="brand-seal"><img src="/manus-storage/gita-seal_d10467e6.png" alt="" /></span>
          <span className="brand-lockup"><strong>GITA</strong><small>अध्ययन / a quiet study</small></span>
        </Link>
        <nav className={`main-nav ${menuOpen ? "main-nav--open" : ""}`} aria-label="Primary navigation">
          <Link href="/#chapters" onClick={() => setMenuOpen(false)}>The Gita</Link>
          <Link href="/#chapters" onClick={() => setMenuOpen(false)}>18 chapters</Link>
          <Link href="/#verse" onClick={() => setMenuOpen(false)}>A verse for today</Link>
          <Link href="/#about" onClick={() => setMenuOpen(false)}>About the text</Link>
        </nav>
        <div className="header-actions"><button className="menu-button" aria-label={menuOpen ? "Close menu" : "Open menu"} onClick={() => setMenuOpen((open) => !open)}>{menuOpen ? <X size={21} /> : <Menu size={21} />}</button></div>
      </header>

      <main className="chapter-page">
        <div className="reader-breadcrumb"><Link href="/#chapters"><ArrowLeft size={14} /> Chapter index</Link><span>{chapter ? chapterLabel(chapter) : "Opening"}</span></div>
        {loading ? (
          <div className="reader-loading"><div className="reader-loading-mark" />Opening the supplied source text…</div>
        ) : chapter && (
          <>
            <section className="chapter-masthead">
              <div>
                <p className="chapter-label">{chapterLabel(chapter)} <span>/</span> {chapter.verseCount} verses</p>
                <h1>{chapter.title}</h1>
                <p className="chapter-sanskrit">{chapter.sanskritName}</p>
                <p className="chapter-description">{chapter.description}</p>
              </div>
              <div className="chapter-masthead-art"><img src="/manus-storage/gita-manuscript-detail_b2a50acd.png" alt="A manuscript and lamp in the reading room" /><span>the source text<br /><em>open at the margin</em></span></div>
            </section>

            <section className="chapter-reading-layout" aria-label={`${chapter.title} reading view`}>
              <aside className="verse-index-panel">
                <div className="verse-index-heading"><span>Verse index</span><span>{verses.length}</span></div>
                <div className="verse-index-list" role="list">
                  {verses.map((verse, index) => (
                    <button key={verse.verseNumber} className={`verse-index-row ${index === activeIndex ? "verse-index-row--active" : ""}`} onClick={() => setActiveIndex(index)} role="listitem">
                      <span>{verse.verseNumber}</span><span>{verse.translation.slice(0, 44)}{verse.translation.length > 44 ? "…" : ""}</span><ChevronRight size={14} />
                    </button>
                  ))}
                </div>
              </aside>

              <article className="verse-reader-card" key={`${chapter.chapter}-${activeVerse?.verseNumber ?? "loading"}-${language}`}>
                {activeVerse && <>
                  <div className="verse-card-header"><div><p className="chapter-label">{chapterLabel(chapter)}</p><h2>Verse {activeVerse.verseNumber}</h2></div><div className="language-toggle" role="group" aria-label="Verse language"><button className={language === "en" ? "language-toggle--active" : ""} onClick={() => setLanguage("en")}>English</button><button className={language === "hi" ? "language-toggle--active" : ""} onClick={() => setLanguage("hi")}>हिन्दी</button></div></div>
                  <div className="sanskrit-block"><Quote size={24} strokeWidth={1.1} /><p>{activeVerse.sanskrit}</p></div>
                  <p className="verse-transliteration-detail">{activeVerse.transliteration}</p>
                  <div className="translation-block"><p className="reader-section-label">{language === "hi" ? "हिन्दी अनुवाद" : "Translation"}</p><blockquote className="verse-translation" lang={language}>{activeVerse.translation}</blockquote></div>
                  <div className="interpretation-block"><p className="reader-section-label">A note on the verse</p><p>{activeVerse.interpretation}</p></div>
                  <div className="reader-actions"><button className="ink-button" onClick={copyVerse}>{copied ? <Check size={15} /> : <ArrowRight size={15} />} {copied ? "Copied" : "Copy translation"}</button><button className={`save-button ${saved ? "save-button--saved" : ""}`} onClick={() => setSaved((value) => !value)}><Bookmark size={16} fill={saved ? "currentColor" : "none"} /> {saved ? "Saved to your shelf" : "Keep this verse"}</button></div>
                  <div className="verse-pager"><button disabled={activeIndex === 0} onClick={() => setActiveIndex((index) => Math.max(0, index - 1))}><ChevronLeft size={16} /> Previous verse</button><span>{activeIndex + 1} / {verses.length}</span><button disabled={activeIndex === verses.length - 1} onClick={() => setActiveIndex((index) => Math.min(verses.length - 1, index + 1))}>Next verse <ChevronRight size={16} /></button></div>
                </>}
              </article>
            </section>

            <nav className="chapter-pager" aria-label="Chapter navigation">
              {previousChapter ? <Link href={`/chapter/${previousChapter.chapter}`}><ChevronLeft size={16} /><span><small>Previous chapter</small>{previousChapter.title}</span></Link> : <span />}
              {nextChapter ? <Link href={`/chapter/${nextChapter.chapter}`}><span><small>Next chapter</small>{nextChapter.title}</span><ChevronRight size={16} /></Link> : <span />}
            </nav>
          </>
        )}
      </main>
      <footer className="site-footer"><Link className="brand brand--footer" href="/"><span className="brand-seal"><img src="/manus-storage/gita-seal_d10467e6.png" alt="" /></span><span className="brand-lockup"><strong>GITA</strong><small>अध्ययन / a quiet study</small></span></Link><p>Read slowly. Return often.</p><div className="footer-links"><Link href="/#chapters">Chapters</Link><Link href="/#verse">Daily verse</Link><Link href="/#about">About</Link></div></footer>
    </div>
  );
}
