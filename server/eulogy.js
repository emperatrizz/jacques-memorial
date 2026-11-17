// Live multilingual eulogy: paragraphs, presenter control, WebSocket sync.
// Two fully isolated sessions: 'live' (public) and 'rehearsal' (admins only).
import { Router } from 'express'
import crypto from 'crypto'
import { WebSocketServer } from 'ws'
import { db } from './db.js'
import { requireAdmin } from './auth.js'

const SESSIONS = ['live', 'rehearsal']

function getParagraphs() {
  return db.prepare(`SELECT id, position, th, en, fr FROM eulogy_paragraphs ORDER BY position`).all()
}

function paragraphCount() {
  return db.prepare(`SELECT COUNT(*) AS n FROM eulogy_paragraphs`).get().n
}

function settings() {
  const row = db.prepare(`SELECT json FROM content WHERE key = 'eulogy'`).get()
  const s = row ? JSON.parse(row.json) : {}
  return { published: Boolean(s.published), revealAll: Boolean(s.revealAll) }
}

function isPublished() {
  return settings().published
}

function saveSettings(next) {
  db.prepare(
    `INSERT INTO content (key, json, updated_at) VALUES ('eulogy', ?, datetime('now'))
     ON CONFLICT(key) DO UPDATE SET json = excluded.json, updated_at = excluded.updated_at`,
  ).run(JSON.stringify({ ...settings(), ...next }))
}

/** How many paragraphs guests may currently see (progressive reveal). */
function revealedCount() {
  const s = settings()
  if (!s.published) return 0
  if (s.revealAll) return paragraphCount()
  return getSession('live').max_index + 1
}

function getSession(name) {
  return db.prepare(`SELECT * FROM eulogy_sessions WHERE name = ?`).get(name)
}

function stateFor(name) {
  const s = getSession(name)
  return {
    type: 'state',
    session: name,
    index: s.current_index,
    active: s.current_index >= 0,
    published: isPublished(),
    count: paragraphCount(),
    // live: paragraphs guests may see; rehearsal: same rule for realistic preview
    revealed: name === 'live' ? revealedCount() : s.max_index + 1,
  }
}

// ——— WebSocket hub ———
const subscribers = { live: new Set(), rehearsal: new Set() }

export function broadcast(session) {
  const msg = JSON.stringify(stateFor(session))
  for (const ws of subscribers[session]) {
    if (ws.readyState === ws.OPEN) ws.send(msg)
  }
}

function adminCookieValid(cookieHeader) {
  const m = /(?:^|;\s*)memorial_admin=([a-f0-9]+)/.exec(cookieHeader || '')
  if (!m) return false
  const row = db
    .prepare(
      `SELECT a.active FROM sessions s JOIN admins a ON a.id = s.admin_id
       WHERE s.token = ? AND s.expires_at >= datetime('now')`,
    )
    .get(m[1])
  return Boolean(row && row.active)
}

export function setupEulogyWs(server) {
  const wss = new WebSocketServer({ noServer: true })
  server.on('upgrade', (req, socket, head) => {
    let url
    try {
      url = new URL(req.url, 'http://x')
    } catch {
      socket.destroy()
      return
    }
    if (url.pathname !== '/ws/eulogy') {
      socket.destroy()
      return
    }
    const session = url.searchParams.get('session') === 'rehearsal' ? 'rehearsal' : 'live'
    // Rehearsal is isolated: only authenticated admins may subscribe.
    if (session === 'rehearsal' && !adminCookieValid(req.headers.cookie)) {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
      socket.destroy()
      return
    }
    wss.handleUpgrade(req, socket, head, (ws) => {
      ws.isAlive = true
      ws.on('pong', () => {
        ws.isAlive = true
      })
      subscribers[session].add(ws)
      ws.on('close', () => subscribers[session].delete(ws))
      ws.send(JSON.stringify(stateFor(session)))
    })
  })
  // Heartbeat: drop dead connections so broadcasts stay fast
  setInterval(() => {
    for (const session of SESSIONS) {
      for (const ws of subscribers[session]) {
        if (!ws.isAlive) {
          ws.terminate()
          subscribers[session].delete(ws)
          continue
        }
        ws.isAlive = false
        try {
          ws.ping()
        } catch {
          /* closing */
        }
      }
    }
  }, 30_000).unref()
}

// ——— Public API (never exposes drafts or the rehearsal session) ———
export const eulogyPublicRouter = Router()

eulogyPublicRouter.get('/', (req, res) => {
  const published = isPublished()
  const live = getSession('live')
  // Only revealed paragraphs ever leave the server — guests cannot read ahead.
  const revealed = revealedCount()
  res.json({
    published,
    revealed,
    paragraphs: published
      ? getParagraphs()
          .slice(0, revealed)
          .map(({ id, th, en, fr }) => ({ id, th, en, fr }))
      : [],
    live: { index: published ? live.current_index : -1, active: published && live.current_index >= 0 },
  })
})

eulogyPublicRouter.get('/state', (req, res) => {
  const published = isPublished()
  const live = getSession('live')
  res.json({
    published,
    index: published ? live.current_index : -1,
    active: published && live.current_index >= 0,
    count: published ? paragraphCount() : 0,
    revealed: revealedCount(),
  })
})

