"""Tracker Kanban plugin — project + task board backend.

Mounted at /api/plugins/tracker-kanban/ by the dashboard plugin system.

Serves two markdown files that the desktop plugin parses and renders:

  - a tasks file    (Today / This Week / Backlog / Waiting on / Done sections)
  - a tracker file  (a pipe table, one row per project)

Both endpoints are read-only GETs returning the raw markdown; the desktop
plugin parses and renders. A lightweight /version endpoint (mtime + size) lets
the UI poll for changes cheaply instead of re-downloading both files.

Point it at your own files with two environment variables:

  TRACKER_KANBAN_TASKS    path to the tasks markdown    (default: <vault>/tasks.md)
  TRACKER_KANBAN_TRACKER  path to the tracker markdown  (default: <tracker>/tracker.md)

The defaults are placeholders, not usable paths — they exist so the two
constants below are never a machine-specific absolute path in a public repo.
"""

from __future__ import annotations

import logging
import os
from pathlib import Path

from fastapi import APIRouter, HTTPException

log = logging.getLogger(__name__)

router = APIRouter()

TASKS_PATH = Path(os.environ.get("TRACKER_KANBAN_TASKS", "<vault>/tasks.md"))
TRACKER_PATH = Path(os.environ.get("TRACKER_KANBAN_TRACKER", "<tracker>/tracker.md"))


def _read(path: Path) -> str:
    if not path.exists():
        raise HTTPException(status_code=404, detail=f"not found: {path}")
    return path.read_text(encoding="utf-8", errors="replace")


@router.get("/board")
def get_board() -> dict:
    """Raw markdown for both files in one round trip."""
    return {
        "tasks": _read(TASKS_PATH),
        "tracker": _read(TRACKER_PATH),
    }


@router.get("/version")
def get_version() -> dict:
    """Cheap change token: mtime_ns + size for each file. Poll this, and
    only refetch /board when it changes."""
    out = {}
    for key, path in (("tasks", TASKS_PATH), ("tracker", TRACKER_PATH)):
        try:
            st = path.stat()
            out[key] = {"mtime_ns": st.st_mtime_ns, "size": st.st_size}
        except OSError:
            out[key] = None
    return out
