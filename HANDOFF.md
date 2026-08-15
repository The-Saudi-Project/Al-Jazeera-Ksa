# AJSCO Website — Session Handoff

Paste this whole file as your first message in a new session, then say
what you want to work on.

---

## 1. What this is

Marketing site for **Al Jazeera Service Contracting Co. (AJSCO)** — a heavy
industrial contractor in Dammam, Saudi Arabia. Audience is procurement managers
and project directors at industrial clients. The site's job is credibility and
scale, not trend.

**Read `CLAUDE.md` first** — it holds the hard rules. **Load the `ajsco-design`
skill** before touching any UI; it defines colour proportions, the type scale,
spacing, component patterns and motion craft.

### Stack — non-negotiable

Static multi-page HTML. **No build step, no bundler, no framework.**

| Layer | What it is |
|---|---|
| Pages | 7 hand-written `.html` at repo root |
| CSS | Bootstrap 5.3.3 (CDN) + `assets/css/style.css` + `assets/css/responsive.css` |
| JS | Bootstrap bundle + AOS 2.3.1 (CDN) + `assets/js/main.js` (vanilla, IIFE, `var`-based) |
| Icons | Bootstrap Icons 1.11.3 (CDN) |
| Fonts | Poppins (Latin) + Cairo (Arabic), Google Fonts |
| Forms | Formspree |

No React, no Tailwind, no npm runtime deps. Everything must work by opening the
HTML directly.

---

## 2. Current state

**Branch:** `feat/corporate-website` · **HEAD:** `bc57eb0 forms setup complete`
· working tree clean · no remote configured.

```
index.html      1970 lines    services.html    987
about.html       854          projects.html    552
careers.html     464          contact.html     452
privacy.html     367
style.css       3491          responsive.css   328
main.js          704
sitemap.xml · robots.txt · CLAUDE.md · walkthrough.md
```

Cache buster is at **`?v=15`** on both CSS files and `main.js`, on all 7 pages.

### Environment quirks that will bite you

- **Windows + Git Bash.** No `python`, `node`, or image tooling. Use `perl` for
  multi-line edits, `sed` for single-line.
- **Browser preview does not work.** `file://` is blocked and there's no server
  runtime. You cannot see the site. Validate structurally and hand the user a
  test checklist — do not claim visual verification.
- **The user runs and tests everything themselves.** They have said explicitly:
  do not run or install things; tell them what to run.
- The user edits files between turns. **Re-read before editing** — several
  "file modified on disk" errors happened this way.

---

## 3. Validation commands (use these after every change)

```bash
# Tag balance — comment- AND whitespace-aware. Naive greps give false positives:
#   <li> inside an HTML comment, and <span\n class=...> line-wrapped tags.
for f in *.html; do perl -0777 -ne 's/<!--.*?-->//gs; for my $t (qw(html head body header nav footer section div ul li form article script span a p)) { my $o=()=/<$t[\s>]/g; my $c=()=/<\/$t>/g; print "'"$f"' <$t> $o/$c\n" if $o!=$c }' "$f"; done

# Assets resolve
grep -oh 'src="assets/[^"]*"\|href="assets/[^"]*"' *.html | sed 's/.*="//;s/"$//;s/?.*//' | sort -u | while read f; do [ -f "$f" ] || echo "MISSING: $f"; done

# Internal links resolve
grep -oh 'href="[a-z0-9-]*\.html[^"]*"' *.html | sed 's/href="//;s/"$//;s/#.*//' | sort -u | while read f; do [ -f "$f" ] || echo "BROKEN: $f"; done

# CSS: braces balanced, every var() defined, no raw hex, no inline styles
for f in assets/css/*.css; do o=$(tr -cd '{' < "$f" | wc -c); c=$(tr -cd '}' < "$f" | wc -c); echo "$f $o/$c"; done
grep -oh 'var(--ajs-[a-z0-9-]*)' assets/css/*.css | sed 's/var(//;s/)//' | sort -u | while read v; do grep -qE "^\s*$v:" assets/css/style.css assets/css/responsive.css || echo "UNDEFINED: $v"; done
awk 'NR>245' assets/css/style.css | grep -o '#[0-9A-Fa-f]\{6\}'   # must be empty
grep -c 'style="' *.html | grep -v ':0'                            # must be empty

# JS syntax
perl -0777 -ne 's{//.*$}{}mg; s{/\*.*?\*/}{}gs; my $o=()=/\{/g; my $c=()=/\}/g; my $po=()=/\(/g; my $pc=()=/\)/g; print "braces $o/$c parens $po/$pc\n"' assets/js/main.js
```

**Bump `?v=N` on all 7 pages whenever CSS or JS changes** — for both stylesheets
and `main.js`. The user has twice reported "nothing changed" when this was
missed; the browser was serving cached files.

---

## 4. IN PROGRESS — Arabic site (this is the live task)

User chose: **full Arabic site, all 7 pages.** Nothing has been built yet.

### Agreed plan

