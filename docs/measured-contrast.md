# Measured contrast

Every ratio below is the output of `tools/contrast-report.py`, which reads the colour roles straight
out of `plugins/glassy-panel/plugin.js` — the file the app loads — and applies the WCAG 2.1
relative-luminance formula. Regenerate it with `python tools/contrast-report.py`.

`4.5:1` is the WCAG AA floor for body text; `3.0:1` is the floor for non-text boundaries such as
component edges and focus rings. This measures the roles as hex in isolation — it does **not**
measure the composited surface. The dark glass renders a card at 45 % paper over a bloom, so the
effective ratio under body text there is lower than the ratio in the table.

Scope: 17 pairs — 11 text and 6 boundary — across the two themes' four appearances, 68 checks. The
plugin's own header claims 18 validated pairs; this script models 17 of them and prints the list it
checks below, so the difference is visible rather than averaged away.

---

# Contrast report — plugins/glassy-panel/plugin.js

Roles parsed: 25 per appearance.

## glacier-glass / light

| pair | hex | hex | ratio | min | result |
| --- | --- | --- | --- | --- | --- |
| foreground on background | `#16232a` | `#eef2f4` | 14.25:1 | 4.5:1 | pass |
| cardForeground on card | `#16232a` | `#fbfdfe` | 15.74:1 | 4.5:1 | pass |
| popoverForeground on popover | `#16232a` | `#f0f2f3` | 14.30:1 | 4.5:1 | pass |
| mutedForeground on muted | `#48595f` | `#f5f8fa` | 6.86:1 | 4.5:1 | pass |
| mutedForeground on background | `#48595f` | `#eef2f4` | 6.50:1 | 4.5:1 | pass |
| secondaryForeground on secondary | `#16232a` | `#d8e4e7` | 12.36:1 | 4.5:1 | pass |
| accentForeground on accent | `#16232a` | `#dfe8eb` | 12.91:1 | 4.5:1 | pass |
| foreground on sidebarBackground | `#16232a` | `#dfe8ec` | 12.91:1 | 4.5:1 | pass |
| foreground on userBubble | `#16232a` | `#ccdfe2` | 11.64:1 | 4.5:1 | pass |
| primaryForeground on primary | `#ffffff` | `#116974` | 6.37:1 | 4.5:1 | pass |
| destructiveForeground on destructive | `#ffffff` | `#b3261e` | 6.54:1 | 4.5:1 | pass |
| border on background | `#6d818a` | `#eef2f4` | 3.61:1 | 3.0:1 | pass |
| border on card | `#6d818a` | `#fbfdfe` | 3.99:1 | 3.0:1 | pass |
| sidebarBorder on sidebarBackground | `#73868f` | `#dfe8ec` | 3.05:1 | 3.0:1 | pass |
| userBubbleBorder on userBubble | `#3e858e` | `#ccdfe2` | 3.07:1 | 3.0:1 | pass |
| primary on background | `#116974` | `#eef2f4` | 5.66:1 | 3.0:1 | pass |
| ring on background | `#116974` | `#eef2f4` | 5.66:1 | 3.0:1 | pass |

## glacier-glass / dark

| pair | hex | hex | ratio | min | result |
| --- | --- | --- | --- | --- | --- |
| foreground on background | `#e8f1f4` | `#0d1417` | 16.22:1 | 4.5:1 | pass |
| cardForeground on card | `#e8f1f4` | `#162024` | 14.47:1 | 4.5:1 | pass |
| popoverForeground on popover | `#e8f1f4` | `#202a2e` | 12.79:1 | 4.5:1 | pass |
| mutedForeground on muted | `#9fb3bb` | `#121b1e` | 8.02:1 | 4.5:1 | pass |
| mutedForeground on background | `#9fb3bb` | `#0d1417` | 8.53:1 | 4.5:1 | pass |
| secondaryForeground on secondary | `#e8f1f4` | `#132628` | 13.72:1 | 4.5:1 | pass |
| accentForeground on accent | `#e8f1f4` | `#112123` | 14.47:1 | 4.5:1 | pass |
| foreground on sidebarBackground | `#e8f1f4` | `#070c0e` | 17.15:1 | 4.5:1 | pass |
| foreground on userBubble | `#e8f1f4` | `#1f4243` | 9.55:1 | 4.5:1 | pass |
| primaryForeground on primary | `#05191a` | `#45c8bf` | 8.85:1 | 4.5:1 | pass |
| destructiveForeground on destructive | `#2a0a0a` | `#ff6b6b` | 6.60:1 | 4.5:1 | pass |
| border on background | `#647a84` | `#0d1417` | 4.12:1 | 3.0:1 | pass |
| border on card | `#647a84` | `#162024` | 3.68:1 | 3.0:1 | pass |
| sidebarBorder on sidebarBackground | `#50626a` | `#070c0e` | 3.09:1 | 3.0:1 | pass |
| userBubbleBorder on userBubble | `#379590` | `#1f4243` | 3.06:1 | 3.0:1 | pass |
| primary on background | `#45c8bf` | `#0d1417` | 9.09:1 | 3.0:1 | pass |
| ring on background | `#45c8bf` | `#0d1417` | 9.09:1 | 3.0:1 | pass |

