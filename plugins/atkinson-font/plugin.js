/**
 * atkinson-font — swap the desktop UI typeface to Atkinson Hyperlegible
 * (Braille Institute's low-vision face: disambiguated I/l/1, O/0, rn/m).
 *
 * WHY A PLUGIN: the app's UI face is a theme token (`--dt-font-sans`), NOT a
 * setting — Settings only exposes the TERMINAL font. A user plugin is the
 * update-safe place for this: `hermes update` reverts the install tree but
 * never the plugin dir. Delete this folder (or flip it off in Settings →
 * Plugins) to go back to the stock face.
 *
 * HOW IT WINS: the ThemeProvider writes the theme tokens as INLINE styles on
 * <html> (`root.style.setProperty('--dt-font-sans', …)`), and an inline
 * declaration outranks every selector — so a plain `:root { … }` rule does
 * nothing here. A stylesheet `!important` declaration *does* beat inline, and
 * unlayered CSS beats the app's `@layer base` tokens, so:
 *
 *     :root[data-atkinson-font='on'] { --dt-font-sans: … !important }
 *
 * Scope `on` is flipped by the palette commands / keybind below, and the whole
 * style element is removed on unload, so disabling the plugin is a true revert.
 *
 * WEIGHT NOTE: the classic Atkinson Hyperlegible ships Regular (400) + Bold
 * (700) only here. The app's `font-medium` (500) renders as 400 and
 * `font-semibold` (600) as 700 — no synthetic bold, just a coarser two-step.
 * 'Atkinson Hyperlegible Next' is in the stack behind v1 for glyphs v1 lacks.
 *
 * NOT touched: the terminal pane (xterm sets its font in JS from
 * `terminal.font_family` in config.yaml — set it there, e.g.
 * "Atkinson Hyperlegible Mono"), keycap glyphs (`--dt-font-kbd`, deliberately
 * the native UI face), and the HERMES wordmark ('Collapse', the brand face).
 *
 * Plain ESM, loaded uncompiled (no build step, no JSX).
 */

import { host, PALETTE_AREA, KEYBINDS_AREA } from '@hermes/plugin-sdk'

const ID = 'atkinson-font'
const STYLE_ID = 'hermes-atkinson-font-layer'
const ATTR = 'data-atkinson-font'
const MONO_ATTR = 'data-atkinson-font-mono'

const EMOJI = `'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji', emoji`

// Keep the app's own tail after the Atkinson faces so nothing regresses if a
// glyph (or a whole install) is missing.
const SANS = `'Atkinson Hyperlegible', 'Atkinson Hyperlegible Next', 'Segoe UI', -apple-system, BlinkMacSystemFont, system-ui, sans-serif, ${EMOJI}`
const MONO = `'Atkinson Hyperlegible Mono', 'JetBrains Mono', Consolas, 'Courier Prime', monospace, ${EMOJI}`

const CSS = `
/* Unlayered + !important: the ONLY way to beat a token written as an inline
   style on <html> by themes/context.tsx. */
:root[${ATTR}='on'] {
  --dt-font-sans: ${SANS} !important;
}

/* Code cards / inline code — opt-in via the mono command, off by default so
   the app's Courier Prime pipeline is untouched. */
:root[${ATTR}='on'][${MONO_ATTR}='on'] {
  --dt-font-mono: ${MONO} !important;
}

/* Atkinson is a little wider per glyph than Segoe UI at the same size. The
   micro tiers the app already sets at 11-12 px read tight in it, so give the
   uppercase micro-labels a hair more tracking. */
:root[${ATTR}='on'] [class~='uppercase'] {
  letter-spacing: 0.02em;
}
`

// ─────────────────────────────────────────────────────────────── style layer

function inject() {
  if (typeof document === 'undefined') return null
  let el = document.getElementById(STYLE_ID)
  if (!el) {
    el = document.createElement('style')
    el.id = STYLE_ID
    el.setAttribute('data-hermes-plugin', ID)
    document.head.appendChild(el)
  }
  if (el.textContent !== CSS) el.textContent = CSS
  return el
}

const attr = (name, on) => document.documentElement.setAttribute(name, on ? 'on' : 'off')
const isOn = name => document.documentElement.getAttribute(name) === 'on'

// ─────────────────────────────────────────────────────────────── probe

/**
 * Measure, don't assume. A missing family silently falls through the stack, so
 * compare rendered widths of the same string with and without the family in
 * front: equal widths == the family did not resolve. Every number the plugin
 * claims is measured in the real renderer and left in `ctx.storage.probe`.
 */
