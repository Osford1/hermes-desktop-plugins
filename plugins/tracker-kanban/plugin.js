/**
 * tracker-kanban — personal Kanban board for the Hermes desktop app.
 *
 * Full '/board' page (sidebar row "Board" + ⌘K command) rendering the
 * user's two markdown sources of truth:
 *   - Brain 1 Obsidian vault  tasks.md   (Today / This Week / Backlog / Waiting on / Done)
 *   - Hermes stuff/_Tracker   tracker.md (project pipe table)
 *
 * Data flows through the plugin's Python backend
 * (plugins/tracker-kanban/dashboard/plugin_api.py) via ctx.rest — no
 * direct file access from the renderer. Refresh: poll /version (mtime
 * tokens) and refetch /board only when something changed.
 *
 * Plain ESM, loaded uncompiled — jsx() calls only, no JSX syntax.
 * Enable: plugins.enabled must include 'tracker-kanban' AND the desktop
 * toggle in Settings → Plugins.
 */

import {
  PALETTE_AREA,
  ROUTES_AREA,
  SIDEBAR_NAV_AREA,
  host,
  useQuery,
  useQueryClient
} from '@hermes/plugin-sdk'
import { jsx, jsxs } from 'react/jsx-runtime'
import { useEffect, useRef } from 'react'

const ID = 'tracker-kanban'

const TASK_COLS = [
  ['today', 'Today', 'var(--ui-success, #4ade80)'],
  ['this week', 'This Week', 'var(--ui-info, #38bdf8)'],
  ['backlog', 'Backlog', '#8b8cf8'],
  ['waiting on', 'Waiting On', 'var(--ui-warning, #facc15)'],
  ['done', 'Done', 'var(--ui-text-quaternary)']
]

const PROJECT_COLS = [
  ['idea', 'Ideas', 'var(--ui-text-quaternary)'],
  ['backlog', 'Backlog', '#8b8cf8'],
  ['active', 'Active', 'var(--ui-success, #4ade80)'],
  ['paused', 'Paused', 'var(--ui-warning, #facc15)'],
  ['done', 'Done', 'var(--ui-info, #38bdf8)'],
  ['abandoned', 'Abandoned', 'var(--ui-danger, #f87171)']
]

// ---------------------------------------------------------------- parsing

function parseTasks(md) {
  const sections = {}
  for (const [key] of TASK_COLS) sections[key] = []
  let current = null
  for (const raw of md.splitlines()) {
    const h = raw.match(/^##\s+(.+?)\s*$/)
    if (h) {
      const heading = h[1].trim().toLowerCase()
      current = Object.prototype.hasOwnProperty.call(sections, heading) ? heading : null
      continue
    }
    if (current === null) continue
    const m = raw.match(/^(\s*)- \[( |x)\]\s+(.*)$/)
    if (!m) continue
    const item = { text: m[3].trim(), checked: m[2] === 'x', children: [] }
    if (m[1] && sections[current].length) sections[current][sections[current].length - 1].children.push(item)
    else sections[current].push(item)
  }
  return sections
}

function parseProjects(md) {
  const rows = []
  for (const raw of md.splitlines()) {
    const line = raw.trim()
    if (!line.startsWith('|') || line.includes('---') || line.includes('Status')) continue
    const cells = line.replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim())
    if (cells.length < 5) continue
    rows.push({ name: cells[0], status: cells[1].toLowerCase(), next: cells[2], touched: cells[3], notes: cells[4] })
  }
  return rows
}

// ---------------------------------------------------------------- UI bits

const colStyle = {
  minWidth: 190,
  flex: '1 1 0',
  display: 'flex',
  flexDirection: 'column',
  gap: 6
}

function ColHead({ title, color, count, warn }) {
  return jsxs('div', {
    style: {
      fontWeight: 600, padding: '4px 8px', borderBottom: `2px solid ${color}`,
      marginBottom: 2, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13
    },
    children: [
      jsx('span', { style: { color }, children: '●' }),
      jsx('span', { children: title }),
      warn ? jsx('span', { style: { color: 'var(--ui-danger, #f87171)', fontSize: 11 }, children: 'over limit!' }) : null,
      jsx('span', { style: { marginLeft: 'auto', color: 'var(--ui-text-tertiary)', fontWeight: 400 }, children: String(count) })
    ]
  })
}

function TaskCard({ item, doneCol }) {
  const done = item.checked || doneCol
  return jsxs('div', {
    style: {
      border: '1px solid var(--ui-stroke-secondary)', borderRadius: 8,
      padding: '6px 10px', lineHeight: 1.35, fontSize: 13,
      opacity: done ? 0.55 : 1
    },
    children: [
      jsxs('span', { children: [item.checked ? '☑' : '☐', ' ', item.text] }),
      item.children.length
        ? jsx('ul', {
            style: { margin: '4px 0 0', paddingLeft: 16, color: 'var(--ui-text-tertiary)', fontSize: 12 },
            children: item.children.map((c, i) =>
              jsxs('li', { style: { opacity: c.checked ? 0.6 : 1, marginBottom: 2 }, children: [c.checked ? '☑' : '☐', ' ', c.text] }, i))
          })
        : null
    ]
  })
}