1. **`assets/css/rtl.css`** — RTL stylesheet (infrastructure, do first)
2. **`/ar/index.html`** — prove the pattern end to end
3. **Remaining 6 pages** under `/ar/`
4. Wire the language switch both ways, add `hreflang` alternates, update sitemap

### What already exists

- `dir="ltr"` declared explicitly on all 7 pages (deliberate groundwork)
- Arabic nav/footer labels wrapped in `.ajs-ar` (Cairo, `unicode-bidi: isolate`)
- ~15 Arabic strings per page — **labels only, no body copy**

### What needs mirroring in `rtl.css`

Audit of `style.css` found: `left:` ×33 · `right:` ×19 · `border-left` ×6 ·
`border-right` ×3 · `margin-right` ×5 · `padding-left` ×4 ·
`transform: translateX` ×6 · `text-align: right` ×2.

Components with strong directionality: `.ajs-timeline::before` (left rail),
`.ajs-split-frame::before` (offset gold frame), `.ajs-eyebrow::before` (rule
before label), `.ajs-check-list li::before/::after`, `.ajs-card::before` (wipe),
`.ajs-marquee-track` (scroll direction), `.ajs-hero-overlay` (angled gradient),
`.ajs-link-arrow` (arrow slides right), `.ajs-footer-links a:hover`
(translateX), `.ajs-vendor-band` (left border), `.ajs-map-marker`,
`.ajs-hero-figure` (the drawn hero — decide whether to mirror or leave).

### Constraint stated to the user

Arabic marketing copy will be a **draft requiring native-speaker review** before
launch. Do not present it as launch-ready. Mark it clearly in the files.

### Known trade-off, already flagged

Separate `/ar/` files are correct for SEO (distinct URLs + `hreflang`), but they
**double the header/footer duplication from 7 copies to 14**. Say so; don't
quietly introduce it.

---

## 5. Decisions already made — do not relitigate

| Decision | Rationale |
|---|---|
| Hero uses a **coded SVG backdrop**, `.ajs-hero--coded` on the `<section>` | Removing that one class switches back to the photo. Both paths must keep working. |
| Type scale **tightened one step** (h1 max 3.5rem) | Hero headline only gets `col-lg-7` beside the feature card; it wrapped to three lines. |
| Service titles on services.html use `var(--ajs-h3)` | Ten repeating section headings; still `<h2>` semantically. |
| Why Choose Us cut **9 → 6** | Two merges + removed "Kingdom-wide Support" (stated three times elsewhere on the page). |
| Equipment page **deleted**, folded into `services.html#fleet` | 16 units regrouped into 4 categories. |
| "Manpower" replaced with **"human resource support"** everywhere visible | Retained only in JSON-LD `alternateName` + `knowsAbout` for SEO. |
| Hero feature card **de-glassed** | `backdrop-filter` violated the design skill and was the most expensive paint on the page. |
| Logo: white edge on dark via **chained `drop-shadow`** | Follows the PNG's alpha silhouette, not its bounding box. A background would put a white rectangle around the transparent margin. |
| `--ajs-header-h` token drives hero clearance | Logo height changed and pushed the header onto the hero copy. Derive, don't hardcode. |
| **`--ajs-speed: 0.35s` left alone** | Above the 300ms UI guideline, but it's the house hover gesture sitewide. User's call to change. |

---

## 6. Open items, in priority order

### P0
1. **Images — ~11.5 MB.** All 13 JPEGs are **1024×1024, 300 DPI**. Homepage
   pulls ~9.3 MB. Hero is a square image in a 16:9 slot (cropped + upscaled).
   Needs user's tooling — no image libraries available here. Once resized, the
   markup should move to `<picture>` + `srcset`.
2. **Verify the hero photo.** `assets/images/hero/hero-industrial.jpg` appears to
   show **Saudi Aramco branding on the storage tanks** (AI-generated). If
   confirmed, it must not ship. Flagged repeatedly; still unresolved.

### P1
3. **`XX+` stat cards** ×3 — user chose to leave for now.
4. **"To be confirmed"** ×3 on project cards — user chose to leave.
5. **Aramco vendor ID** — the Registered Vendor band on `index.html` says
   "Available on request". User confirmed the registration exists but hasn't
   supplied the number. The number is the whole point of that block.
6. **Header/footer duplicated across 7 pages** (~1,000 lines). Already drifting.
   Options given: accept + checklist, SSI/PHP includes, or a build step.

### P2
7. **`href="#"` ×63** — social links, plus the language switch (being fixed now).
8. **Privacy policy** — 4 `REVIEW` markers: retention periods, DPO contact, and
   PDPL cross-border wording for Formspree. Needs counsel.
9. **Favicon is non-square** (327×285) — will letterbox in the tab.
10. **`package.json` / `package-lock.json`** appeared untracked and empty (`{}`).
    Probably a stray `npm` run. Not committed; delete or confirm.

### Content gaps identified vs a competitor profile (MHS)
11. **No Automation & Control Systems service** — yet the trade list now
    advertises "PLC & Automation Technicians". Internally inconsistent: either
    add the service or remove the trade.
12. **No Industrial Supply service** (materials/equipment supply).