function probe(mono, extra = {}) {
  if (typeof document === 'undefined' || !document.body) return { ...extra, error: 'no document' }
  const el = document.createElement('span')
  el.setAttribute('aria-hidden', 'true')
  el.style.cssText = 'position:fixed;left:-9999px;top:0;visibility:hidden;white-space:pre;font-size:64px'
  el.textContent = 'MWmwiloO0cgq9 — @&%'
  document.body.appendChild(el)
  const width = family => {
    el.style.fontFamily = family
    return Math.round(el.getBoundingClientRect().width * 100) / 100
  }
  const atkinson = width(`'Atkinson Hyperlegible', monospace`)
  const atkinsonMono = width(`'Atkinson Hyperlegible Mono', monospace`)
  const segoe = width(`'Segoe UI', monospace`)
  const plainMono = width('monospace')
  el.remove()

  const root = getComputedStyle(document.documentElement)
  const body = getComputedStyle(document.body)
  return {
    at: new Date().toISOString(),
    scope: isOn(ATTR),
    monoScope: mono,
    // What the cascade actually resolved for the token and the body face.
    tokenSans: root.getPropertyValue('--dt-font-sans').trim().slice(0, 90),
    tokenMono: root.getPropertyValue('--dt-font-mono').trim().slice(0, 90),
    bodyFont: body.fontFamily.slice(0, 110),
    bodySize: body.fontSize,
    // Widths: atkinson != segoe != plainMono proves the family is really in use.
    wAtkinson: atkinson,
    wAtkinsonMono: atkinsonMono,
    wSegoe: segoe,
    wPlainMono: plainMono,
    atkinsonResolves: atkinson !== plainMono && atkinson !== segoe,
    atkinsonMonoResolves: atkinsonMono !== plainMono,
    ...extra
  }
}

// ─────────────────────────────────────────────────────────────── plugin

export default {
  id: ID,
  name: 'Atkinson Font',
  description: 'UI typeface → Atkinson Hyperlegible (low-vision/low-dyslexia face).',
  register(ctx) {
    const enabled = ctx.storage.get('enabled', true) !== false
    let mono = ctx.storage.get('mono', false) === true

    const styleEl = inject()
    attr(ATTR, enabled)
    attr(MONO_ATTR, mono)

    const timers = []
    const record = extra => {
      try {
        ctx.storage.set('probe', probe(mono, extra))
      } catch {
        /* storage is best-effort */
      }
    }

    // Load receipt, and a re-measure once the theme provider has painted its
    // inline tokens (it may run after plugins on a cold boot).
    record({ phase: 'register' })
    timers.push(setTimeout(() => record({ phase: 'settled' }), 2000))

    ctx.onDispose(() => {
      for (const t of timers) clearTimeout(t)
      styleEl?.remove()
      document.documentElement.removeAttribute(ATTR)
      document.documentElement.removeAttribute(MONO_ATTR)
    })

    const apply = (next, isMono) => {
      if (isMono) ctx.storage.set('mono', next)
      else ctx.storage.set('enabled', next)
      attr(isMono ? MONO_ATTR : ATTR, next)
      record({ phase: isMono ? 'mono-toggle' : 'toggle' })
    }

    const say = (message, kind = 'info') => host.notify({ kind, message })

    ctx.registerMany([
      {
        id: `${ID}.toggle`,
        area: PALETTE_AREA,
        data: {
          id: `${ID}.toggle`,
          label: `Atkinson Hyperlegible: ${enabled ? 'turn off' : 'turn on'}`,
          keywords: ['atkinson', 'font', 'typeface', 'legibility', 'dyslexia', 'ui'],
          run: () => {
            const next = !isOn(ATTR)
            apply(next, false)
            say(`Atkinson Hyperlegible ${next ? 'ON' : 'OFF'} — UI face ${next ? 'swapped' : 'back to Segoe UI'}.`)
          }
        }
      },
      {
        id: `${ID}.mono`,
        area: PALETTE_AREA,
        data: {
          id: `${ID}.mono`,
          label: `Atkinson Hyperlegible Mono: ${mono ? 'turn off' : 'turn on'}`,
          keywords: ['atkinson', 'mono', 'code', 'font', 'typeface'],
          run: () => {
            mono = !isOn(MONO_ATTR)
            apply(mono, true)
            say(`Code typeface ${mono ? '→ Atkinson Hyperlegible Mono' : '→ app default (Courier Prime)'}.`)
          }
        }
      },
      {
        id: `${ID}.report`,
        area: PALETTE_AREA,
        data: {
          id: `${ID}.report`,
          label: 'Atkinson Hyperlegible: measure what is rendering',
          keywords: ['atkinson', 'font', 'measure', 'report', 'verify'],
          run: () => {
            const r = probe(mono, { phase: 'manual' })
            ctx.storage.set('probe', r)
            say(
              `Body font: ${String(r.bodyFont).split(',')[0]} @ ${r.bodySize}. ` +
                `Atkinson resolves: ${r.atkinsonResolves ? 'yes' : 'no'} ` +
                `(${r.wAtkinson}px vs Segoe ${r.wSegoe}px, plain mono ${r.wPlainMono}px).`
            )
          }
        }
      },
      {
        id: `${ID}.keybind`,
        area: KEYBINDS_AREA,
        data: {
          id: `${ID}.toggle.action`,
          label: 'Toggle Atkinson Hyperlegible UI font',
          category: 'Atkinson Font',
          defaults: ['mod+alt+a'],
          run: () => {
            const next = !isOn(ATTR)
            apply(next, false)
            say(`Atkinson Hyperlegible ${next ? 'ON' : 'OFF'}.`)
          }
        }
      }
    ])
  }
}
