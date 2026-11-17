// Public (no-login) submission endpoints for photos, videos, and written memories.
import { Router } from 'express'
import crypto from 'crypto'
import { db } from './db.js'
import { createUploadUrl, createDownloadUrl, objectSize } from './storage.js'

const router = Router()

export const ALLOWED_TYPES = {
  'image/jpeg': { ext: 'jpg', kind: 'image', maxBytes: 50 * 1024 * 1024 },
  'image/png': { ext: 'png', kind: 'image', maxBytes: 50 * 1024 * 1024 },
  'image/webp': { ext: 'webp', kind: 'image', maxBytes: 50 * 1024 * 1024 },
  'image/gif': { ext: 'gif', kind: 'image', maxBytes: 50 * 1024 * 1024 },
  'image/heic': { ext: 'heic', kind: 'image', maxBytes: 50 * 1024 * 1024 },
  'image/heif': { ext: 'heif', kind: 'image', maxBytes: 50 * 1024 * 1024 },
  'video/mp4': { ext: 'mp4', kind: 'video', maxBytes: 1024 * 1024 * 1024 },
  'video/quicktime': { ext: 'mov', kind: 'video', maxBytes: 1024 * 1024 * 1024 },
  'video/webm': { ext: 'webm', kind: 'video', maxBytes: 1024 * 1024 * 1024 },
  'video/x-m4v': { ext: 'm4v', kind: 'video', maxBytes: 1024 * 1024 * 1024 },
  'video/3gpp': { ext: '3gp', kind: 'video', maxBytes: 1024 * 1024 * 1024 },
}
const MAX_FILES = 10
const MAX_MESSAGE = 5000
const MAX_NAME = 100

// ——— Submission rate limiting (in-memory, per IP) ———
const WINDOW_MS = 60 * 60 * 1000
const MAX_PER_WINDOW = 10
const recent = new Map()
function limited(ip) {
  const list = (recent.get(ip) || []).filter((t) => Date.now() - t < WINDOW_MS)
  recent.set(ip, list)
  if (list.length >= MAX_PER_WINDOW) return true
  list.push(Date.now())
  return false
}

function origin(req) {
  return `${req.protocol}://${req.get('host')}`
}

// Step 1: declare the submission; receive one upload URL per file.
router.post('/start', async (req, res) => {
  const { contributor, message, visibility, files, website } = req.body || {}
  // Honeypot: real visitors never fill the invisible "website" field.
  if (website) return res.status(400).json({ error: 'bad_request' })
  if (limited(req.ip || 'unknown')) return res.status(429).json({ error: 'too_many_submissions' })
  if (visibility !== 'public' && visibility !== 'family') {
    return res.status(400).json({ error: 'bad_request' })
  }
  const list = Array.isArray(files) ? files : []
  const text = typeof message === 'string' ? message.trim().slice(0, MAX_MESSAGE) : ''
  if (list.length === 0 && !text) return res.status(400).json({ error: 'empty_submission' })
  if (list.length > MAX_FILES) return res.status(400).json({ error: 'too_many_files' })
  for (const f of list) {
    const spec = ALLOWED_TYPES[f?.type]
    if (!spec) return res.status(400).json({ error: 'unsupported_type' })
    if (typeof f.size !== 'number' || f.size <= 0 || f.size > spec.maxBytes) {
      return res.status(400).json({ error: 'file_too_large' })
    }
  }

  const id = crypto.randomUUID()
  const uploadToken = crypto.randomBytes(24).toString('hex')
  db.prepare(
    `INSERT INTO submissions (id, upload_token, contributor, message, visibility, status)
     VALUES (?, ?, ?, ?, ?, ?)`,
  ).run(
    id,
    uploadToken,
    typeof contributor === 'string' && contributor.trim() ? contributor.trim().slice(0, MAX_NAME) : null,
    text || null,
    visibility,
    list.length === 0 ? 'pending' : 'uploading',
  )

  const insFile = db.prepare(
    `INSERT INTO submission_files (id, submission_id, storage_key, original_name, content_type, size)
     VALUES (?, ?, ?, ?, ?, ?)`,
  )
  const uploads = []
  for (const f of list) {
    const spec = ALLOWED_TYPES[f.type]
    const fileId = crypto.randomUUID()
    const key = `submissions/${id}/${fileId}.${spec.ext}`
    const originalName = String(f.name || `file.${spec.ext}`).slice(0, 200)
    insFile.run(fileId, id, key, originalName, f.type, null)
    uploads.push({
      fileId,
      url: await createUploadUrl(key, f.type, origin(req)),
      headers: { 'Content-Type': f.type },
    })
  }
  res.json({ id, uploadToken, uploads })
})

// Step 2 (after the browser PUT-uploads each file): mark the submission complete.
router.post('/:id/complete', async (req, res) => {
  const { uploadToken } = req.body || {}
  const sub = db.prepare(`SELECT * FROM submissions WHERE id = ?`).get(req.params.id)
  if (!sub || sub.upload_token !== uploadToken) return res.status(403).json({ error: 'bad_request' })
  if (sub.status !== 'uploading') return res.json({ ok: true })
  const files = db.prepare(`SELECT * FROM submission_files WHERE submission_id = ?`).all(sub.id)
  const sizes = []
  for (const f of files) {
    const size = await objectSize(f.storage_key)
    if (size === null) return res.status(400).json({ error: 'upload_incomplete' })
    sizes.push([size, f.id])
  }
  const tx = db.transaction(() => {
    const upd = db.prepare(`UPDATE submission_files SET size = ? WHERE id = ?`)
    for (const [size, fid] of sizes) upd.run(size, fid)
    db.prepare(`UPDATE submissions SET status = 'pending' WHERE id = ?`).run(sub.id)
  })
  tx()
  res.json({ ok: true })
})

export default router

// Approved PUBLIC submissions only — family-only items never leave the admin API.
export async function publicGallery(req, res) {
  try {
    const subs = db
      .prepare(
        `SELECT id, contributor, message, created_at FROM submissions
         WHERE status = 'approved' AND visibility = 'public'
         ORDER BY created_at DESC LIMIT 200`,
      )
      .all()
    const fileStmt = db.prepare(
      `SELECT id, storage_key, content_type, original_name FROM submission_files WHERE submission_id = ?`,
    )
    const out = []
    for (const s of subs) {
      const files = []
      for (const f of fileStmt.all(s.id)) {
        files.push({
          id: f.id,
          kind: ALLOWED_TYPES[f.content_type]?.kind || 'image',
          contentType: f.content_type,
          url: await createDownloadUrl(f.storage_key, { contentType: f.content_type, origin: origin(req) }),
        })
      }
      out.push({
        id: s.id,
        contributor: s.contributor || undefined,
        message: s.message || undefined,
        date: s.created_at.slice(0, 10),
        files,
      })
    }
    res.json(out)
  } catch (err) {
    console.error('gallery failed:', err.message)
    res.status(500).json({ error: 'gallery_unavailable' })
  }
}
