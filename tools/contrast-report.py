#!/usr/bin/env python3
"""Measure the WCAG 2.1 contrast ratio of every text and boundary pair in the
two glassy-panel themes.

The palette is not duplicated here: the script reads the 26 colour roles out of
`plugins/glassy-panel/plugin.js`, which is the file the app actually loads. Run
it from the repository root:

    python tools/contrast-report.py                      # plugins/glassy-panel/plugin.js
    python tools/contrast-report.py path/to/plugin.js

Print a markdown table per theme per appearance, then a summary. Exit 0 if every
pair meets its minimum, 1 if any does not, 2 if the palette could not be parsed.

What this measures: the roles as hex, in isolation. What it does not measure: the
composited surface. The dark glass renders a card at 45 % paper over a bloom, so
the effective ratio under body text there is lower than the ratio below. Measure
that on rendered pixels, not on the palette.

Standard: WCAG 2.1 relative luminance, contrast = (L1 + 0.05) / (L2 + 0.05).
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

# (foreground role, background role, minimum, kind)
# 4.5:1 is the WCAG AA floor for body text; 3.0:1 is the floor for non-text
# boundaries (component edges, focus rings).
TEXT_PAIRS = [
    ("foreground", "background", 4.5),
    ("cardForeground", "card", 4.5),
    ("popoverForeground", "popover", 4.5),
    ("mutedForeground", "muted", 4.5),
    ("mutedForeground", "background", 4.5),
    ("secondaryForeground", "secondary", 4.5),
    ("accentForeground", "accent", 4.5),
    ("foreground", "sidebarBackground", 4.5),
    ("foreground", "userBubble", 4.5),
    ("primaryForeground", "primary", 4.5),
    ("destructiveForeground", "destructive", 4.5),
]

BOUNDARY_PAIRS = [
    ("border", "background", 3.0),
    ("border", "card", 3.0),
    ("sidebarBorder", "sidebarBackground", 3.0),
    ("userBubbleBorder", "userBubble", 3.0),
    ("primary", "background", 3.0),
    ("ring", "background", 3.0),
]

HEX_RE = re.compile(r'"([A-Za-z]+)":\s*"(#[0-9a-fA-F]{6})"')
NAME_RE = re.compile(r"name:\s*'([A-Za-z0-9-]+)'")


def srgb_channel(value: float) -> float:
    return value / 12.92 if value <= 0.04045 else ((value + 0.055) / 1.055) ** 2.4


def relative_luminance(hex_colour: str) -> float:
    r, g, b = (int(hex_colour[i : i + 2], 16) / 255 for i in (1, 3, 5))
    return (
        0.2126 * srgb_channel(r)
        + 0.7152 * srgb_channel(g)
        + 0.0722 * srgb_channel(b)
    )


def contrast_ratio(fg: str, bg: str) -> float:
    a, b = relative_luminance(fg), relative_luminance(bg)
    lighter, darker = max(a, b), min(a, b)
    return (lighter + 0.05) / (darker + 0.05)


def parse_palettes(js_path: Path) -> dict:
    """Return {theme_name: {'light': {role: hex}, 'dark': {role: hex}}}."""
    themes: dict = {}
    theme = mode = None
    for raw in js_path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        match = NAME_RE.match(line)
        if match and line.startswith("name:"):
            theme = match.group(1)
            themes[theme] = {"light": {}, "dark": {}}
            mode = None
            continue
        if line.startswith("darkColors"):
            mode = "dark"
            continue
        if line.startswith("colors"):
            mode = "light"
            continue
        if line.startswith("}"):
            mode = None
            continue
        match = HEX_RE.match(line)
        if match and theme and mode:
            themes[theme][mode][match.group(1)] = match.group(2).lower()
    return themes


def report(js_path: Path) -> int:
    themes = parse_palettes(js_path)
    themes = {k: v for k, v in themes.items() if v["light"] or v["dark"]}
    if not themes:
        print(f"could not parse any palette out of {js_path}", file=sys.stderr)
        return 2

    # Report the path relative to the repository root so the output never
    # carries a machine-specific absolute path.
    root = Path(__file__).resolve().parent.parent
    try:
        shown = js_path.resolve().relative_to(root)
    except ValueError:
        shown = Path(js_path.name)

    print(f"# Contrast report — {shown.as_posix()}")
    print()
    print(f"Roles parsed: {len(next(iter(themes.values()))['light'])} per appearance.")
    print()

    checks = 0
    failures = 0
    tightest_text = None
    tightest_boundary = None

    for theme, modes in themes.items():
        for mode in ("light", "dark"):
            roles = modes[mode]
            if not roles:
                continue
            print(f"## {theme} / {mode}")
            print()
            print("| pair | hex | hex | ratio | min | result |")
            print("| --- | --- | --- | --- | --- | --- |")
            for fg, bg, minimum in TEXT_PAIRS + BOUNDARY_PAIRS:
                if fg not in roles or bg not in roles:
                    print(f"| {fg} on {bg} | missing | missing | — | {minimum}:1 | SKIP |")
                    continue
                ratio = contrast_ratio(roles[fg], roles[bg])
                ok = ratio >= minimum
                checks += 1
                if not ok:
                    failures += 1
                kind = "text" if minimum == 4.5 else "boundary"
                seen = {"pair": f"{fg} on {bg}", "ratio": ratio, "theme": theme, "mode": mode}
                if kind == "text" and (tightest_text is None or ratio < tightest_text["ratio"]):
                    tightest_text = seen
                if kind == "boundary" and (
                    tightest_boundary is None or ratio < tightest_boundary["ratio"]
                ):
                    tightest_boundary = seen
                print(
                    f"| {fg} on {bg} | `{roles[fg]}` | `{roles[bg]}` "
                    f"| {ratio:.2f}:1 | {minimum}:1 | {'pass' if ok else '**FAIL**'} |"
                )
            print()

    print("## Summary")
    print()
    print(f"- pairs checked: {checks}")
    print(f"- failures: {failures}")
    if tightest_text:
        print(
            f"- tightest text pair: {tightest_text['pair']} "
            f"in {tightest_text['theme']}/{tightest_text['mode']} "
            f"at {tightest_text['ratio']:.2f}:1"
        )
    if tightest_boundary:
        print(
            f"- tightest boundary pair: {tightest_boundary['pair']} "
            f"in {tightest_boundary['theme']}/{tightest_boundary['mode']} "
            f"at {tightest_boundary['ratio']:.2f}:1"
        )
    print()
    print(f"RESULT: {'PASS' if failures == 0 else 'FAIL'} ({checks - failures}/{checks})")
    return 0 if failures == 0 else 1


def main(argv: list[str]) -> int:
    root = Path(__file__).resolve().parent.parent
    js_path = Path(argv[1]) if len(argv) > 1 else root / "plugins" / "glassy-panel" / "plugin.js"
    if not js_path.exists():
        print(f"not found: {js_path}", file=sys.stderr)
        return 2
    return report(js_path)


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
