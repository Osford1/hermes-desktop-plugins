/**
 * glassy-panel — two custom themes for the Hermes desktop app, built to the
 * `glassy-panel-design` spec (glassy-panel-design-metrics.md, §2 ladder / §3
 * material table / §5 rhythm).
 *
 *   Glacier Glass — cool teal, translucent slate panels (dark-first)
 *   Sunstone Glass — warm terracotta over warm graphite
 *
 * Each theme ships BOTH appearances with the spec's own numbers: paper 36 % on
 * a dark canvas (bloom reads through), 88 % on a light one (a light translucent
 * card separates by its hairline, not by value), a real bloom behind the glass,
 * a hairline you can find, depth instead of a drop shadow, an accent-only focus
 * ring, and an answer for prefers-reduced-transparency / prefers-contrast /
 * forced-colors.
 *
 * The palette itself is a CIE L* ladder, not hex guesses; all 18 boundary and
 * text pairs were validated (text >= 4.5:1, boundaries >= 3:1) in both
 * appearances for both themes before shipping.
 *
 * Type metrics from the spec (one reading size, an 11 px floor, size-specific
 * tracking) are NOT duplicated here — the `legibility` plugin already delivers
 * them, and two layers fighting over font-size is how you get 8 px labels.
 *
 * Apply: Command Center -> "Appearance: Glacier Glass" / "Sunstone Glass",
 * or Settings -> Appearance. Registered as a desktop plugin, so `hermes update`
 * does not revert it. Disable: Settings -> Plugins -> Glassy Panel.
 */

import { host, PALETTE_AREA, requestTheme, THEMES_AREA } from '@hermes/plugin-sdk'

const ID = 'glassy-panel'
const STYLE_ID = 'hermes-glassy-panel-layer'

const GLASS_THEME_NAMES = ['glacier-glass', 'sunstone-glass']

const GLASS_THEMES = [
  {
    name: 'glacier-glass',
    label: 'Glacier Glass',
    description: 'Cool teal glass - translucent slate panels, one hue family, matched light and dark.',
    colors:     {
      "background": "#eef2f4",
      "foreground": "#16232a",
      "card": "#fbfdfe",
      "cardForeground": "#16232a",
      "muted": "#f5f8fa",
      "mutedForeground": "#48595f",
      "popover": "#f0f2f3",
      "popoverForeground": "#16232a",
      "primary": "#116974",
      "primaryForeground": "#ffffff",
      "secondary": "#d8e4e7",
      "secondaryForeground": "#16232a",
      "accent": "#dfe8eb",
      "accentForeground": "#16232a",
      "border": "#6d818a",
      "input": "#fbfdfe",
      "ring": "#116974",
      "midground": "#116974",
      "composerRing": "#116974",
      "destructive": "#b3261e",
      "destructiveForeground": "#ffffff",
      "sidebarBackground": "#dfe8ec",
      "sidebarBorder": "#73868f",
      "userBubble": "#ccdfe2",
      "userBubbleBorder": "#3e858e"
    },
    darkColors:     {
      "background": "#0d1417",
      "foreground": "#e8f1f4",
      "card": "#162024",
      "cardForeground": "#e8f1f4",
      "muted": "#121b1e",
      "mutedForeground": "#9fb3bb",
      "popover": "#202a2e",
      "popoverForeground": "#e8f1f4",
      "primary": "#45c8bf",
      "primaryForeground": "#05191a",
      "secondary": "#132628",
      "secondaryForeground": "#e8f1f4",
      "accent": "#112123",
      "accentForeground": "#e8f1f4",
      "border": "#647a84",
      "input": "#1b262b",
      "ring": "#45c8bf",
      "midground": "#45c8bf",
      "composerRing": "#45c8bf",
      "destructive": "#ff6b6b",
      "destructiveForeground": "#2a0a0a",
      "sidebarBackground": "#070c0e",
      "sidebarBorder": "#50626a",
      "userBubble": "#1f4243",
      "userBubbleBorder": "#379590"
    }
  },
  {
    name: 'sunstone-glass',
    label: 'Sunstone Glass',
    description: 'Warm glass - terracotta accent over warm graphite, matched light and dark.',
    colors:     {
      "background": "#efe6d8",
      "foreground": "#2b2117",
      "card": "#fffdfb",
      "cardForeground": "#2b2117",
      "muted": "#f8f3eb",
      "mutedForeground": "#65584a",
      "popover": "#f4f2f0",
      "popoverForeground": "#2b2117",
      "primary": "#a04a08",
      "primaryForeground": "#ffffff",
      "secondary": "#e7d6c3",
      "secondaryForeground": "#2b2117",
      "accent": "#e9dbc9",
      "accentForeground": "#2b2117",
      "border": "#8d7962",
      "input": "#fffdfb",
      "ring": "#a04a08",
      "midground": "#a04a08",
      "composerRing": "#a04a08",
      "destructive": "#b3261e",
      "destructiveForeground": "#ffffff",
      "sidebarBackground": "#ede4d8",
      "sidebarBorder": "#927e68",
      "userBubble": "#ecd9ca",
      "userBubbleBorder": "#b16b35"
    },
    darkColors:     {
      "background": "#1b1714",
      "foreground": "#f6efe6",
      "card": "#262019",
      "cardForeground": "#f6efe6",
      "muted": "#211c17",
      "mutedForeground": "#bca894",
      "popover": "#302a23",
      "popoverForeground": "#f6efe6",
      "primary": "#e8a33d",
      "primaryForeground": "#241505",
      "secondary": "#302518",
      "secondaryForeground": "#f6efe6",
      "accent": "#292117",
      "accentForeground": "#f6efe6",
      "border": "#87735e",
      "input": "#2e2620",
      "ring": "#e8a33d",
      "midground": "#e8a33d",
      "composerRing": "#e8a33d",
      "destructive": "#ff7a66",
      "destructiveForeground": "#2a0f08",
      "sidebarBackground": "#12100e",
      "sidebarBorder": "#705f4e",
      "userBubble": "#4d3a20",
      "userBubbleBorder": "#b27e33"
    }
  }
]

