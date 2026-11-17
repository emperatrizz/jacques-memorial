import { Router } from 'express'
import crypto from 'crypto'
import { db } from './db.js'
import {
  COOKIE_NAME,
  adminFromRequest,
  clearFailures,
  createSession,
  destroySession,
  hashPassword,
  isRateLimited,
  recordFailure,
  requireAdmin,
  requireOwner,
  setSessionCookie,
  verifyPassword,
} from './auth.js'

const router = Router()

const MIN_PASSWORD = 8

function countAdmins() {
  return db.prepare(`SELECT COUNT(*) AS n FROM admins`).get().n
}

function validName(name) {
  return typeof name === 'string' && name.trim().length >= 2 && name.trim().length <= 50
}

function validPassword(pw) {
  return typeof pw === 'string' && pw.length >= MIN_PASSWORD && pw.length <= 200
}

// ——— State / auth ———

router.get('/state', (req, res) => {
  const setupNeeded = countAdmins() === 0
  const admin = adminFromRequest(req)
  res.json({
    setupNeeded,
    setupCodeRequired: setupNeeded && Boolean(process.env.SETUP_CODE),
    loggedIn: Boolean(admin),
    name: admin?.name,
    role: admin?.role,
  })
})

// One-time creation of the owner account. Protected by SETUP_CODE (env var) when set.
router.post('/setup', (req, res) => {
  if (countAdmins() > 0) return res.status(409).json({ error: 'already_set_up' })
  const { name, password, setupCode } = req.body || {}
  if (process.env.SETUP_CODE && setupCode !== process.env.SETUP_CODE) {
    return res.status(403).json({ error: 'bad_setup_code' })
  }
  if (!validName(name)) return res.status(400).json({ error: 'bad_name' })
  if (!validPassword(password)) return res.status(400).json({ error: 'password_too_short' })
  const info = db
    .prepare(`INSERT INTO admins (name, role, password_hash) VALUES (?, 'owner', ?)`)
    .run(name.trim(), hashPassword(password))
  const token = createSession(info.lastInsertRowid)
  setSessionCookie(req, res, token)
  res.json({ ok: true })
})

router.post('/login', (req, res) => {
  const ip = req.ip || 'unknown'
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'too_many_attempts' })
  }
  const { name, password } = req.body || {}
  const admin =
    typeof name === 'string'
      ? db.prepare(`SELECT * FROM admins WHERE name = ? COLLATE NOCASE`).get(name.trim())
      : null
  if (!admin || !admin.active || !verifyPassword(password || '', admin.password_hash)) {
    recordFailure(ip)
    return res.status(401).json({ error: 'bad_credentials' })
  }
  clearFailures(ip)
  const token = createSession(admin.id)
  setSessionCookie(req, res, token)
  res.json({ ok: true, name: admin.name, role: admin.role })
})

router.post('/logout', requireAdmin, (req, res) => {
  destroySession(req.cookies?.[COOKIE_NAME])
  res.clearCookie(COOKIE_NAME, { path: '/' })
  res.json({ ok: true })
})

router.post('/password', requireAdmin, (req, res) => {
  const { current, next } = req.body || {}
  if (!validPassword(next)) return res.status(400).json({ error: 'password_too_short' })
  const row = db.prepare(`SELECT password_hash FROM admins WHERE id = ?`).get(req.admin.id)
  if (!verifyPassword(current || '', row.password_hash)) {
    return res.status(401).json({ error: 'bad_credentials' })
  }
  db.prepare(`UPDATE admins SET password_hash = ? WHERE id = ?`).run(hashPassword(next), req.admin.id)
  res.json({ ok: true })
})

// ——— Site content (any active admin) ———

router.get('/content', requireAdmin, (req, res) => {
  const row = db.prepare(`SELECT json FROM content WHERE key = 'site'`).get()
  res.json(row ? JSON.parse(row.json) : null)
})

router.put('/content', requireAdmin, (req, res) => {
  const site = req.body
  if (!site || typeof site !== 'object' || !site.ceremony || !site.flowers) {
    return res.status(400).json({ error: 'bad_content' })
  }
  db.prepare(
    `INSERT INTO content (key, json, updated_at) VALUES ('site', ?, datetime('now'))
     ON CONFLICT(key) DO UPDATE SET json = excluded.json, updated_at = excluded.updated_at`,
  ).run(JSON.stringify(site))
  res.json({ ok: true })
})

// ——— Announcements (any active admin) ———

router.get('/updates', requireAdmin, (req, res) => {
  const rows = db.prepare(`SELECT * FROM updates ORDER BY date DESC, created_at DESC`).all()
  res.json(
    rows.map((r) => ({
      id: r.id,
      date: r.date,
      title: JSON.parse(r.title),
      body: r.body ? JSON.parse(r.body) : undefined,
      link: r.link ?? undefined,
    })),
  )
})

