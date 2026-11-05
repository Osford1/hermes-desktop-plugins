# Screenshots still needed

`docs/img/` holds six real captures, each labelled in the README with what it shows. Six more would
make the README self-explanatory, and none of them exist yet. **There are no image links to them
anywhere in this repository** — this file is the shopping list, so nothing renders as a broken
image. If you take one, save it into `docs/img/` with the filename below and add it to the README
section it belongs to.

House rules for all of them: a full window, not a crop, unless the crop *is* the point; the OS
colour scheme and the appearance both visible; and no personal content — an empty session or a
throwaway conversation. If a shot needs a document open, write a dummy one.

| Filename | What it must show | Why it is worth a shot |
| --- | --- | --- |
| `themes-side-by-side.png` | Glacier Glass and Sunstone Glass, dark appearance, the same screen in both halves | This is the one claim the README leads with, and the four existing captures never put the two palettes next to each other. |
| `appearance-picker.png` | Settings → Appearance with *Glacier Glass (cool glass)* and *Sunstone Glass (warm glass)* listed next to the stock themes | Proves the themes are contributed to the app's own picker, not injected CSS. |
| `legibility-text-tier-zoom.png` | The same sidebar label at 2× before and after the legibility pass | The 9/10 px call sites are the whole point of the plugin and they are invisible at print resolution. |
| `atkinson-specimen.png` | The UI in Atkinson Hyperlegible next to the same UI without it, at a size where the disambiguated glyphs (I / l / 1, rn / m) are legible | The font's value is glyph-level; a full-window shot at 1× does not show it. |
| `tracker-kanban-board.png` | The board page, with at least one card in each of the five columns | The only component in the repository with no capture at all, and the only one with a server half. |
| `command-center.png` | Command Center open, filtered on one word, showing this repository's commands (*contrast report*, *measure what is rendering*, *turn off*) | Shows the install actually took, and shows the discoverability the `keywords` field buys. |

## What the existing six captures show

For reference, so nobody re-shoots these:

| File | Shows |
| --- | --- |
| `glacier-glass-dark.png` | Cool teal/slate dark appearance with translucent panels |
| `glacier-glass-light.png` | Light appearance, translucent chrome over the pale field |
| `sunstone-glass-dark.png` | Warm palette, dark appearance, the bloom visible behind the glass |
| `sunstone-glass-light.png` | Warm cream/tan, light appearance, with a settings popover open — so it documents the popover surface, not just the chat surface |
| `legibility-before.png` | The before state: sub-12 px labels, annotated |
| `probe_chat.png` | Chat, tool calls and sidebar in one frame — the general-purpose window shot |

The first four and the last are not annotated; the two legibility shots carry annotations in the
image itself, which is why they are the only before/after pair here.
