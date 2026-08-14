# Bhagavad Gita — Design Direction

## Three Possible Directions

### Theme Name: Parchment & Ink
Very Brief Intro: A warm, editorial reading room inspired by annotated scripture, Indian miniature painting, and handmade paper. The experience feels patient, grounded, and made for returning to a passage.  
Probability: 0.07

### Theme Name: River of Counsel
Very Brief Intro: A light, atmospheric experience built around flowing sections, sunrise gradients, and a visual metaphor of the Gita as a river of counsel moving through uncertainty.  
Probability: 0.03

### Theme Name: Night Before Dawn
Very Brief Intro: A restrained dark study interface with indigo space, copper light, and luminous verse cards that frame the Gita as clarity found in the middle of crisis.  
Probability: 0.05

## Chosen Approach: Parchment & Ink

### Design Movement
Contemporary editorial minimalism with references to Indian miniature painting, archival book design, and the tactile restraint of a devotional reading room.

### Core Principles
1. **Reading is the primary interaction.** Every section gives the eye a clear place to rest before offering an action.
2. **Sacred, not ornamental.** Use motifs sparingly: a thin sun-disc, a hand-drawn line, a small lotus-like seal, and paper grain rather than decorative excess.
3. **Asymmetric calm.** Composition should feel like an open spread: a narrow margin column for context, a generous reading column for meaning, and offset cards that avoid a generic centered landing page.
4. **Warm clarity.** Contrast comes from ink, saffron, and blue-black rather than saturated gradients or heavy shadows.

### Color Philosophy
The base is unbleached paper, giving the page a human, tactile warmth. Deep indigo carries the seriousness of the text; saffron marks attention and action; muted vermilion is reserved for rare moments of emphasis. The palette should evoke dawn light on an old manuscript, never a temple theme park.

### Layout Paradigm
An editorial “open folio” layout: a persistent top bar, an asymmetrical hero with a vertical chapter marker, and a reading path that alternates between full-width pauses and offset two-column spreads. On mobile, the margin column collapses into small eyebrow labels so the text remains dominant.

### Signature Elements
- A slim vertical saffron rule used as a chapter / section marker.
- A stamped circular seal with a simple chariot-wheel / sun-disc geometry, used as a brand mark and favicon.
- Paper-grain texture, fine ink borders, and a few intentionally imperfect underline strokes.

### Interaction Philosophy
Interactions should feel like turning a page or selecting a passage, not operating a dashboard. Buttons use quiet ink fills, hover states lift by a few pixels, and verse cards reveal a secondary line of context rather than flashing. Keyboard focus remains visible as a saffron ring.

### Animation
Use small, deliberate entrances: the hero eyebrow and title rise in sequence; the chapter list fades in with a 50ms stagger; the featured verse slides in a few pixels on hover. Keep transitions between 160–260ms with a cubic-bezier ease-out. Never animate the reading text itself. Respect `prefers-reduced-motion` by disabling decorative entrances.

### Typography System
Use **Cormorant Garamond** for display titles, chapter numerals, and verse quotations; use **DM Sans** for navigation, metadata, buttons, and explanatory copy. Display headlines are large, slightly tight, and allowed to wrap. Body copy stays at a comfortable 1.65 line-height with modest tracking. Avoid all-caps except for tiny metadata labels.

### Brand Essence
An accessible digital reading room for people who want to approach the Bhagavad Gita slowly, one teaching at a time.  
Personality adjectives: **grounded, luminous, thoughtful**.

### Brand Voice
Headlines are concise and reflective. CTAs sound invitational rather than urgent. Microcopy names what a reader will feel or understand next; it does not promise transformation in generic terms.

Example lines:
- “Begin where the question becomes honest.”
- “A verse to carry into the day.”

### Wordmark & Logo
The wordmark is set as a custom lockup: a small saffron sun-disc seal sits to the left of a two-line “Gita / अध्ययन” stack, with a thin rule extending beneath the second line. The mark itself is a geometric eight-spoke wheel contained in an imperfect circle, designed to read clearly at favicon size without relying on text.

### Signature Brand Color
**Saffron Thread — `#C8783A`**. A softened, earthy saffron that feels like dyed cotton and inked paper rather than neon orange.

## Content Model

The first experience is a single, high-quality home page with four destinations: **The Gita**, **18 Chapters**, **A Verse for Today**, and **About the Text**. The page uses concise, editable content blocks so uploaded translations, commentary, portraits, or scans can be integrated without restructuring the interface.

## Working Assumption

No user-uploaded source files were discoverable in the sandbox at build time. The first pass therefore uses concise, non-attributed editorial copy and canonical chapter / verse references as placeholders, while keeping the content model visibly ready for the user's materials.