function validUpdate(u) {
  return u && typeof u.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(u.date) && u.title && typeof u.title === 'object'
}

router.post('/updates', requireAdmin, (req, res) => {
  const u = req.body
  if (!validUpdate(u)) return res.status(400).json({ error: 'bad_update' })
  const id = crypto.randomUUID()
  db.prepare(`INSERT INTO updates (id, date, title, body, link) VALUES (?, ?, ?, ?, ?)`).run(
    id,
    u.date,
    JSON.stringify(u.title),
    u.body ? JSON.stringify(u.body) : null,
    u.link ?? null,
  )
  res.json({ ok: true, id })
})

router.put('/updates/:id', requireAdmin, (req, res) => {
  const u = req.body
  if (!validUpdate(u)) return res.status(400).json({ error: 'bad_update' })
  const info = db
    .prepare(`UPDATE updates SET date = ?, title = ?, body = ?, link = ? WHERE id = ?`)
    .run(u.date, JSON.stringify(u.title), u.body ? JSON.stringify(u.body) : null, u.link ?? null, req.params.id)
  if (info.changes === 0) return res.status(404).json({ error: 'not_found' })
  res.json({ ok: true })
})

router.delete('/updates/:id', requireAdmin, (req, res) => {
  db.prepare(`DELETE FROM updates WHERE id = ?`).run(req.params.id)
  res.json({ ok: true })
})

// ——— Administrator management (owner only) ———

router.get('/admins', requireOwner, (req, res) => {
  res.json(
    db
      .prepare(`SELECT id, name, role, active, created_at FROM admins ORDER BY created_at`)
      .all()
      .map((a) => ({ ...a, active: Boolean(a.active) })),
  )
})

router.post('/admins/:id/active', requireOwner, (req, res) => {
  const target = db.prepare(`SELECT * FROM admins WHERE id = ?`).get(req.params.id)
  if (!target) return res.status(404).json({ error: 'not_found' })
  if (target.role === 'owner') return res.status(403).json({ error: 'cannot_modify_owner' })
  const active = req.body?.active ? 1 : 0
  db.prepare(`UPDATE admins SET active = ? WHERE id = ?`).run(active, target.id)
  if (!active) db.prepare(`DELETE FROM sessions WHERE admin_id = ?`).run(target.id)
  res.json({ ok: true })
})

router.get('/invites', requireOwner, (req, res) => {
  res.json(
    db
      .prepare(
        `SELECT code, created_at, expires_at, used_at FROM invites
         WHERE used_at IS NULL AND expires_at >= datetime('now') ORDER BY created_at DESC`,
      )
      .all(),
  )
})

router.post('/invites', requireOwner, (req, res) => {
  const code = crypto.randomBytes(16).toString('hex')
  db.prepare(
    `INSERT INTO invites (code, role, created_by, expires_at) VALUES (?, 'admin', ?, datetime('now', '+7 days'))`,
  ).run(code, req.admin.id)
  res.json({ ok: true, code })
})

router.delete('/invites/:code', requireOwner, (req, res) => {
  db.prepare(`DELETE FROM invites WHERE code = ? AND used_at IS NULL`).run(req.params.code)
  res.json({ ok: true })
})

// Invited family member creates their own account (invite code is the authorization).
router.post('/join', (req, res) => {
  const { code, name, password } = req.body || {}
  const invite =
    typeof code === 'string'
      ? db
          .prepare(`SELECT * FROM invites WHERE code = ? AND used_at IS NULL AND expires_at >= datetime('now')`)
          .get(code)
      : null
  if (!invite) return res.status(403).json({ error: 'bad_invite' })
  if (!validName(name)) return res.status(400).json({ error: 'bad_name' })
  if (!validPassword(password)) return res.status(400).json({ error: 'password_too_short' })
  const exists = db.prepare(`SELECT 1 FROM admins WHERE name = ? COLLATE NOCASE`).get(name.trim())
  if (exists) return res.status(409).json({ error: 'name_taken' })
  const info = db
    .prepare(`INSERT INTO admins (name, role, password_hash) VALUES (?, ?, ?)`)
    .run(name.trim(), invite.role, hashPassword(password))
  db.prepare(`UPDATE invites SET used_by = ?, used_at = datetime('now') WHERE code = ?`).run(
    info.lastInsertRowid,
    invite.code,
  )
  const token = createSession(info.lastInsertRowid)
  setSessionCookie(req, res, token)
  res.json({ ok: true })
})

export default router
