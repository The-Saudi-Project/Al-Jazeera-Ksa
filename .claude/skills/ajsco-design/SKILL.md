---
name: ajsco-design
description: Design system rules for the AJSCO corporate website — colour roles and proportions, the fluid type scale, spacing rhythm, component patterns, and AOS motion craft. Use whenever building, restyling, or reviewing any UI on this site, including new sections, cards, forms, or page layouts.
---

# AJSCO Design System

Derived from `assets/css/style.css`. **This system already exists — your job is
to extend it, not replace it.** Before adding any CSS, search `style.css` for a
component that already does the job. Reuse beats invention every time here.

Constraints (no build step, no React, no Tailwind) are in `CLAUDE.md`. This file
is about taste.

---

## The brand in one line

Heavy industrial contracting in Saudi Arabia. The visual language is
**engineered, not decorated**: squared corners, restrained colour, generous
whitespace, dense factual content. It should feel like a company that operates
tower cranes, not a SaaS startup.

---

## Colour

### Roles, not swatches

| Token | Role | Where |
|---|---|---|
| `--ajs-navy` `#071B2C` | Authority. Headings, dark bands, footer. | Every heading, hero, footer, CTA band |
| `--ajs-green` `#0B8A6B` | Action + accent. | Primary buttons, links, eyebrows, active states |
| `--ajs-gold` `#C8A96A` | Premium punctuation. **Focus rings.** | Sparingly — dividers, accent numerals, focus outline |
| `--ajs-text` `#1E1E1E` | Body copy | |
| `--ajs-muted` `#6C757D` | Secondary copy, leads | |
| `--ajs-surface` `#F7F9FB` | Alternating section bands | |

### Proportion is the rule that matters

Roughly **70% neutral (white/surface), 20% navy, 8% green, 2% gold.**

Gold is punctuation. The moment gold appears in more than one or two elements
per viewport, the page stops reading as industrial and starts reading as a hotel
brochure. If you're reaching for gold to make something stand out, the real
problem is usually hierarchy or spacing.

### Rules

- **Never write a raw hex value.** Add a token to section 01 if you truly need a
  new colour, and comment why.
- Alternate section backgrounds `--ajs-bg` → `--ajs-surface` to segment the page.
  Never two `--ajs-surface` bands adjacent.
- On dark bands use `--ajs-on-dark` and `--ajs-on-dark-muted`, never
  opacity-faded white.
- Green on navy is low-contrast — don't use `--ajs-green` for text on
  `--ajs-navy`. Use gold or white.

---

## Typography

Poppins throughout (Cairo for Arabic via `.ajs-ar`). One family. Don't add a
second display face.

### The scale is fluid — use the tokens

```
--ajs-h1   clamp(2.1rem, 1.3rem + 2.6vw, 3.5rem)
--ajs-h2   clamp(1.7rem, 1.2rem + 1.6vw, 2.5rem)
--ajs-h3   clamp(1.22rem, 1.05rem + 0.65vw, 1.55rem)
--ajs-h4   clamp(1.05rem, 0.98rem + 0.32vw, 1.22rem)
--ajs-lead clamp(0.98rem, 0.94rem + 0.25vw, 1.08rem)
```

**Never hardcode a font size for a heading.** If something needs to be between
two steps, the layout is wrong, not the scale.

This scale was deliberately tightened because headings were sized as though they
owned the full container width. When a heading shares its row with anything
else, check the wrap at 1200px and 1440px, not just at the extremes.

### Craft rules

- Headings: `700`, `line-height: 1.18`, `letter-spacing: -0.02em`, navy. Set
  globally — don't restate per component.
- Body: `1.68` line-height. Leads: `1.85` and `--ajs-muted`.
- **Measure**: cap body copy at ~65–75 characters. On a 12-column band that
  means `col-lg-8` at most for paragraphs. Full-width paragraphs are the single
  most common failure on wide screens.
- One `<h1>` per page. Never skip a level for visual size — use `.h2`/`.h3`
  classes to style a semantically-correct heading down.
- The `.ajs-eyebrow` label (uppercase, `0.18em` tracking, green, with a rule
  before it) sits above almost every section heading. Use it; it's a signature
  element of the system.

---

## Spacing

- Vertical band rhythm: `--ajs-section-y`, applied via `.ajs-section`. Don't
  hand-tune per section — if a band feels wrong, the content density is the
  problem.
- Horizontal: Bootstrap grid with `--ajs-gutter: 1.5rem`.
- Within components, step in `0.25rem` (4px) increments off a 4/8px grid. No
  `13px`, no `0.37rem`.