function ProjectCard({ p }) {
  return jsxs('div', {
    style: {
      border: '1px solid var(--ui-stroke-secondary)', borderRadius: 8,
      padding: '8px 10px', fontSize: 13
    },
    children: [
      jsx('div', { style: { fontWeight: 600, marginBottom: 4 }, children: p.name }),
      jsxs('div', { style: { opacity: 0.85, marginBottom: 4 }, children: [
        jsx('span', { style: { color: 'var(--ui-text-tertiary)' }, children: 'next: ' }), p.next
      ] }),
      p.notes && p.notes !== '-'
        ? jsx('div', { style: { color: 'var(--ui-text-tertiary)', fontSize: 12, marginBottom: 4 }, children: p.notes })
        : null,
      jsx('div', { style: { color: 'var(--ui-text-quaternary)', fontSize: 11 }, children: p.touched })
    ]
  })
}

function Row({ label, pill, children }) {
  return jsxs('div', {
    style: { marginBottom: 16 },
    children: [
      jsxs('div', {
        style: {
          fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em',
          color: 'var(--ui-text-tertiary)', margin: '4px 0 8px'
        },
        children: [
          label,
          jsx('span', {
            style: {
              fontWeight: 400, textTransform: 'none', letterSpacing: 0,
              border: '1px solid var(--ui-stroke-secondary)', borderRadius: 999,
              padding: '0 8px', marginLeft: 6, fontSize: 11
            },
            children: pill
          })
        ]
      }),
      jsx('div', { style: { display: 'flex', gap: 10, alignItems: 'flex-start' }, children })
    ]
  })
}

// ---------------------------------------------------------------- board page

function Board({ rest }) {
  const qc = useQueryClient()

  const { data, error, isLoading } = useQuery({
    queryKey: [ID, 'board'],
    queryFn: async () => {
      const raw = await rest('/board')
      return { tasks: parseTasks(raw.tasks || ''), projects: parseProjects(raw.tracker || '') }
    },
    staleTime: Infinity // manual invalidation drives refresh
  })

  // Cheap change detection: poll /version, invalidate the board query when
  // either file's mtime/size token changes.
  const lastToken = useRef(null)
  useQuery({
    queryKey: [ID, 'version'],
    queryFn: async () => {
      const v = await rest('/version')
      const token = JSON.stringify(v)
      if (lastToken.current !== null && lastToken.current !== token) {
        qc.invalidateQueries({ queryKey: [ID, 'board'] })
      }
      lastToken.current = token
      return v
    },
    refetchInterval: 5_000
  })

  if (isLoading) return jsx('div', { style: { padding: 16, color: 'var(--ui-text-tertiary)' }, children: 'Loading board…' })
  if (error) return jsxs('div', { style: { padding: 16, color: 'var(--ui-danger, #f87171)' }, children: ['Board failed to load: ', String(error?.message || error)] })
  if (!data) return null

  const { tasks, projects } = data
  const byStatus = {}
  for (const [key] of PROJECT_COLS) byStatus[key] = []
  for (const p of projects) if (byStatus[p.status]) byStatus[p.status].push(p)
  const activeN = byStatus.active.length
  const openTasks = TASK_COLS.filter(([k]) => k !== 'done')
    .reduce((n, [k]) => n + (tasks[k] || []).filter(t => !t.checked).length, 0)

  return jsxs('div', {
    className: 'h-full overflow-auto',
    style: { padding: 16 },
    children: [
      jsx(Row, {
        label: 'Tasks',
        pill: `${openTasks} open`,
        children: TASK_COLS.map(([key, title, color]) => {
          const items = (tasks[key] || []).filter(i => (key === 'done' ? i.checked : true))
          return jsxs('div', {
            style: colStyle,
            children: [
              jsx(ColHead, { title, color, count: items.length }),
              items.length
                ? items.map((it, i) => jsx(TaskCard, { item: it, doneCol: key === 'done' }, i))
                : jsx('div', { style: { color: 'var(--ui-text-quaternary)', opacity: 0.5, textAlign: 'center', padding: 8, fontSize: 13 }, children: '—' })
            ]
          }, key)
        })
      }),
      jsx(Row, {
        label: 'Projects',
        pill: `active ${activeN}/2`,
        children: PROJECT_COLS.map(([key, title, color]) => {
          const items = byStatus[key]
          return jsxs('div', {
            style: colStyle,
            children: [
              jsx(ColHead, { title, color, count: items.length, warn: key === 'active' && activeN > 2 }),
              items.length
                ? items.map((p, i) => jsx(ProjectCard, { p }, i))
                : jsx('div', { style: { color: 'var(--ui-text-quaternary)', opacity: 0.5, textAlign: 'center', padding: 8, fontSize: 13 }, children: '—' })
            ]
          }, key)
        })
      }),
      jsxs('div', {
        style: { color: 'var(--ui-text-quaternary)', fontSize: 11, marginTop: 4 },
        children: ['Sources: Brain 1/tasks.md + _Tracker/tracker.md · ', String(projects.length), ' projects · refreshes on save']
      })
    ]
  })
}

// ---------------------------------------------------------------- register

export default {
  id: ID,
  name: 'Tracker Kanban',
  register(ctx) {
    const render = () => jsx(Board, { rest: ctx.rest })

    ctx.register({
      id: 'page',
      area: ROUTES_AREA,
      data: { path: '/board' },
      render
    })

    ctx.register({
      id: 'nav',
      area: SIDEBAR_NAV_AREA,
      order: 55,
      data: { path: '/board', label: 'Board', codicon: 'project' }
    })

    ctx.register({
      id: 'open',
      area: PALETTE_AREA,
      data: {
        id: 'trackerKanban.open',
        label: 'Board: Open personal kanban',
        keywords: ['kanban', 'board', 'tasks', 'projects', 'tracker'],
        run: () => host.navigate('/board')
      }
    })
  }
}
