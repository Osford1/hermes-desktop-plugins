# The desktop plugin contract

What a desktop plugin is allowed to do, taken from the four plugins in this repository — every
claim below is something one of them actually does. Nothing here replaces the app's own docs; where
the app's source is the authority, the note says so.

## Where a plugin lives

```
$HERMES_HOME/desktop-plugins/<name>/plugin.js     # desktop half
$HERMES_HOME/plugins/<name>/desktop/plugin.js     # desktop half of a unified package
$HERMES_HOME/plugins/<name>/plugin.yaml           # unified package manifest
$HERMES_HOME/plugins/<name>/dashboard/plugin_api.py  # unified package server half
```

The loader scans every directory under `desktop-plugins/` for a `plugin.js` and hot-reloads edits.
A plugin directory may hold more files; only `plugin.js` is the entry point.

## Module shape

Plain ESM, loaded uncompiled. No build step, no bundler, no JSX syntax.

```js
import { host, PALETTE_AREA } from '@hermes/plugin-sdk'

export default {
  id: 'my-plugin',                 // identity, and the storage namespace
  name: 'My Plugin',
  description: 'One line, shown in Settings → Plugins.',
  register(ctx) { /* everything happens here */ }
}
```

`register` is called once, when the app loads the plugin. `id` is what plugin storage is keyed to,
so changing it discards the user's saved state.

## Imports that exist

Observed in these four plugins, all from `@hermes/plugin-sdk` unless noted:

| Import | Used by | What it gave |
| --- | --- | --- |
| `host` | all four | `host.notify({ kind, message })` for a toast, `host.navigate(path)` to move the app |
| `PALETTE_AREA` | `atkinson-font`, `legibility`, `glassy-panel`, `tracker-kanban` | the Command Center (`mod+K`) command area |
| `KEYBINDS_AREA` | `atkinson-font`, `legibility` | a rebindable keyboard action |
| `THEMES_AREA` | `glassy-panel` | contribute whole themes to Settings → Appearance |
| `ROUTES_AREA`, `SIDEBAR_NAV_AREA` | `tracker-kanban` | a page and its sidebar row |
| `requestTheme(name)` | `glassy-panel` | apply one of its own registered themes; returns false if the name is not available |
| `contrastRatio(fg, bg)` | `legibility` | WCAG ratio between two `#rrggbb` strings |
| `useQuery`, `useQueryClient` | `tracker-kanban` | react-query, re-exported by the SDK |
| `react/jsx-runtime`, `react` | `tracker-kanban` | `jsx` / `jsxs` and the hooks — the app supplies both, so no bundling is needed |

## `ctx`

| Member | Signature as used | Notes |
| --- | --- | --- |
| `ctx.register` | `register({ id, area, data, order?, render? })` | one contribution |
| `ctx.registerMany` | `registerMany([...])` | a batch, used by `atkinson-font` and `glassy-panel` |
| `ctx.storage` | `get(key, default)`, `set(key, value)` | persisted per plugin id. Treat it as best-effort: all four wrap it in `try/catch`, and it is where these plugins leave a `loadedAt` receipt and the probe results |
| `ctx.onDispose` | `onDispose(fn)` | teardown on unload. `atkinson-font` removes its `<style>` element, its scope attributes and its pending timers here |
| `ctx.rest` | `await ctx.rest('/board')` | a page plugin calling its own backend, relative to `/api/plugins/<name>/` |

## Areas and what each one expects

| Area | `data` | Extra | Example |
| --- | --- | --- | --- |
| `PALETTE_AREA` | `{ id, label, keywords: [], run() }` | — | *Appearance: Glacier Glass (cool glass)*; *Legibility: contrast report* |
| `KEYBINDS_AREA` | `{ id, label, category, defaults: ['mod+alt+a'], run() }` | — | toggle commands |
| `THEMES_AREA` | the whole theme object: `{ name, label, description, colors, darkColors }` | — | both glass themes |
| `ROUTES_AREA` | `{ path: '/board' }` | `render()` returns a React element | the board page |
| `SIDEBAR_NAV_AREA` | `{ path, label, codicon }` | `order: 55` places it in the row | sidebar row *Board* |