- **Whitespace carries the premium feel.** When a section looks cheap, the fix
  is almost always more space around fewer elements, not more decoration.

---

## Shape and elevation

Squared, not rounded — `--ajs-radius: 4px`, `--ajs-radius-lg: 8px`. Nothing on
this site is a pill. Rounded-full buttons or `border-radius: 16px` cards break
the industrial read immediately.

Shadows are wide and soft, tinted navy:

- `--ajs-shadow-sm` — resting cards
- `--ajs-shadow` — hover lift
- `--ajs-shadow-lg` — modals, overlay header

Borders are `--ajs-border` / `--ajs-border-strong`. Prefer a 1px border over a
shadow for resting state; reserve shadow for interaction.

---

## Components

Before building: sections 11 (Cards), 12 (Split Feature Blocks), 21–30 already
cover most layouts. Check first.

### Buttons — four variants, that's the set

`.btn-ajs-primary` (green), `.btn-ajs-navy`, `.btn-ajs-gold`,
`.btn-ajs-outline` / `.btn-ajs-outline-light`.

Squared, `600` weight, `0.04em` tracking, `white-space: nowrap`. Hover is
**`translateY(-2px)` + `var(--ajs-shadow)`** — the house interaction. Apply the
same lift to cards. Consistency of that one gesture is what makes the site feel
built rather than assembled.

One primary action per section. If two buttons sit together, the second is
outline.

### Cards

Border + `--ajs-shadow-sm` at rest, lift + `--ajs-shadow` on hover. Equal
heights in a row (`h-100`). Icon or image, `.ajs-eyebrow`-scale label, `h3`
title, muted body, optional text link. Don't mix card variants in one grid.

### Forms

Labels above inputs, always visible — no placeholder-as-label. Squared inputs,
gold focus ring inherited from `:focus-visible`. Validation messages are text,
not colour alone.

---

## Motion — AOS

Config lives in `main.js` section 10: `duration: 800`, `ease-out-cubic`,
`once: true`, `offset: 60`, off under reduced-motion and below 576px. Don't
change these per-element.

### Vocabulary — do not extend it

- `fade-up` — the default, for essentially everything
- `fade-right` / `fade-left` — split blocks only, matching the content side
- `zoom-in` — rare, hero and stat emphasis only

### Stagger

Delays step in **60ms increments**: `60`, `120`, `180`, `240`. Cap a stagger
chain at four items — beyond that the last card arrives late enough to feel
broken. A 3-card row is `0 / 60 / 120`.

The existing markup has ten inconsistent delay values. Normalise as you touch
files; don't propagate them.

### Interaction motion

`--ajs-speed` (0.35s) and `--ajs-ease` on every transition. Transition specific
properties, not `all`, in new code. Never animate anything that shifts layout —
reserve space up front.

Decorative loops (hero drift, marquee, scroll cue) must be **stopped outright**
in section 31 under reduced-motion, not merely shortened.

---

## Avoid the generic AI aesthetic

Concretely, on this site that means **no**:

- Purple/indigo/violet anything, or a blue→purple gradient. The palette is navy,
  green, gold.
- Glassmorphism, `backdrop-filter` blur panels, neon glows.
- Emoji as icons — Bootstrap Icons or the project's SVGs only.
- Gradient text, or gradient buttons.
- Pill-shaped buttons, `border-radius: 9999px`, heavily rounded cards.
- Three identical feature cards with a generic icon, a two-word title, and a
  sentence of filler. If the copy is placeholder, say so rather than shipping
  lorem-adjacent text.
- "Empowering. Innovative. Seamless." Marketing abstractions. This client's
  credibility comes from **specifics**: tonnage, fleet counts, years, client
  names, project scale, certifications.
- Centre-aligned everything. Left-align body copy; centre only short headings.
- Dark-mode-first styling — this is a light site.

### What to reach for instead

Real numbers rendered large. Photography of actual sites and equipment.
Technical drawing motifs (see the coded hero backdrop, section 09a). Dense,
well-organised tables and specs. Generous margins around sober type. Restraint
reads as competence in this sector.

---

## Before you call it done

- Renders correctly at 380 / 576 / 768 / 992 / 1200 / 1400px.
- No horizontal scroll at any width.
- Every new colour and size traces to a token.
- Keyboard tab order works; focus ring visible on every interactive element.
- Contrast ≥ 4.5:1 for body text, 3:1 for large text.
- Checked with reduced-motion on.
- Change applied consistently to **all nine pages**, not just the one you started with.
- `?v=N` bumped on all nine pages if CSS changed.