// ——— Admin API ———
export const eulogyAdminRouter = Router()
eulogyAdminRouter.use(requireAdmin)

eulogyAdminRouter.get('/', (req, res) => {
  res.json({
    ...settings(),
    paragraphs: getParagraphs(),
    sessions: {
      live: stateFor('live'),
      rehearsal: stateFor('rehearsal'),
    },
  })
})

function validTexts(b) {
  return b && ['th', 'en', 'fr'].every((k) => typeof b[k] === 'string' && b[k].length <= 4000)
}

eulogyAdminRouter.post('/paragraphs', (req, res) => {
  if (!validTexts(req.body)) return res.status(400).json({ error: 'bad_paragraph' })
  const max = db.prepare(`SELECT COALESCE(MAX(position), 0) AS m FROM eulogy_paragraphs`).get().m
  const id = crypto.randomUUID()
  db.prepare(`INSERT INTO eulogy_paragraphs (id, position, th, en, fr) VALUES (?, ?, ?, ?, ?)`).run(
    id,
    max + 1,
    req.body.th.trim(),
    req.body.en.trim(),
    req.body.fr.trim(),
  )
  res.json({ ok: true, id })
})

eulogyAdminRouter.put('/paragraphs/:id', (req, res) => {
  if (!validTexts(req.body)) return res.status(400).json({ error: 'bad_paragraph' })
  const info = db
    .prepare(`UPDATE eulogy_paragraphs SET th = ?, en = ?, fr = ? WHERE id = ?`)
    .run(req.body.th.trim(), req.body.en.trim(), req.body.fr.trim(), req.params.id)
  if (info.changes === 0) return res.status(404).json({ error: 'not_found' })
  res.json({ ok: true })
})

eulogyAdminRouter.post('/paragraphs/:id/move', (req, res) => {
  const dir = req.body?.dir
  if (dir !== 'up' && dir !== 'down') return res.status(400).json({ error: 'bad_dir' })
  const me = db.prepare(`SELECT id, position FROM eulogy_paragraphs WHERE id = ?`).get(req.params.id)
  if (!me) return res.status(404).json({ error: 'not_found' })
  const other = db
    .prepare(
      dir === 'up'
        ? `SELECT id, position FROM eulogy_paragraphs WHERE position < ? ORDER BY position DESC LIMIT 1`
        : `SELECT id, position FROM eulogy_paragraphs WHERE position > ? ORDER BY position ASC LIMIT 1`,
    )
    .get(me.position)
  if (!other) return res.json({ ok: true }) // already at the edge
  const swap = db.transaction(() => {
    db.prepare(`UPDATE eulogy_paragraphs SET position = ? WHERE id = ?`).run(other.position, me.id)
    db.prepare(`UPDATE eulogy_paragraphs SET position = ? WHERE id = ?`).run(me.position, other.id)
  })
  swap()
  res.json({ ok: true })
})

eulogyAdminRouter.delete('/paragraphs/:id', (req, res) => {
  db.prepare(`DELETE FROM eulogy_paragraphs WHERE id = ?`).run(req.params.id)
  broadcast('live')
  broadcast('rehearsal')
  res.json({ ok: true })
})

eulogyAdminRouter.post('/publish', (req, res) => {
  saveSettings({ published: Boolean(req.body?.published) })
  broadcast('live')
  res.json({ ok: true, ...settings() })
})

// After the ceremony: reveal the whole text to visitors at once.
eulogyAdminRouter.post('/reveal', (req, res) => {
  saveSettings({ revealAll: Boolean(req.body?.revealAll) })
  broadcast('live')
  res.json({ ok: true, ...settings() })
})

// Rehearsal only: wind everything back for another practice run.
eulogyAdminRouter.post('/reset-rehearsal', (req, res) => {
  db.prepare(
    `UPDATE eulogy_sessions SET current_index = -1, max_index = -1, updated_at = datetime('now') WHERE name = 'rehearsal'`,
  ).run()
  broadcast('rehearsal')
  res.json({ ok: true })
})

// One presenter at a time: taking control invalidates the previous controller.
eulogyAdminRouter.post('/control', (req, res) => {
  const session = req.body?.session === 'rehearsal' ? 'rehearsal' : 'live'
  const token = crypto.randomBytes(24).toString('hex')
  db.prepare(`UPDATE eulogy_sessions SET controller_token = ?, updated_at = datetime('now') WHERE name = ?`).run(
    token,
    session,
  )
  res.json({ ok: true, controlToken: token, state: stateFor(session) })
})

eulogyAdminRouter.post('/advance', (req, res) => {
  const session = req.body?.session === 'rehearsal' ? 'rehearsal' : 'live'
  const { controlToken, index } = req.body || {}
  const s = getSession(session)
  if (!s.controller_token || controlToken !== s.controller_token) {
    return res.status(403).json({ error: 'control_lost' })
  }
  const count = paragraphCount()
  if (!Number.isInteger(index) || index < -1 || index >= count) {
    return res.status(400).json({ error: 'bad_index' })
  }
  db.prepare(
    `UPDATE eulogy_sessions SET current_index = ?, max_index = MAX(max_index, ?), updated_at = datetime('now') WHERE name = ?`,
  ).run(index, index, session)
  broadcast(session)
  res.json({ ok: true, state: stateFor(session) })
})