const CSS = `
/* ── 1. The seeds ARE the design: the app's neutral mixing (--theme-mix-*) would
       move the CIE L* ladder off the spec's values, so bypass it. ── */
:root:root[data-hermes-theme='glacier-glass'],
:root:root[data-hermes-theme='sunstone-glass'] {
  --gp-canvas: var(--theme-background-seed);
  --gp-paper: var(--theme-card-seed);
  --gp-shell: var(--theme-sidebar-seed);
  --gp-line: var(--dt-border);
  --gp-accent: var(--ui-accent);
  --theme-mix-chrome: 100%;
  --theme-mix-sidebar: 100%;
  --theme-mix-card: 100%;
  --theme-mix-elevated: 100%;
  --theme-mix-bubble: 100%;

  /* radius ladder, softened from the app's 2 px baseline (spec §5) */
  --radius-scalar: 0.9;

  /* ── 2. Material table (spec §3) · LIGHT appearance: 88 % paper cards ── */
  --ui-bg-chrome: color-mix(in srgb, var(--gp-paper) 94%, transparent);
  --ui-bg-sidebar: color-mix(in srgb, var(--gp-shell) 74%, transparent);
  --ui-bg-editor: color-mix(in srgb, var(--gp-paper) 88%, transparent);
  --ui-bg-elevated: color-mix(in srgb, var(--gp-paper) 92%, transparent);
  --ui-bg-card: color-mix(in srgb, var(--gp-paper) 92%, transparent);
  --ui-bg-input: color-mix(in srgb, var(--gp-paper) 90%, transparent);
  --ui-surface-background: var(--ui-bg-editor);
  --ui-chat-surface-background: var(--ui-bg-editor);
  --ui-sidebar-surface-background: var(--ui-bg-sidebar);
  --ui-editor-surface-background: var(--ui-bg-chrome);
  --ui-widget-surface-background: color-mix(in srgb, var(--gp-paper) 92%, transparent);
  --ui-chat-bubble-opaque-background: var(--gp-paper);
  --sidebar-edge-border: color-mix(in srgb, var(--gp-line) 55%, transparent);

  /* a hairline that can be found: 1px color-mix(paper 50%, line) (spec §3) */
  --ui-stroke-primary: color-mix(in srgb, var(--gp-line) 78%, transparent);
  --ui-stroke-secondary: color-mix(in srgb, var(--gp-line) 70%, transparent);
  --ui-stroke-tertiary: color-mix(in srgb, var(--gp-line) 70%, transparent);
  --ui-stroke-quaternary: color-mix(in srgb, var(--gp-line) 45%, transparent);
  --stroke-nous: color-mix(in srgb, var(--gp-line) 60%, transparent);
  --shadow-nous:
    inset 0 1px 0 color-mix(in srgb, var(--gp-paper) 90%, transparent),
    0 10px 30px color-mix(in srgb, var(--gp-line) 22%, transparent);
}

/* ── 2b. Dark appearance: 36 % paper cards so the bloom reads through ── */
:root:root.dark[data-hermes-theme='glacier-glass'],
:root:root.dark[data-hermes-theme='sunstone-glass'] {
  --ui-bg-chrome: color-mix(in srgb, var(--gp-paper) 72%, transparent);
  --ui-bg-sidebar: color-mix(in srgb, var(--gp-shell) 52%, transparent);
  --ui-bg-editor: color-mix(in srgb, var(--gp-paper) 36%, transparent);
  --ui-bg-elevated: color-mix(in srgb, var(--gp-paper) 76%, transparent);
  --ui-bg-card: color-mix(in srgb, var(--gp-paper) 45%, transparent);
  --ui-bg-input: color-mix(in srgb, var(--gp-paper) 44%, transparent);
  --ui-widget-surface-background: color-mix(in srgb, var(--gp-paper) 45%, transparent);
  --ui-stroke-tertiary: color-mix(in srgb, var(--gp-line) 42%, transparent);
  --stroke-nous: color-mix(in srgb, var(--gp-line) 55%, transparent);
  --shadow-nous:
    inset 0 1px 0 color-mix(in srgb, var(--gp-paper) 80%, transparent),
    0 10px 30px color-mix(in srgb, var(--gp-shell) 34%, transparent);
}

/* ── 3. The bloom (spec §3a). Rule of the whole system: a tint over a FLAT fill is
       a flat fill. So the field is the theme's canvas plus three radials from its
       own accent, anchored to the shell (background-attachment: fixed), and every
       surface above composites its alpha over it. Radials are scaled to a desktop
       window — the spec's 125 %/95 %/75 % were tuned for a 320-420 px panel and
       wash out into a flat field at 1300 px. ── */
:root:root[data-hermes-theme='glacier-glass'] body, :root:root[data-hermes-theme='sunstone-glass'] body,
:root:root.dark[data-hermes-theme='glacier-glass'] body, :root:root.dark[data-hermes-theme='sunstone-glass'] body {
  background-color: var(--gp-canvas);
  background-attachment: fixed;
  background-repeat: no-repeat;
}
:root:root[data-hermes-theme='glacier-glass'] body, :root:root[data-hermes-theme='sunstone-glass'] body {
  background-image:
    linear-gradient(157deg, color-mix(in srgb, var(--gp-accent) 14%, transparent) 0%,
      color-mix(in srgb, var(--gp-accent) 5%, transparent) 42%, transparent 74%),
    radial-gradient(46% 42% at 3% -8%, color-mix(in srgb, var(--gp-accent) 26%, transparent), transparent 62%),
    radial-gradient(42% 38% at 105% 110%, color-mix(in srgb, var(--gp-accent) 16%, transparent), transparent 64%),
    radial-gradient(28% 26% at 90% 38%, color-mix(in srgb, var(--gp-accent) 8%, transparent), transparent 66%);
}
:root:root.dark[data-hermes-theme='glacier-glass'] body, :root:root.dark[data-hermes-theme='sunstone-glass'] body {
  background-image:
    linear-gradient(157deg, color-mix(in srgb, var(--gp-accent) 36%, transparent) 0%,
      color-mix(in srgb, var(--gp-accent) 11%, transparent) 42%, transparent 74%),
    radial-gradient(46% 42% at 3% -8%, color-mix(in srgb, var(--gp-accent) 62%, transparent), transparent 62%),
    radial-gradient(42% 38% at 105% 110%, color-mix(in srgb, var(--gp-accent) 44%, transparent), transparent 64%),
    radial-gradient(28% 26% at 90% 38%, color-mix(in srgb, var(--gp-accent) 22%, transparent), transparent 66%);
}

/* The field must be the only opaque paint under the panels. The app nests surface
   painters (a chrome wrapper + an isolate wrapper + the chat surface), and stacked
   alphas multiply — 1-(1-.72)(1-.36)(1-.36) = 88 % paper, which is why a token-level
   alpha never reads as glass. Clear the ancestors that CONTAIN the chat surface, the
   way the app's own glass rule clears the shell painters, and let the leaves paint. */
:root:root[data-hermes-theme='glacier-glass'] :is(div, section, main):has([data-slot='composer-bounds']),
:root:root[data-hermes-theme='sunstone-glass'] :is(div, section, main):has([data-slot='composer-bounds']),
:root:root.dark[data-hermes-theme='glacier-glass'] :is(div, section, main):has([data-slot='composer-bounds']),
:root:root.dark[data-hermes-theme='sunstone-glass'] :is(div, section, main):has([data-slot='composer-bounds']) {
  background-color: transparent !important;
}
/* the app's two opaque shell painters would hide the bloom behind them */
:root:root[data-hermes-theme='glacier-glass'] [data-contrib-shell],
:root:root[data-hermes-theme='sunstone-glass'] [data-contrib-shell],
:root:root.dark[data-hermes-theme='glacier-glass'] [data-contrib-shell],
:root:root.dark[data-hermes-theme='sunstone-glass'] [data-contrib-shell],
:root:root[data-hermes-theme='glacier-glass'] [data-slot='sidebar-wrapper'],
:root:root[data-hermes-theme='sunstone-glass'] [data-slot='sidebar-wrapper'],
:root:root.dark[data-hermes-theme='glacier-glass'] [data-slot='sidebar-wrapper'],
:root:root.dark[data-hermes-theme='sunstone-glass'] [data-slot='sidebar-wrapper'] {
  background-color: transparent !important;
}
:root:root[data-hermes-theme='glacier-glass'] [data-glass-field],
:root:root[data-hermes-theme='sunstone-glass'] [data-glass-field],
:root:root.dark[data-hermes-theme='glacier-glass'] [data-glass-field],
:root:root.dark[data-hermes-theme='sunstone-glass'] [data-glass-field] {
  --glass-field: var(--gp-canvas);
}

/* ── 4. Radii + edges on the surfaces the spec names ── */
:root:root[data-hermes-theme='glacier-glass'] [data-overlay-surface],
:root:root[data-hermes-theme='sunstone-glass'] [data-overlay-surface],
:root:root.dark[data-hermes-theme='glacier-glass'] [data-overlay-surface],
:root:root.dark[data-hermes-theme='sunstone-glass'] [data-overlay-surface],
:root:root[data-hermes-theme='glacier-glass'] [data-slot='dialog-content'],
:root:root[data-hermes-theme='sunstone-glass'] [data-slot='dialog-content'],
:root:root.dark[data-hermes-theme='glacier-glass'] [data-slot='dialog-content'],
:root:root.dark[data-hermes-theme='sunstone-glass'] [data-slot='dialog-content'] {
  border-radius: 18px;
  box-shadow: var(--shadow-nous);
  border-color: color-mix(in srgb, var(--gp-line) 55%, transparent);
}
:root:root[data-hermes-theme='glacier-glass'] [data-slot='composer-surface'],
:root:root[data-hermes-theme='sunstone-glass'] [data-slot='composer-surface'],
:root:root.dark[data-hermes-theme='glacier-glass'] [data-slot='composer-surface'],
:root:root.dark[data-hermes-theme='sunstone-glass'] [data-slot='composer-surface'] {
  border-radius: 20px;
  border: 1px solid color-mix(in srgb, var(--gp-line) 45%, transparent);
}

/* Specular rim + the two-part shadow on the surfaces that float (spec §3): the
   inset line is light catching the top edge, the outer is depth, not a drop shadow. */
:root:root[data-hermes-theme='glacier-glass'] [data-slot='composer-surface'],
:root:root[data-hermes-theme='sunstone-glass'] [data-slot='composer-surface'],
:root:root.dark[data-hermes-theme='glacier-glass'] [data-slot='composer-surface'],
:root:root.dark[data-hermes-theme='sunstone-glass'] [data-slot='composer-surface'] {
  box-shadow:
    inset 0 1px 0 color-mix(in srgb, var(--gp-paper) 80%, transparent),
    0 10px 30px color-mix(in srgb, var(--gp-shell) 34%, transparent);
  backdrop-filter: blur(20px) saturate(130%);
  -webkit-backdrop-filter: blur(20px) saturate(130%);
}
:root:root[data-hermes-theme='glacier-glass'] [data-slot='sidebar'],
:root:root[data-hermes-theme='sunstone-glass'] [data-slot='sidebar'],
:root:root.dark[data-hermes-theme='glacier-glass'] [data-slot='sidebar'],
:root:root.dark[data-hermes-theme='sunstone-glass'] [data-slot='sidebar'] {
  box-shadow: inset 0 1px 0 color-mix(in srgb, var(--gp-paper) 26%, transparent);
}
:root:root[data-hermes-theme='glacier-glass'] [data-slot='composer-bounds'],
:root:root[data-hermes-theme='sunstone-glass'] [data-slot='composer-bounds'],
:root:root.dark[data-hermes-theme='glacier-glass'] [data-slot='composer-bounds'],
:root:root.dark[data-hermes-theme='sunstone-glass'] [data-slot='composer-bounds'] {
  box-shadow: inset 0 1px 0 color-mix(in srgb, var(--gp-paper) 32%, transparent);
}

/* ── 5. One accent ring, never a second outline (spec §3) ── */
:root:root[data-hermes-theme='glacier-glass'] :is(button, a, input, textarea, [role='button'], [role='tab'], [role='menuitem']):focus-visible,
:root:root[data-hermes-theme='sunstone-glass'] :is(button, a, input, textarea, [role='button'], [role='tab'], [role='menuitem']):focus-visible,
:root:root.dark[data-hermes-theme='glacier-glass'] :is(button, a, input, textarea, [role='button'], [role='tab'], [role='menuitem']):focus-visible,
:root:root.dark[data-hermes-theme='sunstone-glass'] :is(button, a, input, textarea, [role='button'], [role='tab'], [role='menuitem']):focus-visible {
  outline: none;
  border-color: var(--gp-accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--gp-accent) 26%, transparent);
}

/* ── 6. Every preference gets an answer (spec §3 accessibility fallbacks) ── */
@media (prefers-reduced-transparency: reduce) {
  :root:root[data-hermes-theme='glacier-glass'],
:root:root[data-hermes-theme='sunstone-glass'] {
    --ui-bg-chrome: var(--gp-paper);
    --ui-bg-sidebar: var(--gp-paper);
    --ui-bg-editor: var(--gp-paper);
    --ui-bg-elevated: var(--gp-paper);
    --ui-bg-card: var(--gp-paper);
    --ui-bg-input: var(--gp-paper);
    --ui-surface-background: var(--gp-paper);
    --ui-chat-surface-background: var(--gp-paper);
    --ui-sidebar-surface-background: var(--gp-paper);
    --ui-editor-surface-background: var(--gp-paper);
  }
  :root:root[data-hermes-theme='glacier-glass'] body, :root:root[data-hermes-theme='sunstone-glass'] body,
  :root:root.dark[data-hermes-theme='glacier-glass'] body, :root:root.dark[data-hermes-theme='sunstone-glass'] body { background-image: none; }
}
@media (prefers-contrast: more) {
  :root:root[data-hermes-theme='glacier-glass'],
:root:root[data-hermes-theme='sunstone-glass'] {
    --ui-bg-chrome: var(--gp-paper);
    --ui-bg-sidebar: var(--gp-paper);
    --ui-bg-editor: var(--gp-paper);
    --ui-bg-elevated: var(--gp-paper);
    --ui-bg-card: var(--gp-paper);
    --ui-bg-input: var(--gp-paper);
    --ui-surface-background: var(--gp-paper);
    --ui-chat-surface-background: var(--gp-paper);
    --ui-sidebar-surface-background: var(--gp-paper);
    --ui-editor-surface-background: var(--gp-paper);
    --ui-stroke-primary: var(--dt-border);
    --ui-stroke-secondary: var(--dt-border);
    --ui-stroke-tertiary: color-mix(in srgb, var(--dt-border) 80%, transparent);
  }
  :root:root[data-hermes-theme='glacier-glass'] body, :root:root[data-hermes-theme='sunstone-glass'] body,
  :root:root.dark[data-hermes-theme='glacier-glass'] body, :root:root.dark[data-hermes-theme='sunstone-glass'] body { background-image: none; }
}

/* ── 7. The theme's own text ladder. The app's tier alphas are tuned against a
       near-black canvas; over tinted glass in a LIGHT appearance they measure
       3.1-3.6:1, so each tier is re-based to clear 4.5:1 in both appearances.
       (Specificity raised one level on purpose: an override layer of equal
       specificity would otherwise win on DOM order.) ── */
:root:root[data-hermes-theme='glacier-glass'],
:root:root[data-hermes-theme='sunstone-glass'] {
  --ui-text-tertiary: color-mix(in srgb, var(--ui-base) 70%, transparent);
  --ui-text-quaternary: color-mix(in srgb, var(--ui-base) 70%, transparent);
  --conversation-scaffold-text: color-mix(in srgb, var(--ui-base) 76%, transparent);
  --conversation-scaffold-meta: color-mix(in srgb, var(--ui-base) 70%, transparent);
}
:root:root.dark[data-hermes-theme='glacier-glass'],
:root:root.dark[data-hermes-theme='sunstone-glass'] {
  --ui-text-tertiary: color-mix(in srgb, var(--ui-base) 58%, transparent);
  --ui-text-quaternary: color-mix(in srgb, var(--ui-base) 50%, transparent);
  --conversation-scaffold-text: color-mix(in srgb, var(--ui-base) 68%, transparent);
  --conversation-scaffold-meta: color-mix(in srgb, var(--ui-base) 50%, transparent);
}
`

