import Database from 'better-sqlite3'
import { mkdirSync, readFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
// On Railway a persistent volume is mounted and DATA_DIR points at it.
const DATA_DIR = process.env.DATA_DIR || path.join(ROOT, 'data')
mkdirSync(DATA_DIR, { recursive: true })

export const db = new Database(path.join(DATA_DIR, 'memorial.db'))
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

db.exec(`
CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE COLLATE NOCASE,
  role TEXT NOT NULL CHECK(role IN ('owner','admin')),
  password_hash TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  admin_id INTEGER NOT NULL REFERENCES admins(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS invites (
  code TEXT PRIMARY KEY,
  role TEXT NOT NULL DEFAULT 'admin',
  created_by INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL,
  used_by INTEGER,
  used_at TEXT
);
CREATE TABLE IF NOT EXISTS content (
  key TEXT PRIMARY KEY,
  json TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS updates (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`)

// ——— One-time seed from the repo's content files ———
function seedFromFiles() {
  const hasContent = db.prepare(`SELECT 1 FROM content WHERE key = 'site'`).get()
  if (!hasContent) {
    try {
      const site = readFileSync(path.join(ROOT, 'content', 'site.json'), 'utf8')
      JSON.parse(site) // validate before storing
      db.prepare(`INSERT INTO content (key, json) VALUES ('site', ?)`).run(site)
      console.log('Seeded site content from content/site.json')
    } catch (err) {
      console.error('Could not seed site content:', err.message)
    }
  }
  const hasUpdates = db.prepare(`SELECT 1 FROM updates LIMIT 1`).get()
  if (!hasUpdates) {
    try {
      const rows = JSON.parse(readFileSync(path.join(ROOT, 'content', 'updates.json'), 'utf8'))
      const ins = db.prepare(
        `INSERT INTO updates (id, date, title, body, link) VALUES (?, ?, ?, ?, ?)`,
      )
      for (const u of rows) {
        ins.run(u.id, u.date, JSON.stringify(u.title), u.body ? JSON.stringify(u.body) : null, u.link ?? null)
      }
      console.log(`Seeded ${rows.length} updates from content/updates.json`)
    } catch (err) {
      console.error('Could not seed updates:', err.message)
    }
  }
}
seedFromFiles()

// ——— Public reads ———
export function getSiteContent() {
  const row = db.prepare(`SELECT json FROM content WHERE key = 'site'`).get()
  return row ? JSON.parse(row.json) : null
}

export function listUpdates() {
  return db
    .prepare(`SELECT * FROM updates ORDER BY date DESC, created_at DESC`)
    .all()
    .map((r) => ({
      id: r.id,
      date: r.date,
      title: JSON.parse(r.title),
      body: r.body ? JSON.parse(r.body) : undefined,
      link: r.link ?? undefined,
    }))
}
