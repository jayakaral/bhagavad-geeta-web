/**
 * Design note: Parchment & Ink — an asymmetrical editorial reading room for the
 * Bhagavad Gita. Cormorant Garamond carries the sacred text; DM Sans handles
 * navigation and utility copy. Warm paper, indigo ink, and one saffron thread.
 */
import { useEffect, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Bookmark,
  Check,
  ChevronRight,
  CircleDot,
  Menu,
  Quote,
  Search,
  Sparkles,
  X,
} from "lucide-react";

const chapters = [
  { number: "01", name: "The Yoga of Arjuna's Despair", mood: "The question", color: "ochre" },
  { number: "02", name: "The Yoga of Knowledge", mood: "The witness", color: "indigo" },
  { number: "03", name: "The Yoga of Action", mood: "The work", color: "vermilion" },
  { number: "04", name: "The Yoga of Wisdom", mood: "The fire", color: "sage" },
  { number: "05", name: "The Yoga of Renunciation", mood: "The release", color: "ochre" },
  { number: "06", name: "The Yoga of Meditation", mood: "The stillness", color: "indigo" },
];

const pillars = [
  { label: "Dharma", title: "The work that is yours", body: "See your place clearly, then act without asking the result to prove your worth." },
  { label: "Jnana", title: "The knowing behind change", body: "Learn to notice what moves through you and what remains when the noise has passed." },
  { label: "Bhakti", title: "The heart that offers", body: "Let devotion be an attention to the world as it is, not an escape from it." },
];

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeChapter, setActiveChapter] = useState(1);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 28);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const selectedChapter = chapters[activeChapter];

  const copyVerse = async () => {
    try {
      await navigator.clipboard.writeText("You have a right to action alone, never to its fruits.");
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="site-shell">
      <header className={`site-header ${scrolled ? "site-header--scrolled" : ""}`}>
        <a className="brand" href="#top" aria-label="Gita home" onClick={() => setMenuOpen(false)}>
          <span className="brand-seal"><img src="/manus-storage/gita-seal_d10467e6.png" alt="" /></span>
          <span className="brand-lockup"><strong>GITA</strong><small>अध्ययन / a quiet study</small></span>
        </a>
        <nav className={`main-nav ${menuOpen ? "main-nav--open" : ""}`} aria-label="Primary navigation">
          <a href="#chapters" onClick={() => setMenuOpen(false)}>The Gita</a>
          <a href="#chapters" onClick={() => setMenuOpen(false)}>18 chapters</a>
          <a href="#verse" onClick={() => setMenuOpen(false)}>A verse for today</a>
          <a href="#about" onClick={() => setMenuOpen(false)}>About the text</a>
        </nav>
        <div className="header-actions">
          <button className="icon-button" aria-label="Search the Gita" onClick={() => scrollToId("chapters")}>
            <Search size={18} strokeWidth={1.7} />
          </button>
          <button className="menu-button" aria-label={menuOpen ? "Close menu" : "Open menu"} onClick={() => setMenuOpen((open) => !open)}>
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </header>

      <main id="top">
        <section className="hero-section">
          <div className="hero-copy">
            <div className="eyebrow reveal reveal--one"><span className="eyebrow-line" />A digital reading room</div>
            <h1 className="hero-title reveal reveal--two">Begin where<br /><em>the question</em><br />becomes honest.</h1>
            <p className="hero-intro reveal reveal--three">The Bhagavad Gita is a conversation held at the edge of action — a place to return when the next step feels unclear.</p>
            <div className="hero-actions reveal reveal--four">
              <button className="ink-button" onClick={() => scrollToId("chapters")}>Open the reading room <ArrowUpRight size={16} /></button>
              <button className="text-button" onClick={() => scrollToId("verse")}>Read verse 2.47 <ArrowDownRight size={15} /></button>
            </div>
            <div className="hero-note reveal reveal--five"><CircleDot size={14} />18 chapters <span />700 verses <span />one enduring question</div>
          </div>
          <div className="hero-art" aria-label="Illustration of Krishna and Arjuna at dawn">
            <img src="/manus-storage/gita-hero_b1561de2.png" alt="Krishna and Arjuna seated on a chariot at dawn" />
            <div className="art-caption"><span>01</span><span>the field of decision</span></div>
            <div className="art-stamp">शान्ति<br /><small>shanti</small></div>
          </div>
          <div className="hero-side-note">A text on <strong>clarity</strong><br />in the middle of change</div>
        </section>

        <section className="quote-band" aria-label="Opening reflection">
          <div className="quote-mark">“</div>
          <div className="quote-content">
            <p>Whenever there is a decline in dharma and an increase in adharma, I manifest myself.</p>
            <div className="quote-meta"><span>Bhagavad Gita</span><span>4.7</span><span className="meta-rule" /><span>on returning</span></div>
          </div>
          <div className="quote-aside">For the reader who is<br /><em>standing between</em> two worlds.</div>
        </section>

        <section className="reading-section" id="chapters">
          <div className="section-margin">
            <p className="section-number">I / IV</p>
            <p className="section-label">A map of the text</p>
            <div className="margin-rule" />
            <p className="margin-copy">A study does not need to be hurried. Choose a door, then let the question do its work.</p>
          </div>
          <div className="reading-main">
            <div className="section-heading-row">
              <div>
                <div className="eyebrow"><span className="eyebrow-line" />The structure</div>
                <h2 className="section-title">18 chapters.<br /><em>One movement inward.</em></h2>
              </div>
              <p className="section-dek">From crisis to discernment, the Gita moves less like a straight road and more like a spiral: the same human question, seen with a little more light.</p>
            </div>
            <div className="chapter-layout">
              <div className="chapter-list" role="list" aria-label="Selected Bhagavad Gita chapters">
                {chapters.map((chapter, index) => (
                  <button key={chapter.number} className={`chapter-row ${activeChapter === index ? "chapter-row--active" : ""}`} onClick={() => setActiveChapter(index)} role="listitem">
                    <span className={`chapter-dot chapter-dot--${chapter.color}`} />
                    <span className="chapter-index">{chapter.number}</span>
                    <span className="chapter-name">{chapter.name}</span>
                    <span className="chapter-mood">{chapter.mood}</span>
                    <ChevronRight size={17} className="chapter-arrow" />
                  </button>
                ))}
                <button className="all-chapters" onClick={() => setActiveChapter(0)}>View all chapters <ArrowUpRight size={15} /></button>
              </div>
              <div className="chapter-feature" key={selectedChapter.number}>
                <div className="feature-topline"><span>Currently open</span><span>Chapter {selectedChapter.number}</span></div>
                <div className="feature-image"><img src="/manus-storage/gita-manuscript-detail_b2a50acd.png" alt="Open manuscript beside a brass lamp" /></div>
                <div className="feature-copy">
                  <p className="feature-kicker">{selectedChapter.mood}</p>
                  <h3>{selectedChapter.name}</h3>
                  <p>Arjuna’s pause becomes the beginning of a deeper kind of movement: not away from difficulty, but through it.</p>
                  <button className="text-button text-button--dark" onClick={() => scrollToId("verse")}>Enter this chapter <ArrowUpRight size={15} /></button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="verse-section" id="verse">
          <div className="verse-watermark">02.47</div>
          <div className="verse-inner">
            <div className="verse-context">
              <div className="eyebrow"><span className="eyebrow-line" />A verse to carry</div>
              <p>Chapter 02 <span>/</span> Verse 47</p>
              <div className="verse-context-rule" />
              <p className="verse-context-small">A reminder that the dignity of action lives in the doing — not in the applause that may follow.</p>
            </div>
            <div className="verse-quote">
              <Quote size={31} strokeWidth={1.1} className="quote-icon" />
              <blockquote>You have a right to action alone,<br />never to its fruits.</blockquote>
              <p className="verse-transliteration">कर्मण्येवाधिकारस्ते मा फलेषु कदाचन</p>
              <div className="verse-actions">
                <button className="ink-button ink-button--light" onClick={copyVerse}>{copied ? <Check size={15} /> : <ArrowUpRight size={15} />} {copied ? "Copied" : "Copy verse"}</button>
                <button className={`save-button ${saved ? "save-button--saved" : ""}`} onClick={() => setSaved((value) => !value)}><Bookmark size={16} fill={saved ? "currentColor" : "none"} /> {saved ? "Saved to your shelf" : "Keep this verse"}</button>
              </div>
            </div>
          </div>
        </section>

        <section className="pillars-section" id="about">
          <div className="pillars-intro">
            <div className="eyebrow"><span className="eyebrow-line" />Three ways in</div>
            <h2 className="section-title">A text that<br /><em>meets you there.</em></h2>
            <p>Read the Gita as philosophy, as poetry, or as a practical companion for the next decision. Its language changes with the attention you bring to it.</p>
            <button className="text-button" onClick={() => scrollToId("top")}>Return to the beginning <ArrowDownRight size={15} /></button>
          </div>
          <div className="pillar-list">
            {pillars.map((pillar, index) => (
              <article className="pillar-card" key={pillar.label}>
                <div className="pillar-number">0{index + 1}</div>
                <div>
                  <p className="pillar-label">{pillar.label}</p>
                  <h3>{pillar.title}</h3>
                  <p>{pillar.body}</p>
                </div>
                <ArrowUpRight size={17} className="pillar-icon" />
              </article>
            ))}
          </div>
        </section>

        <section className="closing-section">
          <div className="closing-disc"><Sparkles size={22} strokeWidth={1.2} /></div>
          <p className="eyebrow"><span className="eyebrow-line" />For the open question</p>
          <h2>Come back to the<br /><em>conversation.</em></h2>
          <p>Keep a passage close. Read it once in the morning, once when the day changes shape.</p>
          <button className="ink-button" onClick={() => scrollToId("chapters")}>Choose a chapter <ArrowUpRight size={16} /></button>
        </section>
      </main>

      <footer className="site-footer">
        <a className="brand brand--footer" href="#top">
          <span className="brand-seal"><img src="/manus-storage/gita-seal_d10467e6.png" alt="" /></span>
          <span className="brand-lockup"><strong>GITA</strong><small>अध्ययन / a quiet study</small></span>
        </a>
        <p>Made for slow reading, honest questions, and the next right action.</p>
        <div className="footer-links"><a href="#chapters">Chapters</a><a href="#verse">Daily verse</a><a href="#about">About</a></div>
      </footer>
    </div>
  );
}
