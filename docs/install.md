# Install, disable, uninstall

A desktop plugin is a directory containing a `plugin.js`. Copying that directory in installs it;
deleting it uninstalls it. Nothing in this repository writes to the app's install tree or to
`config.yaml` (with one exception noted under the unified package below), which is what makes
`hermes update` unable to revert any of it.

## Where plugins load from

The desktop app hot-loads UI plugins from two roots under the Hermes home — the directory that
contains `config.yaml`:

| Root | Layout | Used by |
| --- | --- | --- |
| Desktop plugins | `$HERMES_HOME/desktop-plugins/<name>/plugin.js` | `atkinson-font`, `glassy-panel`, `legibility`, and the desktop half of `tracker-kanban` |
| Unified package | `$HERMES_HOME/plugins/<name>/desktop/plugin.js` | a plugin that also ships a server half — `tracker-kanban` uses this |

On my Windows machine `$HERMES_HOME` is `%LOCALAPPDATA%\hermes\`, so the first root resolves to
`%LOCALAPPDATA%\hermes\desktop-plugins\`. On another platform, use the Hermes home your install
created — the directory holding `config.yaml`. Both roots are the same shape: a directory name of
your choosing, holding `plugin.js`.

Two naming rules that matter:

- The **directory name** is not the plugin's identity — the `id` in `plugin.js` is. Keep them the
  same anyway, because it is the directory you will be looking at six months from now.
- The loader scans **every** directory under the root for a `plugin.js`. That is why a renamed
  directory still loads, and why disabling means moving a directory out of the tree rather than
  renaming it.

## Installing one of these plugins

1. Quit the desktop app if you are replacing a plugin you already have loaded.
2. Copy the folder in, keeping its name:

   ```sh
   cp -r plugins/atkinson-font "$HERMES_HOME/desktop-plugins/"
   cp -r plugins/glassy-panel   "$HERMES_HOME/desktop-plugins/"
   cp -r plugins/legibility     "$HERMES_HOME/desktop-plugins/"
   ```

   Copy the whole folder, not just `plugin.js`: `tracker-kanban` and any plugin you write later can
   carry more than one file.
3. Start the app. The loader watches the root and hot-reloads *edits* to a plugin it already has,
   but it discovers a new directory at load time — so a first install wants a restart.
4. Check **Settings → Plugins** — the plugin should be listed.
5. Apply it. Themes: Command Center (`mod+K`) → *Appearance: Glacier Glass (cool glass)* /
   *Sunstone Glass (warm glass)*, or **Settings → Appearance**. Font: on at load, `mod+alt+a`
   toggles. Legibility: on at load, `mod+alt+l` toggles.

### Installing `tracker-kanban` (the unified package)

This one needs a server half as well, because its data comes through HTTP rather than the file
system:

```
$HERMES_HOME/plugins/tracker-kanban/
├─ plugin.yaml              # name / version / description / author / kind: dashboard
├─ dashboard/plugin_api.py  # FastAPI router, mounted at /api/plugins/tracker-kanban/
└─ desktop/plugin.js        # copy of plugins/tracker-kanban/plugin.js
```

1. Copy `plugins/tracker-kanban/plugin.js` to `$HERMES_HOME/plugins/tracker-kanban/desktop/plugin.js`.
2. Copy `plugins/tracker-kanban/plugin.yaml` and `plugins/tracker-kanban/dashboard/plugin_api.py`
   into the same tree, as laid out above.
3. Add `tracker-kanban` to `plugins.enabled` in `config.yaml`. **This is the one config edit in this
   repository** — a route with a backend half is registered server-side, so the desktop toggle in
   Settings → Plugins is not enough on its own.
4. Point the backend at your markdown files. The two constants in `plugin_api.py` default to
   placeholder paths (`<vault>/tasks.md`, `<tracker>/tracker.md`) that are deliberately not usable:

   ```sh
   export TRACKER_KANBAN_TASKS="/path/to/your/tasks.md"
   export TRACKER_KANBAN_TRACKER="/path/to/your/tracker.md"
   ```

   `tasks.md` wants `##` sections named Today, This Week, Backlog, Waiting On and Done, containing
   `- [ ]` / `- [x]` items (nested children are rendered). `tracker.md` wants a pipe table with at
   least five columns: `name | status | next | touched | notes`, where `status` is one of idea,
   backlog, active, paused, done, abandoned.