## sunstone-glass / light

| pair | hex | hex | ratio | min | result |
| --- | --- | --- | --- | --- | --- |
| foreground on background | `#2b2117` | `#efe6d8` | 12.74:1 | 4.5:1 | pass |
| cardForeground on card | `#2b2117` | `#fffdfb` | 15.53:1 | 4.5:1 | pass |
| popoverForeground on popover | `#2b2117` | `#f4f2f0` | 14.11:1 | 4.5:1 | pass |
| mutedForeground on muted | `#65584a` | `#f8f3eb` | 6.24:1 | 4.5:1 | pass |
| mutedForeground on background | `#65584a` | `#efe6d8` | 5.57:1 | 4.5:1 | pass |
| secondaryForeground on secondary | `#2b2117` | `#e7d6c3` | 11.11:1 | 4.5:1 | pass |
| accentForeground on accent | `#2b2117` | `#e9dbc9` | 11.59:1 | 4.5:1 | pass |
| foreground on sidebarBackground | `#2b2117` | `#ede4d8` | 12.52:1 | 4.5:1 | pass |
| foreground on userBubble | `#2b2117` | `#ecd9ca` | 11.51:1 | 4.5:1 | pass |
| primaryForeground on primary | `#ffffff` | `#a04a08` | 6.04:1 | 4.5:1 | pass |
| destructiveForeground on destructive | `#ffffff` | `#b3261e` | 6.54:1 | 4.5:1 | pass |
| border on background | `#8d7962` | `#efe6d8` | 3.37:1 | 3.0:1 | pass |
| border on card | `#8d7962` | `#fffdfb` | 4.10:1 | 3.0:1 | pass |
| sidebarBorder on sidebarBackground | `#927e68` | `#ede4d8` | 3.09:1 | 3.0:1 | pass |
| userBubbleBorder on userBubble | `#b16b35` | `#ecd9ca` | 3.05:1 | 3.0:1 | pass |
| primary on background | `#a04a08` | `#efe6d8` | 4.88:1 | 3.0:1 | pass |
| ring on background | `#a04a08` | `#efe6d8` | 4.88:1 | 3.0:1 | pass |

## sunstone-glass / dark

| pair | hex | hex | ratio | min | result |
| --- | --- | --- | --- | --- | --- |
| foreground on background | `#f6efe6` | `#1b1714` | 15.61:1 | 4.5:1 | pass |
| cardForeground on card | `#f6efe6` | `#262019` | 14.13:1 | 4.5:1 | pass |
| popoverForeground on popover | `#f6efe6` | `#302a23` | 12.43:1 | 4.5:1 | pass |
| mutedForeground on muted | `#bca894` | `#211c17` | 7.37:1 | 4.5:1 | pass |
| mutedForeground on background | `#bca894` | `#1b1714` | 7.77:1 | 4.5:1 | pass |
| secondaryForeground on secondary | `#f6efe6` | `#302518` | 13.12:1 | 4.5:1 | pass |
| accentForeground on accent | `#f6efe6` | `#292117` | 13.90:1 | 4.5:1 | pass |
| foreground on sidebarBackground | `#f6efe6` | `#12100e` | 16.64:1 | 4.5:1 | pass |
| foreground on userBubble | `#f6efe6` | `#4d3a20` | 9.48:1 | 4.5:1 | pass |
| primaryForeground on primary | `#241505` | `#e8a33d` | 8.22:1 | 4.5:1 | pass |
| destructiveForeground on destructive | `#2a0f08` | `#ff7a66` | 7.03:1 | 4.5:1 | pass |
| border on background | `#87735e` | `#1b1714` | 3.94:1 | 3.0:1 | pass |
| border on card | `#87735e` | `#262019` | 3.56:1 | 3.0:1 | pass |
| sidebarBorder on sidebarBackground | `#705f4e` | `#12100e` | 3.11:1 | 3.0:1 | pass |
| userBubbleBorder on userBubble | `#b27e33` | `#4d3a20` | 3.05:1 | 3.0:1 | pass |
| primary on background | `#e8a33d` | `#1b1714` | 8.26:1 | 3.0:1 | pass |
| ring on background | `#e8a33d` | `#1b1714` | 8.26:1 | 3.0:1 | pass |

## Summary

- pairs checked: 68
- failures: 0
- tightest text pair: mutedForeground on background in sunstone-glass/light at 5.57:1
- tightest boundary pair: sidebarBorder on sidebarBackground in glacier-glass/light at 3.05:1

RESULT: PASS (68/68)