---

## 7. Forms — wired and working

All **10 forms** POST to `https://formspree.io/f/xdaqqpqv` via `fetch`.
3 real forms + the same newsletter repeated in 7 footers.

| Form | Location | Subject tag |
|---|---|---|
| Contact / quotation | `contact.html:273` | `Website enquiry — Contact page` |
| Careers (CV upload) | `careers.html:321` | `Job application — Careers page` |
| Homepage enquiry | `index.html:1771` | `Website enquiry — Home page` |
| Newsletter ×7 | footer of every page | `Newsletter signup — aljazeeraksa.com` |

- Honeypot `_gotcha` on all 10, hidden **off-screen not `display:none`** (some
  bots skip display-hidden fields).
- Uploads: 5 MB cap, allowlist `.pdf .doc .docx .jpg .jpeg .png`, enforced
  before the request so the user gets an instant specific message.
- Validation: phone **9–15 digits** counted in JS (E.164 range; a regex can't
  count digits while allowing spaces/brackets), email requires a real domain,
  name `minlength=2`, message `minlength=10`.
- **Bug fixed:** the status panel sits *above* the form on the 3 main forms but
  *inside* it on newsletters. `form.querySelector` found nothing, so those three
  never showed any result. `getStatusPanel()` now falls back to
  `.ajs-form-panel`.

**User still must:** verify the Formspree notification email, and confirm file
uploads are enabled on their plan (usually a paid feature — text fields will
send while the attachment silently fails otherwise).

---

## 8. Conventions

- **Never a raw hex** outside the `:root` token block. Add a token, comment why.
- **Never hardcode a heading font size.** Use `--ajs-h1..h4` / `--ajs-lead`.
- **No inline `style=`.** Currently zero sitewide — keep it that way.
- CSS is **numbered sections 01–36** with a contents index at the top of
  `style.css`. The index has been verified to match the file exactly — keep it
  in sync. Section 36 (Motion & Print) must stay last: its reduced-motion
  overrides need to win.
- `responsive.css` holds **breakpoint overrides only**.
- Classes are `ajs-` prefixed BEM-ish.
- JS: vanilla, IIFE, `var`, feature-detected, numbered sections, nothing throws
  if an element is absent.
- **AOS delays are normalised to 60/120/180.** Do not reintroduce other values.
  Vocabulary is `fade-up` / `fade-right` / `fade-left` / `zoom-in` only.
- All motion respects `prefers-reduced-motion`; looping decorative animations
  are stopped outright, not shortened.
- **Cross-page consistency is mandatory** — change one page, change all seven.

### Gotchas that already caused bugs
- **`--` is illegal inside an XML comment.** An SVG loaded via `<img>` is parsed
  as strict XML — one `<!-- ---- -->` divider silently broke the whole hero.
- The **grid drift keyframe translates exactly one grid cell** (44px). Changing
  `background-size` without the keyframe makes the loop jump.
- The **marquee uses trailing `margin-right`, not `gap`** — with `gap`, half the
  track is 12 tiles + 11.5 gaps and `translateX(-50%)` lands mid-gap.
- `.btn` sets `padding` directly, which beats the CSS variables `.btn-sm` /
  `.btn-lg` rely on — both sizes are restated explicitly.

---

## 9. Company facts (verified with the user)

```
Al Jazeera Service Contracting Co. (AJSCO)
شركة خدمة الجزيرة للمقاولات
Established 2010 · Head office Dammam, Eastern Province

3554 King Fahad Bin Abdul Aziz Road, Al Adamah, Dammam 32242, KSA
+966 13 842 2350  ·  +966 59 233 46078
info@aljazeeraksa.com  ·  www.aljazeeraksa.com
Sunday–Thursday, 8:00–17:00

Leadership: Rajeh Ahmed Al Harbi (Chairman) · Ashraf NP (CEO & Director) · Biju Devassi (Manager)

Coverage: Dammam · Jubail · Riyadh · Jeddah · Yanbu · Jizan

Clients (user confirmed all 12 as genuine, 2 Aug 2026):
Saudi Aramco · SABIC · Saudi Electricity Co. · Sadara · Al Rajhi · Hyundai
Technip · Samsung · SAFCO · Tamimi · CMC · King Fahad University Hospital

Registered vendor: Saudi Aramco (ID not yet supplied)
```

Services (10): Human Resource Support · Industrial Construction · Civil
Construction · Mechanical Construction · Equipment Rental · Building Maintenance & AMC
· Electrical Works · Instrumentation · Utility Systems · Professional Staffing

---

## 10. Working style the user expects

- They test in the browser; you validate structurally. Give a concrete test
  checklist, and be explicit about what you could not verify.
- Flag credibility risks rather than silently shipping them — unverifiable
  claims, third-party branding, fabricated figures.
- When they reaffirm a decision after you've raised a concern, proceed with the
  full request and stop re-raising it.
- Commit only when asked. Messages explain *why*, matching the existing log.
- Shell is Git Bash on Windows: chain with `;` or `&&`, no PowerShell syntax.

