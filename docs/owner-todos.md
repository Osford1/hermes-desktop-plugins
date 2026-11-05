# Owner's to-dos before this goes public

Everything in this repository is written and self-verified; these are the items that need a human
decision or a human hand. Nothing below has been done — this file is the checklist, not a log.

## 1. Take the six missing screenshots

`docs/screenshots/README.md` lists them with what each needs to show. Nothing links to them, so the
repository is not broken without them — it is just less convincing. The two that matter most:
`themes-side-by-side.png` (the README's lead claim) and `tracker-kanban-board.png` (the only
component here with no capture at all).

## 2. Confirm the privacy decision on two file-name strings

The scrub pass is done and documented in `_plans/hermes-desktop-plugins.md`:

- No absolute paths, no home-directory names, and no cloud-storage folder names anywhere in the
  text. The only files that ever contained a real path were the tracker backend's two constants, and
  those are now environment variables with placeholder defaults.
- `plugins/**/plugin.js` are byte-identical copies of your installed plugins — that is deliberate,
  so `md5sum` can prove it:

  | File | md5 |
  | --- | --- |
  | `plugins/atkinson-font/plugin.js` | `0867062187557f3e4290fc71f45a91c9` |
  | `plugins/glassy-panel/plugin.js` | `f0e392e1a3a0bd330ce0ac6d1422bc9d` |
  | `plugins/legibility/plugin.js` | `5320c5c43ebc1713fc960ef044e379bb` |
  | `plugins/tracker-kanban/plugin.js` | `6c15ba6522fa5b5465051840e16b3400` |

  `.gitattributes` sets `* -text` so a clone cannot normalise the line endings and break those
  hashes. The cost of keeping the sources pristine is that two strings inside them stay as written:
  `tracker-kanban/plugin.js` names your vault's `tasks.md` and `_Tracker/tracker.md`, and
  `glassy-panel/plugin.js` and `legibility/plugin.js` mention "Hermes stuff" as a folder name.

  **Your call.** They are folder names, not paths, and they read as "the author's personal setup" —
  which is what the README says the plugin is. If you would rather they go, the honest way is to
  edit the plugin sources, copy the edits back, and let the md5 check fail with a note saying why.

## 3. The plan file

`_plans/hermes-desktop-plugins.md` was written before the repository and is the record of the
decisions above. Two of its figures were corrected against reality during the build: the palettes
carry **25** colour roles, not 26, and `$HERMES_HOME` on this machine is `%LOCALAPPDATA%\hermes`,
not `%APPDATA%`. The plan has been updated to match.

## 4. First push — not run

No git command has been run and no remote exists. When you are ready, from the repository root:

```sh
git init -b main
git add -A
git commit -m "Four desktop plugins for Hermes: two measured glass themes, a low-vision typeface, a legibility pass and a personal kanban"
git remote add origin <your-remote>
git push -u origin main
```

Two things to decide at that moment:

- **Repository description.** The plan's candidate, 116 characters, within GitHub's 120-char limit:
  *Four Hermes desktop plugins: two measured glass themes, a low-vision typeface, a legibility pass
  and a kanban board.*
- **Topics.** `hermes`, `hermes-agent`, `desktop-app`, `plugins`, `electron`, `theming`,
  `glassmorphism`, `accessibility`, `wcag`, `contrast`, `atkinson-hyperlegible`, `typography`,
  `css-override`, `kanban`.

## 5. If you want it to stay honest

The numbers this repository asserts are the ones that will rot:

| Claim | Where it comes from now | What invalidates it |
| --- | --- | --- |
| 68/68 pairs pass, tightest 5.57:1 / 3.05:1 | `tools/contrast-report.py`, re-runnable | editing any palette value in `glassy-panel/plugin.js` |
| 2.98 → 4.69 and 3.84 → 4.69 | `docs/evidence/audit-*.json`, a real on/off census | an app version that renames the classes the legibility layer clamps |
| 22 → 10 small targets, 9/10 px gone | same two JSONs | the same app change |
| plugin sources are unmodified | `md5sum plugins/*/plugin.js` against your installed copies | installing a newer version of any of them |

If you re-shoot or re-measure, change the numbers in the README rather than adding a disclaimer —
and re-run:

```sh
python tools/contrast-report.py
```
