import express from 'express'
import compression from 'compression'
import { readFileSync, existsSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const DIST = path.join(ROOT, 'dist')
const CONTENT = path.join(ROOT, 'content')

const app = express()
app.use(compression())
app.disable('x-powered-by')

function readJson(file) {
  return JSON.parse(readFileSync(path.join(CONTENT, file), 'utf8'))
}

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'jacques-memorial' })
})

app.get('/api/updates', (req, res) => {
  try {
    res.json(readJson('updates.json'))
  } catch (err) {
    console.error('Failed to read updates.json:', err.message)
    res.status(500).json({ error: 'content_unavailable' })
  }
})

app.get('/api/content', (req, res) => {
  try {
    res.json(readJson('site.json'))
  } catch (err) {
    console.error('Failed to read site.json:', err.message)
    res.status(500).json({ error: 'content_unavailable' })
  }
})

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
