# Write one

A desktop plugin is a single `plugin.js` in its own folder, loaded uncompiled. No build step, no
`package.json`, no bundler. This is the walkthrough I wish I had when I wrote the first one, told
through `plugins/atkinson-font/plugin.js` because that plugin is the smallest one here that still
does everything: a CSS override, a scope attribute, persisted state, a probe, Command Center
commands, a keybind and a clean teardown.

## 0. Decide whether it should be a plugin at all

| If you want to… | Do this |
| --- | --- |
| Change a value the app already exposes as a setting | Change the setting. A plugin for this is a fork of state you do not own. |
| Change something the app has *no* setting for — a design token, a theme, a label, a route | Write a plugin. It survives `hermes update`; editing the install tree does not. |
| Change provider, model or tool behaviour | That is config or a server plugin, not a desktop plugin. |

`atkinson-font` exists because the app exposes the **terminal** font in Settings and the UI font
only as a design token. There was no setting to flip.

## 1. Find the exact thing you are overriding

Open the desktop app's DevTools, find the element, and look at *where the value comes from* — this
decides the whole strategy. Three outcomes:

| You find | Your rule must be |
| --- | --- |
| A token on `<html>`, set by the theme provider as an inline style | a stylesheet rule with `!important` |
| A Tailwind-style utility class on the element (`text-[0.6875rem]`) | a rule on the class, at least equal specificity, with the scope attribute in front |
| A token inside the app's `@layer base` | an **unlayered** rule — unlayered beats layered at equal specificity |

In the font plugin's case, the theme provider writes
`document.documentElement.style.setProperty('--dt-font-sans', …)`, so a plain `:root { … }` rule is
dead on arrival. The comment at the top of `plugin.js` records that finding, which is the only
reason I still remember it.

## 2. The skeleton

```js
import { host, PALETTE_AREA, KEYBINDS_AREA } from '@hermes/plugin-sdk'

const ID = 'my-plugin'
const STYLE_ID = 'hermes-my-plugin-layer'   // unique, or you will fight another plugin
const ATTR = 'data-my-plugin'               // your scope attribute on <html>

export default {
  id: ID,
  name: 'My Plugin',
  description: 'One line, shown in Settings → Plugins.',
  register(ctx) { /* ... */ }
}
```

Pick `ID`, the style element's id and the scope attribute up front and never reuse another
plugin's. `loadedAt` receipts and stored preferences are namespaced by `id`.

## 3. Inject the CSS, idempotently

```js
function inject() {
  if (typeof document === 'undefined') return null      // guard: not every context has a DOM
  let el = document.getElementById(STYLE_ID)
  if (!el) {
    el = document.createElement('style')
    el.id = STYLE_ID
    el.setAttribute('data-hermes-plugin', ID)           // a marker of your own, for greppability
    document.head.appendChild(el)
  }
  if (el.textContent !== CSS) el.textContent = CSS      // re-runs after a hot reload
  return el
}
```

The `!==` check matters: the loader hot-reloads edited plugins, so `register` can run again in a
window that already has your style element.

## 4. Scope, then honour the scope

```js
:root[data-my-plugin='on'] { --dt-font-sans: 'Atkinson Hyperlegible', … !important }
```

```js
const attr = (name, on) => document.documentElement.setAttribute(name, on ? 'on' : 'off')
const isOn = name => document.documentElement.getAttribute(name) === 'on'
```

Putting the switch in a DOM attribute rather than in the stylesheet is what makes the toggle live,
the storage round-trip trivial, and the unload complete:

```js
ctx.onDispose(() => {
  for (const t of timers) clearTimeout(t)
  styleEl?.remove()
  document.documentElement.removeAttribute(ATTR)
})
```

## 5. Prove it is doing something

This is the step people skip, and it is the step that makes the plugin trustworthy. A missing font
family falls through the stack silently; a `color-mix` token resolves to a colour you never wrote
down. So measure, in the real renderer:

- **Fonts** — render the same string twice, once with your family in front of `monospace` and once
  without, and compare `getBoundingClientRect().width`. Equal widths mean the family did not
  resolve. `atkinson-font` does this at 64 px in an off-screen span and stores the numbers.
