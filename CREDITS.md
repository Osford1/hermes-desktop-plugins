# Credits

Everything in this repository — the four plugins, the two palettes, the docs and the contrast
tool — is my own work, under the MIT licence in [LICENSE](LICENSE). Three things in it are not
mine, and one platform it depends on is worth naming.

## Atkinson Hyperlegible

The typeface `plugins/atkinson-font/plugin.js` switches the UI to.

- Copyright 2020 Braille Institute of America, Inc.
- SIL Open Font License, Version 1.1 — the full text is reproduced byte-for-byte at
  [`docs/third-party/atkinson-hyperlegible-OFL.txt`](docs/third-party/atkinson-hyperlegible-OFL.txt).
- Source: <https://www.brailleinstitute.org/freefont/>

**No font binary is redistributed in this repository.** The plugin only names the family and falls
through to the app's own stack when it is missing, so the OFL's redistribution terms are never
engaged — the licence text travels with the family name so that the terms are visible to anyone
who installs the font and copies the plugin. If you ever vendor `AtkinsonHyperlegible-Regular.ttf`
and friends into a fork, the OFL text has to travel with them in the same directory.

## Hermes Agent and `@hermes/plugin-sdk`

The app these plugins load into, and the SDK they import (`host`, `ctx`, the registration areas,
`contrastRatio`, `requestTheme`) — by Nous Research. Not vendored and not modified; every plugin
here imports it at load time. The app's own design-token names (`--ui-*`, `--dt-*`) and `data-slot`
attributes are quoted in these plugins because they are the interface a desktop plugin overrides.

## Skills that did the work

Credited by name because the numbers in this repository came out of them.

| Skill | Author / licence | What it contributed |
| --- | --- | --- |
| `glassy-panel-design` | Nous Research, MIT (Hermes skill library) | The spec the two themes were built to: the CIE L\* ladder (not hex guesses), the material table whose alphas appear in `plugins/glassy-panel/plugin.js`, the radius-rhythm rule, the bloom construction and the 18-pair contrast contract. The plugin header cites it section by section (§2 ladder, §3 material, §5 rhythm), and `tools/contrast-report.py` reproduces the spec's own tightest pair (Sunstone light, line on canvas, 3.37:1) independently. |
| `apple-design` | Hermes skill library | The HIG review that produced the finding list `plugins/legibility/plugin.js` implements: two text tiers failing WCAG AA by construction, the sub-12 px call-site census, the 24 px control size, and the OS preferences the app ignored. |
| `hermes-desktop-plugins` | Hermes skill library | The loader layout (`$HERMES_HOME/desktop-plugins/<name>/plugin.js` and the `plugins/<name>/desktop/` unified-package half), hot reload, the move-out-of-tree disable, the restart-not-live caveat, and the authoring pitfalls that `docs/writing-a-plugin.md` repeats. |

## Runtime dependency

`plugins/tracker-kanban/dashboard/plugin_api.py` imports **FastAPI** (`APIRouter`, `HTTPException`),
which the Hermes dashboard supplies — same as it does for its own routes. Not vendored here.

## Screenshots

The captures in `docs/img/` are my own screen recordings of Hermes desktop v0.17.0 on Windows, taken
during the 2026-09-20 design review. Each is captioned in the README with what it actually shows,
including the two that were taken with a settings popover open. See
[`docs/screenshots/README.md`](docs/screenshots/README.md) for the shots that are still missing.
