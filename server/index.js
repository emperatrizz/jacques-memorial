import express from 'express'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import { existsSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { getSiteContent, listUpdates } from './db.js'
import adminRouter from './admin.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const DIST = path.join(ROOT, 'dist')

const app = express()
app.set('trust proxy', 1) // Railway runs behind a proxy; needed for secure cookies + client IPs
app.use(compression())
app.use(express.json({ limit: '200kb' }))
app.use(cookieParser())
app.disable('x-powered-by')

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