- **Colours** — resolve the computed value through a 2×2 canvas (`fillRect` the backdrop, then the
  colour, then read pixel 1,1) so `color-mix` and `oklab` become actual pixels, then call
  `contrastRatio` from the SDK on the composited pair. That is how `legibility`'s contrast report
  works, and it is the only way to measure the surface a user is actually looking at.

Store the result in `ctx.storage` and surface it as a notification. "It looks different" is not
evidence; a probe that reports the family resolved, with the two measured widths it compared, is.
The probes in this repository leave their numbers in `ctx.storage` under `probe` so you can look at
them after the fact rather than trusting the comment.

## 6. Expose it: Commands and a keybind

```js
ctx.registerMany([
  {
    id: `${ID}.toggle`,
    area: PALETTE_AREA,
    data: {
      id: `${ID}.toggle`,
      label: `My Plugin: ${enabled ? 'turn off' : 'turn on'}`,
      keywords: ['my-plugin', 'whatever-you-would-type-in-command-center'],
      run: () => { /* flip the attribute, persist, notify */ }
    }
  },
  {
    id: `${ID}.keybind`,
    area: KEYBINDS_AREA,
    data: {
      id: `${ID}.toggle.action`,
      label: 'Toggle My Plugin',
      category: 'My Plugin',
      defaults: ['mod+alt+m'],
      run: () => { /* same thing */ }
    }
  }
])
```

Two habits from the plugins here: put the *current state* in the command label
(*"turn off"* when it is on — the label is the only status a user sees), and keep a separate
read-only *report* command that re-runs the probe. `keywords` are what make a command findable by
the word the user has in their head, not the name you chose.

## 7. Persist, and set the default to "on"

```js
const enabled = ctx.storage.get('enabled', true) !== false
let mono = ctx.storage.get('mono', false) === true
```

Note the shape: `get('enabled', true) !== false` treats only an explicit `false` as off, so an
absent key means on. And the inverse for the opt-in: `=== true`. Wrap `storage` in `try/catch` —
it is best-effort, and a plugin that throws on a storage hiccup does not load.

## 8. Install and iterate

Copy the folder into `$HERMES_HOME/desktop-plugins/`, restart the app once, then edit in place —
the loader picks up edits. To turn it off without deleting it, move the folder *out* of the plugin
root; renaming it in place does not work, because the loader scans every directory underneath.
Full detail in [install.md](install.md#disable-without-uninstalling).

## Before you publish it

- [ ] `id`, style-element id and scope attribute are all unique to your plugin.
- [ ] Every rule is scoped to your attribute, and `onDispose` removes the style element, the
      attributes and any timers.
- [ ] Nothing structural is added to or removed from the DOM, and you have not touched the
      transcript, the composer input or `code`/`pre`.
- [ ] Every number you claim comes from a probe or a measurement, not from the comment you wrote
      when you first tried it.
- [ ] The plugin header says *why a plugin* and *what it deliberately does not touch* — that is what
      a future reader (you) needs most.
- [ ] If it overrides app CSS, say which app version you built it against and what will break on an
      update.

## How the four plugins here map onto these stages

| | `atkinson-font` | `legibility` | `glassy-panel` | `tracker-kanban` |
| --- | --- | --- | --- | --- |
| Override mechanism | token + `!important` | token + class clamps, unlayered | tokens, `:root:root`, surfaces, media queries | none — it paints its own page |
| Scope attribute | `data-atkinson-font` (+ a second for mono) | `data-legibility` | the app's own `data-hermes-theme` | n/a |
| Areas used | Command Center, keybinds | Command Center, keybinds | themes, Command Center | routes, sidebar nav, Command Center |
| Proof | rendered-width probe | live composited contrast report | palette table via `tools/contrast-report.py` | a backend endpoint you can curl |
| Storage | `enabled`, `mono`, `probe` | `enabled`, `loadedAt` | `loadedAt` | none |
| Server half | no | no | no | FastAPI router + `plugin.yaml` |