## The CSS override ladder

The single most useful thing in this repository. The app's theme provider writes design tokens as
**inline styles on `<html>`** (`root.style.setProperty('--dt-font-sans', …)`), and an inline
declaration outranks every selector — so the obvious `:root { --dt-font-sans: … }` does nothing at
all. Four rungs, in the order you should reach for them:

1. **Unlayered beats layered.** The app's tokens live in `@layer base`. A rule outside any layer
   wins over anything inside a layer, at equal specificity.
2. **`!important` in a stylesheet beats an inline declaration.** This is the only way to move a
   token the theme provider has written inline. `atkinson-font` uses it and nothing else:
   `:root[data-atkinson-font='on'] { --dt-font-sans: … !important }`.
3. **Raise specificity on purpose when another override layer is in play.** `glassy-panel` writes
   `:root:root[data-hermes-theme='…']`: an override layer of *equal* specificity would otherwise win
   on DOM order alone. Without that second `:root` (and the `.dark` variant), the glass text ladder
   loses to the legibility layer.
4. **Scope to a `data-*` attribute on `<html>`, and remove everything in `ctx.onDispose`.** That is
   what makes disabling a true revert rather than a restart-and-hope. Every plugin here does it.

Two more rules the themes needed, both about painting rather than tokens:

- **A tint over a flat fill is a flat fill.** The bloom is three radials plus a linear gradient on
  `<body>` with `background-attachment: fixed`, and every surface above composites its alpha over
  it. Ancestors that contain the chat surface are cleared with `background-color: transparent
  !important`, because stacked alphas multiply:
  `1-(1-.72)(1-.36)(1-.36) = 88 % paper`, which is why a token-level alpha alone never reads as
  glass.
- **Rendered pixels, not tokens, are the measurement.** Palette-level ratios are the design-time
  check; the shipped surface is what a user sees. `legibility` resolves `color-mix` / `oklab`
  through a 2×2 canvas and calls `contrastRatio` on the composited result.

## A plugin with a page

`tracker-kanban` shows the whole shape:

- `ROUTES_AREA` → `{ path: '/board' }` plus a `render` function returning a React element, and
  `SIDEBAR_NAV_AREA` for the row that gets you there.
- `render` builds its tree with `jsx(...)` / `jsxs(...)` calls imported from `react/jsx-runtime` —
  no JSX syntax, so no build step. Inline `style` objects are used throughout; the app's Tailwind
  class names (`h-full overflow-auto`) are available if you want them.
- Data arrives through `ctx.rest('/board')`, never through the file system. `useQuery` caches it and
  a second `useQuery` polls `/version` every 5 s, invalidating the board query only when a token
  changes.
- The server half is a FastAPI `APIRouter` in `dashboard/plugin_api.py`, mounted at
  `/api/plugins/<plugin-name>/`, with `plugin.yaml` next to it describing `name`, `version`,
  `description`, `author` and `kind: dashboard`.

## Authoring pitfalls

Written as rules, not war stories; each one is a thing that broke:

- **Write text nodes only — never add or remove DOM nodes.** React reconciliation holds real node
  references, and structural edits break it. Label rewrites are safe only because they are
  node-idempotent.
- **Leave the transcript, the composer input and `code`/`pre` alone** if you are rewriting text.
  History and typed text must read back exactly as written.
- **On a controlled input, write through the native `HTMLInputElement` prototype value setter**, so
  React's `onChange` sees the new value. A plain `el.value = …` is silently overwritten.
- **Do not let two layers set the same property.** `glassy-panel` deliberately ships no type
  metrics because `legibility` owns the floor; two layers fighting over `font-size` is how you get
  8 px labels.
- **Re-measure after the theme provider paints.** It can run after plugins on a cold boot, so
  `atkinson-font` records its probe at register time *and* again two seconds later, and says which
  phase the numbers came from.
