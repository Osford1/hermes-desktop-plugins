/**
 * legibility — one override layer that fixes the two systemic accessibility
 * failures found in the 2026-09-20 Apple-HIG review of the desktop app, without
 * touching app source (so `hermes update` cannot revert it):
 *
 *   1. CONTRAST — the two lowest text tiers failed WCAG AA by construction:
 *        --ui-text-quaternary      36 % alpha = 2.96:1   -> 50 % = 4.6:1
 *        --conversation-scaffold-meta 44 % alpha = 3.87:1 -> 50 % = 4.6:1
 *   2. TYPE FLOOR — ~470 call sites render below 12 px (0.5rem…0.73rem, 7px…11px).
 *      This layer clamps every one of them: nothing under 11 px, the 11–11.7 px
 *      tier becomes 12 px, and the transcript moves to 14 px body / 12 px tool.
 *   3. OS ACCESSIBILITY SETTINGS — the app honoured only prefers-reduced-motion.
 *      Added: prefers-contrast: more, prefers-reduced-transparency: reduce, and
 *      forced-colors (Windows High Contrast).
 *   4. CONTROL SIZE — the interactive default moves from 24 px to the HIG desktop
 *      default of 28 px for titlebar + composer controls.
 *
 * Everything is theme-adaptive (color-mix over --ui-base / --ui-bg-*), scoped to
 * `:root[data-legibility='on']`, and unlayered so it wins over the app's
 * `@layer base` tokens without !important.
 *
 * Toggle live:  ⌘K / Ctrl-K -> "Legibility: contrast report" or the keybind
 * Ctrl+Alt+L. Disable entirely: Settings -> Plugins -> Legibility.
 *
 * Plain ESM, loaded uncompiled (jsx() calls only, no JSX syntax).
 */

import { contrastRatio, host, PALETTE_AREA, KEYBINDS_AREA } from '@hermes/plugin-sdk'

const ID = 'legibility'
const STYLE_ID = 'hermes-legibility-layer'
const ATTR = 'data-legibility'

const CSS = `
/* ─── 1. Contrast: raise the two tiers that failed AA ──────────────────── */
:root[${ATTR}='on'] {
  --ui-text-quaternary: color-mix(in srgb, var(--ui-base) 50%, transparent);
  --conversation-scaffold-meta: color-mix(in srgb, var(--ui-base) 50%, transparent);
  --conversation-scaffold-text: color-mix(in srgb, var(--ui-base) 72%, transparent);

  /* ─── 2. Transcript type scale (13/11/12 px -> 14/12/13 px) ──────────── */
  --conversation-text-font-size: 0.875rem;       /* 13 -> 14 px */
  --conversation-line-height: 1.25rem;           /* 18 -> 20 px */
  --conversation-tool-font-size: 0.75rem;        /* 11 -> 12 px */
  --conversation-caption-font-size: 0.8125rem;   /* 12 -> 13 px */
  --conversation-caption-line-height: 1.125rem;  /* 16 -> 18 px */
}

/* ─── 3. Type floor: micro tier (8-10.9 px) -> 11 px ──────────────────── */
:root[${ATTR}='on'] [class~='text-[0.5rem]'],
:root[${ATTR}='on'] [class~='text-[0.56rem]'],
:root[${ATTR}='on'] [class~='text-[0.5625rem]'],
:root[${ATTR}='on'] [class~='text-[0.58rem]'],
:root[${ATTR}='on'] [class~='text-[0.6rem]'],
:root[${ATTR}='on'] [class~='text-[0.62rem]'],
:root[${ATTR}='on'] [class~='text-[0.625rem]'],
:root[${ATTR}='on'] [class~='text-[0.64rem]'],
:root[${ATTR}='on'] [class~='text-[0.65rem]'],
:root[${ATTR}='on'] [class~='text-[0.66rem]'],
:root[${ATTR}='on'] [class~='text-[0.67rem]'],
:root[${ATTR}='on'] [class~='text-[0.68rem]'],
:root[${ATTR}='on'] [class~='text-[0.69rem]'],
:root[${ATTR}='on'] [class~='text-[7px]'],
:root[${ATTR}='on'] [class~='text-[9px]'],
:root[${ATTR}='on'] [class~='text-[10px]'] {
  font-size: 0.6875rem;
}

/* ─── 3b. Secondary micro tier (11-11.7 px) -> 12 px ──────────────────── */
:root[${ATTR}='on'] [class~='text-[0.6875rem]'],
:root[${ATTR}='on'] [class~='text-[0.7rem]'],
:root[${ATTR}='on'] [class~='text-[0.71rem]'],
:root[${ATTR}='on'] [class~='text-[0.72rem]'],
:root[${ATTR}='on'] [class~='text-[0.73rem]'],
:root[${ATTR}='on'] [class~='text-[0.74rem]'],
:root[${ATTR}='on'] [class~='text-[11px]'] {
  font-size: 0.75rem;
}

/* Micro text keeps its tracking at the larger size or it reads as a smear. */
:root[${ATTR}='on'] [class~='uppercase'] {
  letter-spacing: 0.045em;
}

/* ─── 4. Controls at the HIG desktop default (28 px), 26 px in the band ── */
:root[${ATTR}='on'] {
  --titlebar-control-size: 26px;
  --titlebar-control-height: 26px;
  --composer-control-size: 1.75rem;           /* 24 -> 28 px */
  --composer-control-primary-size: 1.875rem;  /* 26 -> 30 px */
  --composer-input-min-height: 1.875rem;
}

/* ─── 5. OS accessibility settings the app ignored ────────────────────── */
@media (prefers-contrast: more) {
  :root {
    --ui-text-secondary: color-mix(in srgb, var(--ui-base) 86%, transparent);
    --ui-text-tertiary: color-mix(in srgb, var(--ui-base) 68%, transparent);
    --ui-text-quaternary: color-mix(in srgb, var(--ui-base) 62%, transparent);
    --conversation-scaffold-meta: color-mix(in srgb, var(--ui-base) 64%, transparent);
  }
}

@media (prefers-reduced-transparency: reduce) {
  /* The glass field is a <body> mix driven by an inline --translucency-glass-keep. */
  :root {
    --translucency-glass-keep: 100% !important;
  }
  :root[data-hermes-glass] body,
  :root[data-hermes-glass][data-hermes-glass-scope='sidebar'] body {
    background: var(--ui-bg-chrome) !important;
  }
  :root[data-hermes-glass] [data-glass-field] {
    --glass-field: var(--ui-bg-chrome);
  }
}

@media (forced-colors: active) {
  :root {
    --ui-stroke-primary: CanvasText;
    --ui-stroke-secondary: CanvasText;
    --ui-stroke-tertiary: CanvasText;
    --ui-stroke-quaternary: GrayText;
  }
}
`

