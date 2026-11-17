import express from 'express'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import { existsSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { getSiteContent, listUpdates } from './db.js'
import adminRouter from './admin.js'
import submissionsRouter, { publicGallery } from './submissions.js'
import { storageMode, localVerify, localWriteStream, localReadStream } from './storage.js'
import { db } from './db.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const DIST = path.join(ROOT, 'dist')

const app = express()
app.set('trust proxy', 1) // Railway runs behind a proxy; needed for secure cookies + client IPs
app.use(compression())
app.use(express.json({ limit: '200kb' }))
app.use(cookieParser())
app.disable('x-powered-by')

// Canonical domain: www redirects to the apex
app.use((req, res, next) => {
  if (req.hostname === 'www.jacquesprades.com') {
    return res.redirect(301, `https://jacquesprades.com${req.originalUrl}`)
  }
  next()
})

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'jacques-memorial' })
})

app.get('/api/updates', (req, res) => {
  try {
    res.json(listUpdates())
  } catch (err) {
    console.error('Failed to read updates:', err.message)
    res.status(500).json({ error: 'content_unavailable' })
  }
})

app.get('/api/content', (req, res) => {
  try {
    res.json(getSiteContent())
  } catch (err) {
    console.error('Failed to read site content:', err.message)
    res.status(500).json({ error: 'content_unavailable' })
  }
})

app.use('/api/admin', adminRouter)
app.use('/api/submissions', submissionsRouter)
app.get('/api/gallery', publicGallery)

// Local-disk media endpoints — used only in development (no R2 credentials).
if (storageMode === 'local') {
  console.log('Storage: LOCAL DISK (development). Set R2_* env vars for Cloudflare R2.')
  app.put('/api/local-media/:key', (req, res) => {
    const key = decodeURIComponent(req.params.key)
    const { expires, sig } = req.query
    if (!sig || !localVerify('put', key, expires, String(sig))) {
      return res.status(403).json({ error: 'forbidden' })
    }
    const out = localWriteStream(key)
    req.pipe(out)
    out.on('finish', () => res.json({ ok: true }))
    out.on('error', () => res.status(500).json({ error: 'write_failed' }))
  })
  app.get('/api/local-media/:key', (req, res) => {
    const key = decodeURIComponent(req.params.key)
    const { expires, sig, dl } = req.query
    if (!sig || !localVerify('get', key, expires, String(sig))) {
      return res.status(403).json({ error: 'forbidden' })
    }
    const row = db.prepare(`SELECT content_type FROM submission_files WHERE storage_key = ?`).get(key)
    if (row) res.setHeader('Content-Type', row.content_type)
    if (dl) res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(String(dl))}`)
    const stream = localReadStream(key)
    stream.on('error', () => res.status(404).end())
    stream.pipe(res)
  })
} else {
  console.log('Storage: Cloudflare R2, bucket', process.env.R2_BUCKET || 'jacques-memorial-media')
}

// Static frontend (built by `npm run build`)
if (existsSync(DIST)) {
  app.use(express.static(DIST, { maxAge: '1h', index: false }))
  app.get('*', (req, res) => {
    res.sendFile(path.join(DIST, 'index.html'))
  })
} else {
  app.get('*', (req, res) => {
    res.status(503).send('Site is building. Please refresh in a moment.')
  })
}

const PORT = process.env.PORT || 4300
app.listen(PORT, '0.0.0.0', () => {
  console.log(`jacques-memorial listening on 0.0.0.0:${PORT}`)
})