export default {
  id: ID,
  name: 'Glassy Panel',
  register(ctx) {
    // The material layer (surfaces, bloom, radii, rings) rides one stylesheet,
    // scoped to the two theme names so it can never touch another skin.
    let el = document.getElementById(STYLE_ID)
    if (!el) {
      el = document.createElement('style')
      el.id = STYLE_ID
      el.setAttribute('data-hermes-plugin', ID)
      document.head.appendChild(el)
    }
    if (el.textContent !== CSS) el.textContent = CSS

    try {
      ctx.storage.set('loadedAt', new Date().toISOString())
    } catch {
      /* best-effort load receipt */
    }

    const contributions = GLASS_THEMES.map(theme => ({
      id: `theme.${theme.name}`,
      area: THEMES_AREA,
      data: theme
    }))

    for (const [name, label] of [
      ['glacier-glass', 'Glacier Glass (cool glass)'],
      ['sunstone-glass', 'Sunstone Glass (warm glass)']
    ]) {
      contributions.push({
        id: `apply.${name}`,
        area: PALETTE_AREA,
        data: {
          id: `glassy.apply.${name}`,
          label: `Appearance: ${label}`,
          keywords: ['appearance', 'theme', 'glass', 'glassy', 'palette', name],
          run: () => {
            const applied = requestTheme(name)
            host.notify({
              kind: applied ? 'info' : 'error',
              message: applied
                ? `${label} applied — both appearances carry the glassy-panel material set.`
                : `${label} is not available (theme registration failed?).`
            })
          }
        }
      })
    }

    ctx.registerMany(contributions)
  }
}
