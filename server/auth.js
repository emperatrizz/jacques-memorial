import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { db } from './db.js'

const SESSION_DAYS = 30
export const COOKIE_NAME = 'memorial_admin'

export function hashPassword(password) {
  return bcrypt.hashSync(password, 12)
}

export function verifyPassword(password, hash) {
  return bcrypt.compareSync(password, hash)
}

export function createSession(adminId) {
  const token = crypto.randomBytes(32).toString('hex')
  db.prepare(
    `INSERT INTO sessions (token, admin_id, expires_at) VALUES (?, ?, datetime('now', '+${SESSION_DAYS} days'))`,
  ).run(token, adminId)
  return token
}

export function destroySession(token) {
  if (token) db.prepare(`DELETE FROM sessions WHERE token = ?`).run(token)
}

export function adminFromRequest(req) {
  // Automation key (ADMIN_API_TOKEN env var): admin-level API access for the
  // family's trusted tooling, explicitly authorized by the site owner.
  // No account management and no password endpoints.
  const bearer = req.get('authorization')
  const apiToken = process.env.ADMIN_API_TOKEN
  if (bearer?.startsWith('Bearer ') && apiToken && apiToken.length >= 32) {
    const given = Buffer.from(bearer.slice(7))
    const expect = Buffer.from(apiToken)
    if (given.length === expect.length && crypto.timingSafeEqual(given, expect)) {
      return { id: 0, name: 'Automation', role: 'admin', active: 1, automation: true }
    }
  }
  const token = req.cookies?.[COOKIE_NAME]
  if (!token) return null
  // Opportunistic cleanup of expired sessions
  db.prepare(`DELETE FROM sessions WHERE expires_at < datetime('now')`).run()
  const row = db
    .prepare(
      `SELECT a.id, a.name, a.role, a.active FROM sessions s
       JOIN admins a ON a.id = s.admin_id
       WHERE s.token = ? AND s.expires_at >= datetime('now')`,
    )
    .get(token)
  if (!row || !row.active) return null
  return row
}

export function setSessionCookie(req, res, token) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: req.secure,
    maxAge: SESSION_DAYS * 24 * 60 * 60 * 1000,
    path: '/',
  })
}

export function requireAdmin(req, res, next) {
  const admin = adminFromRequest(req)
  if (!admin) return res.status(401).json({ error: 'unauthorized' })
  req.admin = admin
  next()
}

export function requireOwner(req, res, next) {
  const admin = adminFromRequest(req)
  if (!admin) return res.status(401).json({ error: 'unauthorized' })
  if (admin.role !== 'owner') return res.status(403).json({ error: 'owner_only' })
  req.admin = admin
  next()
}

// ——— Login rate limiting (in-memory, per IP) ———
const WINDOW_MS = 15 * 60 * 1000
const MAX_FAILURES = 8
const failures = new Map()

function prune(ip) {
  const list = (failures.get(ip) || []).filter((t) => Date.now() - t < WINDOW_MS)
  failures.set(ip, list)
  return list
}

export function isRateLimited(ip) {
  return prune(ip).length >= MAX_FAILURES
}

export function recordFailure(ip) {
  prune(ip).push(Date.now())
}

export function clearFailures(ip) {
  failures.delete(ip)
}
