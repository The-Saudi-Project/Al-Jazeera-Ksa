# AJSCO Corporate Website

Marketing site for **Al Jazeera Service Contracting Co. (AJSCO)** — a heavy
industrial contracting company in Saudi Arabia (civil, mechanical, manpower
supply, equipment rental; oil & gas, petrochemical, power, infrastructure).

Audience is procurement managers and project directors at industrial clients.
The site's job is to establish **credibility and scale**, not to look trendy.
Sober, engineered, substantial. Never playful.

---

## Stack — read this before suggesting anything

**Static multi-page HTML. There is no build step, no bundler, no framework.**

| Layer | What it actually is |
|---|---|
| Pages | 9 hand-written `.html` files at the repo root |
| CSS | Bootstrap 5.3.3 (CDN) + `assets/css/style.css` + `assets/css/responsive.css` |
| JS | Bootstrap bundle (CDN), AOS 2.3.1 (CDN), `assets/js/main.js` (vanilla, IIFE, ES5-style) |
| Icons | Bootstrap Icons 1.11.3 (CDN) |
| Fonts | Poppins (Latin) + Cairo (Arabic), Google Fonts |

Consequences, all of them non-negotiable:

- **No React, no JSX, no npm runtime dependencies.** Framer Motion, 21st.dev
  components, shadcn/ui, and anything else React-based cannot run here. If a
  suggestion requires a bundler, it is out of scope — say so instead of
  building it.
- **No Tailwind.** Use Bootstrap utilities and the `--ajs-*` tokens.
- Anything added must work by opening the `.html` file directly.
- `package.json` exists only as a leftover; nothing in the site imports from
  `node_modules/`.

## File map

```
index.html        Home — the most complex page (~95 KB), overlay header, full-viewport hero
about.html        Company, leadership, vision/mission, timeline
services.html     Four service lines with detail sections
projects.html     Project portfolio with filter tabs
equipment.html    Rental fleet, category tabs, SVG equipment icons
careers.html      Roles and application form
contact.html      Contact form, offices, map
privacy.html      Legal
assets/css/style.css        3,200+ lines. The design system. Numbered sections.
assets/css/responsive.css   Breakpoint overrides ONLY. Nothing else lives here.
assets/js/main.js           ~500 lines, 11 numbered sections
assets/images/              ~13 MB — known performance problem, see below
sitemap.xml, robots.txt     Keep in sync when pages are added or renamed
walkthrough.md              Author's notes on the build
```

## Conventions

**CSS is organised by numbered section** with a table of contents at the top of
`style.css` (01. Design Tokens → 36. Project Detail Cards). When you add
component CSS:

- Put it in the right existing section, or add a new numbered one **and update
  the contents block at the top of the file**.
- Sections 32–36 are page-specific (services, careers, equipment, contact,
  projects). Note the file's section numbering is currently out of order at the
  end — 31 (Motion & Print) sits after 36. Leave that alone unless asked; it's
  cosmetic and reshuffling it produces a huge diff.
- Breakpoint overrides go in `responsive.css`, never inline in `style.css`.

**Class naming is `ajs-` prefixed BEM-ish**: `.ajs-hero`, `.ajs-hero-canvas`,
`.ajs-hero--coded`, `.ajs-service-card`, `.btn-ajs-primary`. Follow it exactly.

**Every rule that isn't obvious carries a comment explaining *why*** — not what
it does, why it's that value. Match this. It's the strongest convention in the
codebase and the reason the CSS is maintainable at 3,200 lines.

**JS is vanilla, IIFE-wrapped, `var`-based, feature-detected.** Each behaviour
is a named `initX()` function in a numbered section. Nothing throws if an
element is absent. Match that style; don't modernise it piecemeal.

**Cache busting**: stylesheet links carry `?v=N`. When you change either CSS
file, bump the version **on all 9 pages together**. Currently `?v=6`.

**Bilingual**: Arabic companion labels use `.ajs-ar` (Cairo, RTL-isolated). The
site is not RTL overall; don't convert it without being asked.

## Hard rules

1. **Never introduce a raw hex, rgb, or hsl value** where an `--ajs-*` token
   exists. If a genuinely new colour is needed, add a token in section 01 first.
   (Existing exception: `#B89755`, the gold hover in section 05. Don't add more.)
2. **Never hardcode a font size.** Use `--ajs-h1..h4`, `--ajs-lead`, or a
   relative `em`.
3. **Cross-page consistency is mandatory.** The header, footer, topbar, CTA
   band, and buttons are duplicated across 9 files. Change one, change all nine
   — a partial pass is worse than no change.
4. **Never break SEO.** Canonical tags, meta descriptions, Open Graph tags,
   JSON-LD structured data, `sitemap.xml`, `robots.txt` — all must survive
   any refactor.
5. **All motion respects `prefers-reduced-motion`.** Section 31 handles the
   global case; looping decorative animations must be stopped outright there,
   not just sped up.
6. **Accessibility is not optional.** Focus rings (`:focus-visible`, gold, 3px)
   already exist — don't remove them. Decorative SVG gets `aria-hidden="true"`.
   Every image needs meaningful `alt`.

## Animation approach — AOS

Scroll reveals use **AOS 2.3.1**, initialised in `main.js` section 10:
`duration: 800`, `easing: "ease-out-cubic"`, `once: true`, `offset: 60`,
disabled under reduced-motion and below 576px.

House vocabulary — do not add new AOS types beyond these:

| Attribute | Used for |
|---|---|
| `fade-up` | Default. ~180 uses. Almost everything. |
| `fade-right` / `fade-left` | Split feature blocks, alternating sides |
| `zoom-in` | Rare, reserved for hero/stat emphasis |

**Stagger delays should step in 60ms increments** (`60`, `120`, `180`, `240`).
The codebase currently has ten different delay values (40, 50, 80, 100, 150,
160…) — that drift is a known defect worth cleaning up, not a pattern to copy.

Hover/transition motion uses `--ajs-speed` (0.35s) and `--ajs-ease`
(`cubic-bezier(0.22, 0.61, 0.36, 1)`). The house lift is `translateY(-2px)`
plus `var(--ajs-shadow)`.

Counters (`main.js` section 05) use `IntersectionObserver` directly, not AOS.

## Known issues

- **`assets/images/` is ~13 MB.** JPEGs unoptimised, no WebP, `landing.png` is
  1024×1024 and gets upscaled as a hero. Biggest performance problem on the site.
- Most `<img>` tags lack explicit `width`/`height` → layout shift.
- Three render-blocking CDN stylesheets in `<head>` on every page.
- AOS delay values are inconsistent (above).
- Header/footer markup is duplicated 9× with no include mechanism; drift between
  pages is the main correctness risk in this repo.

## Hero backdrop A/B

The hero supports two backdrops, both present in the markup on `index.html`:

- `<section class="ajs-hero ajs-hero--coded">` → drawn SVG blueprint backdrop
  (CSS section 09a). Weightless, sharp at any DPI, no licensing risk.
- Remove `ajs-hero--coded` → photograph via `--ajs-hero-image`.

Currently the coded backdrop is active. Keep both paths working.

## Working style

- Change one page first, show the diff, then apply across the rest.
- Commit per logical unit with a message explaining *why*, matching the existing
  log style.
- Shell is **Windows PowerShell 5.1** — no `&&`, no `printf`. Chain with `;` or
  `; if ($?) { }`.
- If an instruction conflicts with what's in the code, say so rather than
  guessing.
