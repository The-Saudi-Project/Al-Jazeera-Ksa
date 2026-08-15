# Client logos

Drop cleared client logo files in this folder, then swap the matching
text tile in `index.html` for a logo tile.

Nothing in the site references these files yet — the client row runs
on text tiles until a file exists, and the two states can sit side by
side, so clients can be converted one at a time.

---

## Converting a tile

Find the client's tile in the marquee track in `index.html`. It looks
like this:

```html
<div class="ajs-client-chip"><span class="ajs-client-name">Saudi Aramco</span><span
    class="ajs-client-note">Logo pending</span></div>
```

Replace it with:

```html
<div class="ajs-client-chip ajs-client-chip--logo">
  <img src="assets/images/logos/clients/saudi-aramco.svg" alt="Saudi Aramco" loading="lazy">
</div>
```

### List each client ONCE

The markup holds one tile per client. The seamless loop needs the list
present twice, but `main.js` section 12 clones it at runtime and marks
the clones `aria-hidden` — you do not write the second copy by hand.

This changed because hand-maintaining two copies failed twice: a logo
got swapped in one half and not the other, and the symptom is a row
that visibly jumps once per cycle, which reads as a rendering bug
rather than as missing markup. **Do not paste a duplicate set back
in** — you would get every client twice on screen.

**`alt` is the client name on its own.** A client logo carries meaning
on this page, so it is not decorative and needs a real `alt`. The
clone's `alt` is cleared automatically.

### Reversed (white) logos

Some brands only publish a knockout version, which disappears on the
light tile. Add `ajs-client-chip--dark` alongside `ajs-client-chip--logo`
and that tile inverts to navy, which is what a reversed mark is built
for. Sadara uses this. Do not recolour someone else's trademark to
work around it.

---

## File specs

| | |
|---|---|
| **Format** | SVG preferred. PNG only if no vector is available. |
| **Background** | **Must be transparent.** |
| **PNG size** | Fit inside 400 × 150 px. |
| **Colour** | Full colour, as supplied by the brand owner. |
| **Naming** | Lowercase, hyphenated, exactly as in the table below. |

The tile renders the logo at roughly **162 × 60 CSS px**, so 400 × 150
covers a 2× retina display with room to spare. Anything larger is
wasted bytes — this folder feeds a row that loads on the home page,
which is already the heaviest page on the site.

### Two things that will make logos look wrong even when the files are fine

**Transparent background is not optional.** The tile is white with a
1px border, and it gets a gold border on hover. A logo exported on a
white rectangle looks fine at rest and then shows a hard grey seam
inside the gold border the moment someone hovers it.

**Trim each file to the mark's own bounding box.** The tile scales
every logo to fit the same box. If one file has 20% built-in padding
and the next has none, the first renders visibly smaller than the
second even though both boxes are identical. Crop the transparent
margin off before saving — this is the single most common reason a
logo row looks untidy.

---

## Filenames

| Client | File | Status |
|---|---|---|
| Saudi Aramco | `saudi-aramco.webp` | **live** |
| SABIC | `sabic.svg` | **live** |
| SAFCO | `safco.svg` | **live** |
| Samsung | `samsung.svg` | **live** — recoloured to brand blue, viewBox trimmed |
| Saipem | `saipem.svg` | **live** |
| Al Rajhi | `al-rajhi.svg` | **live** |
| Riyad Bank | `riyad-bank.svg` | **live** |
| Sadara | `sadara.svg` | **text tile** — file is the reversed (white) logo |
| Hyundai | `hyundai.avif` | **text tile** — AVIF, white background |
| Le Méridien | `le-meridien.avif` | **text tile** — AVIF, white background |

### The three text tiles, and exactly what to supply

**Sadara** — `sadara.svg` is filled `#fff` throughout. It is the
reversed logo, intended for dark backgrounds, so on the white tile it
renders as an empty box. The file is not broken; it is the wrong
variant. Ask Sadara for the **positive/colour version**. Recolouring
the reversed file ourselves would mean inventing a brand colour,
which their guidelines almost certainly prohibit.

**Hyundai** and **Le Méridien** — both supplied as AVIF, which Safari
did not support until 16.4 (2023), and both have a white background
rather than transparency. Either would show as a white rectangle
inside the tile and break on older iPhones. Re-export as SVG or
transparent PNG.

Also for Hyundai: the supplied file is the **Hyundai Motor** oval-H
wordmark. If the client is Hyundai Engineering & Construction, that is
the wrong company's mark and needs replacing regardless of format.

Any of `.svg`, `.webp` or `.png` works — the tile uses `object-fit:
contain`, so format and aspect ratio don't matter as long as the
background is transparent. Update the `src` in the tile to match
whatever extension the file actually has.

### Entities still to confirm

Five of these names are group names, and the wrong subsidiary's mark
would be both a credibility problem and a trademark one — the written
approval covers a specific legal entity, not the family name.

- **Samsung** — Samsung C&T or Samsung Engineering? (Not Electronics.)
- **Hyundai** — Hyundai E&C or Hyundai Heavy Industries? (Not Motor.)
- **Technip** — Technip Energies or TechnipFMC? They demerged in 2021
  and have completely different logos.
- **Al Rajhi** — Bank, Steel, or Holding?
- **CMC** — several unrelated contractors use this initialism.
- **King Fahad University Hospital** — likely King Fahd Hospital of the
  University (KFHU) in Khobar. Confirm the exact registered name; the
  current tile spelling may not match the entity that gave approval.

---

## Permission

Written approval to display these marks was confirmed by the company
on 4 August 2026. Keep the approvals on file — several of these brand
owners (Aramco in particular) publish supplier brand guidelines that
also constrain **how** the mark may be shown: minimum clear space,
minimum size, and a prohibition on recolouring or altering it.

The site displays these logos in full colour and unmodified, which is
the safest reading of those guidelines. If any brand owner's approval
came with specific conditions, check them against the tile treatment
before launch.