5. Restart, then check `GET /api/plugins/tracker-kanban/board` returns both files as JSON and
   `GET /api/plugins/tracker-kanban/version` returns two mtime/size tokens.

## Disable, without uninstalling

Three ways, in increasing order of stubbornness:

1. **Settings → Plugins**, or the plugin's own toggle command (`mod+alt+a`, `mod+alt+l`, or the
   Command Center entries). This writes to the plugin's own storage, so the choice survives a
   restart.
2. **Remove the scope attribute** — the plugins all scope their CSS to a `data-*` attribute on
   `<html>` (`data-atkinson-font`, `data-legibility`, and `data-hermes-theme` for the themes), and
   every style layer is removed on unload. Switching back to another theme in Settings → Appearance
   is the complete revert for `glassy-panel`: the material layer is scoped to the two theme names
   and cannot touch another skin.
3. **Move the directory out of the tree**:

   ```sh
   mv "$HERMES_HOME/desktop-plugins/legibility" "$HERMES_HOME/desktop-plugins-disabled/"
   ```

   Move it, do not rename it in place. `legibility.disabled/` still sits *under* the plugin root, so
   the loader still finds the `plugin.js` inside it and the plugin still loads.

The running window has already loaded the plugin, so a change at the file level applies on the next
app restart. Do not expect it to be live.

## Uninstall

Delete the folder. There is nothing else to undo:

```sh
rm -rf "$HERMES_HOME/desktop-plugins/legibility"
rm -rf "$HERMES_HOME/plugins/tracker-kanban"   # and drop it from plugins.enabled
```

No install-tree edit, no stylesheet, no config key, no leftover DOM — `ctx.onDispose` removes the
`<style>` element and the scope attribute when the plugin unloads.

## Confirming a plugin actually ran

Each plugin leaves a receipt, because "it looks different" is not evidence:

| Plugin | Check |
| --- | --- |
| All four | `ctx.storage.set('loadedAt', …)` — search the renderer's Local Storage for the plugin id. This is how you tell "the plugin ran" from "the app changed". |
| `atkinson-font` | Command Center → *measure what is rendering*. It compares rendered widths of the same string with and without the family in front; equal widths mean the family did not resolve, i.e. the font is not installed. The result is also stored under `probe`. |
| `legibility` | Command Center → *contrast report*. Samples the real composited surface through a canvas and prints the five tiers' ratios. |
| `glassy-panel` | `python tools/contrast-report.py` from this repository — palette-level, no app needed. |
| `tracker-kanban` | `GET /api/plugins/tracker-kanban/board`. A 404 means the file path is wrong or the plugin is not in `plugins.enabled`. |

## Updating to a newer copy of these plugins

Replace the directory, restart. Plugin storage is keyed by plugin id, so your toggles and theme
choice survive an update as long as the id is unchanged. If a plugin changes its `id`, it starts
fresh.

## When something looks wrong

| Symptom | Cause |
| --- | --- |
| The typeface did not change | The font is not installed system-wide — run the width probe; it reports `resolves: no`. |
| The typeface changed but code blocks look odd | That is the opt-in mono command, not the main swap. Turn it off with *Mono: turn off*. |
| Labels are small again after an app update | The legibility layer clamps class strings (`text-[0.6875rem]`…) that the app renamed. Report it — the plugin needs the new names, and it is a one-line fix. |
| The glass is flat | You are on another theme (the material layer is scoped to `glacier-glass` / `sunstone-glass`), or `prefers-reduced-transparency: reduce` is set on the OS, which the theme honours by dropping to opaque paper. |
| Two layers are fighting over font-size | Do not run another plugin that sets sizes on the same classes. `glassy-panel` deliberately does *not* set type metrics; the legibility layer owns them. |
| A plugin reloads but nothing applies | Some plugins only take effect on a restart — the running window already holds the old module. |