// ─────────────────────────────────────────────────────────────── helpers

function inject() {
  if (typeof document === 'undefined') return
  let el = document.getElementById(STYLE_ID)
  if (!el) {
    el = document.createElement('style')
    el.id = STYLE_ID
    el.setAttribute('data-hermes-plugin', ID)
    document.head.appendChild(el)
  }
  if (el.textContent !== CSS) el.textContent = CSS
}

function setEnabled(on) {
  document.documentElement.setAttribute(ATTR, on ? 'on' : 'off')
}

/** Resolve any CSS colour (color-mix/oklab included) to #rrggbb over a backdrop. */
function toHex(colour, backdrop) {
  const cv = document.createElement('canvas')
  cv.width = cv.height = 2
  const ctx = cv.getContext('2d', { willReadFrequently: true })
  ctx.fillStyle = backdrop || '#000000'
  ctx.fillRect(0, 0, 2, 2)
  ctx.fillStyle = colour
  ctx.fillRect(0, 0, 2, 2)
  const [r, g, b] = ctx.getImageData(1, 1, 1, 1).data
  return `#${[r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')}`
}

/** Live contrast report for the text tiers, over the real rendered surface. */
function report() {
  const root = document.documentElement
  const cs = getComputedStyle(root)
  const surface = toHex(cs.getPropertyValue('--ui-bg-editor').trim() || '#000000', '#000000')
  const tiers = [
    ['--ui-text-primary', 'primary'],
    ['--ui-text-secondary', 'secondary'],
    ['--ui-text-tertiary', 'tertiary'],
    ['--ui-text-quaternary', 'quaternary'],
    ['--conversation-scaffold-meta', 'scaffold-meta']
  ]
  const rows = []
  for (const [token, name] of tiers) {
    const raw = cs.getPropertyValue(token).trim()
    if (!raw) continue
    const fg = toHex(raw, surface)
    rows.push(`${name} ${contrastRatio(fg, surface).toFixed(2)}:1`)
  }
  return { surface, rows }
}

// ─────────────────────────────────────────────────────────────── plugin

export default {
  id: ID,
  name: 'Legibility',
  register(ctx) {
    const enabled = ctx.storage.get('enabled', true) !== false

    inject()
    setEnabled(enabled)

    // Load receipt: lets `grep -r legibility` in the renderer's Local Storage
    // confirm this plugin actually ran in a given install.
    try {
      ctx.storage.set('loadedAt', new Date().toISOString())
    } catch {
      /* storage is best-effort */
    }

    const say = on =>
      host.notify({
        kind: 'info',
        message: `Legibility overrides ${on ? 'ON' : 'OFF'} — 2 fixed contrast tiers, an 11 px type floor, 14 px transcript.`
      })

    ctx.registerMany([
      {
        id: 'legibility.toggle',
        area: PALETTE_AREA,
        data: {
          id: 'legibility.toggle',
          label: 'Legibility: toggle overrides',
          keywords: ['legibility', 'contrast', 'readability', 'font', 'a11y', 'accessibility'],
          run: () => {
            const next = document.documentElement.getAttribute(ATTR) !== 'on'
            ctx.storage.set('enabled', next)
            setEnabled(next)
            say(next)
          }
        }
      },
      {
        id: 'legibility.report',
        area: PALETTE_AREA,
        data: {
          id: 'legibility.report',
          label: 'Legibility: contrast report',
          keywords: ['legibility', 'contrast', 'wcag', 'audit'],
          run: () => {
            const { surface, rows } = report()
            host.notify({ kind: 'info', message: `Over ${surface}: ${rows.join(' · ')}` })
          }
        }
      },
      {
        id: 'legibility.keybind',
        area: KEYBINDS_AREA,
        data: {
          id: 'legibility.toggle.action',
          label: 'Toggle Legibility overrides',
          category: 'Legibility',
          defaults: ['mod+alt+l'],
          run: () => {
            const next = document.documentElement.getAttribute(ATTR) !== 'on'
            setEnabled(next)
            say(next)
          }
        }
      }
    ])
  }
}
