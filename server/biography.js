// Life & Legacy: editable trilingual biography with photos and press links.
import { Router } from 'express'
import crypto from 'crypto'
import { db } from './db.js'
import { requireAdmin } from './auth.js'
import { createUploadUrl, objectStream } from './storage.js'

const PH = (th, en, fr) => ({ th, en, fr })

export const DEFAULT_BIO = {
  sections: [
    {
      id: 'early-life',
      title: PH('วัยเยาว์', 'Early life', 'Jeunesse'),
      body: PH(
        '[ตัวอย่าง] เรื่องราววัยเยาว์ของคุณแจ็คจะอยู่ที่นี่ ครอบครัวกำลังเรียบเรียงเนื้อหา',
        '[PLACEHOLDER] The story of Jacques’s early life will appear here. The family is preparing the text.',
        '[EXEMPLE] L’histoire de la jeunesse de Jacques apparaîtra ici. La famille prépare le texte.',
      ),
    },
    {
      id: 'journey-thailand',
      title: PH('เส้นทางสู่ประเทศไทย', 'The journey to Thailand', 'Le chemin vers la Thaïlande'),
      body: PH(
        '[ตัวอย่าง] เรื่องราวการเดินทางมาประเทศไทย',
        '[PLACEHOLDER] How Jacques came to Thailand, and why it became home.',
        '[EXEMPLE] Comment Jacques est arrivé en Thaïlande, et pourquoi elle est devenue sa maison.',
      ),
    },
    {
      id: 'jewellery',
      title: PH('ชีวิตช่างอัญมณี', 'A life in jewellery', 'Une vie dans la joaillerie'),
      body: PH(
        '[ตัวอย่าง] เรื่องราวอาชีพช่างอัญมณีและผลงาน',
        '[PLACEHOLDER] Jacques’s jewellery career and craft.',
        '[EXEMPLE] La carrière et l’art joaillier de Jacques.',
      ),
    },
    {
      id: 'achievements',
      title: PH('ผลงานและความสำเร็จ', 'Professional achievements', 'Réalisations professionnelles'),
      body: PH(
        '[ตัวอย่าง] ความสำเร็จในวิชาชีพ',
        '[PLACEHOLDER] Professional milestones and recognition.',
        '[EXEMPLE] Étapes professionnelles et reconnaissance.',
      ),
    },
    {
      id: 'legacy',
      title: PH('มรดกแห่งความทรงจำ', 'Personal legacy', 'Héritage personnel'),
      body: PH(
        '[ตัวอย่าง] มรดกและสิ่งที่คุณแจ็คทิ้งไว้ให้ครอบครัวและเพื่อน',
        '[PLACEHOLDER] What Jacques leaves behind, for his family and friends.',
        '[EXEMPLE] Ce que Jacques laisse derrière lui, à sa famille et à ses amis.',
      ),
    },
  ],
  photos: [],
  articles: [
    {
      id: 'sample-article',
      title: '[PLACEHOLDER] Article title — publication name',
      description: PH(
        '[ตัวอย่าง] คำอธิบายบทความหรือสื่อที่กล่าวถึงคุณแจ็ค',
        '[PLACEHOLDER] A short description of an article or publication about Jacques.',
        '[EXEMPLE] Une courte description d’un article ou d’une publication sur Jacques.',
      ),
      url: 'https://example.com',
    },
  ],
}

function getBio() {
  const row = db.prepare(`SELECT json FROM content WHERE key = 'biography'`).get()
  return row ? JSON.parse(row.json) : DEFAULT_BIO
}

const PHOTO_KEY = /^biography\/[a-f0-9-]+\.(jpg|jpeg|png|webp)$/
const PHOTO_TYPES = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' }

// ——— Public ———
export const bioPublicRouter = Router()

bioPublicRouter.get('/', (req, res) => {
  res.json(getBio())
})

// Streams biography photos (admin-uploaded, meant to be public) with caching.
bioPublicRouter.get('/photo', async (req, res) => {
  const key = String(req.query.key || '')
  if (!PHOTO_KEY.test(key)) return res.status(400).json({ error: 'bad_key' })
  try {
    const stream = await objectStream(key)
    res.setHeader('Content-Type', PHOTO_TYPES[key.split('.').pop()])
    res.setHeader('Cache-Control', 'public, max-age=3600')
    stream.on('error', () => res.destroy())
    stream.pipe(res)
  } catch {
    res.status(404).json({ error: 'not_found' })
  }
})

// ——— Admin ———
export const bioAdminRouter = Router()
bioAdminRouter.use(requireAdmin)

function validL10n(v) {
  return v && typeof v === 'object' && ['th', 'en', 'fr'].every((k) => typeof (v[k] ?? '') === 'string')
}

bioAdminRouter.put('/', (req, res) => {
  const b = req.body
  const ok =
    b &&
    Array.isArray(b.sections) &&
    b.sections.length <= 30 &&
    b.sections.every(
      (s) =>
        s.id &&
        validL10n(s.title) &&
        validL10n(s.body) &&
        (!s.photos ||
          (Array.isArray(s.photos) &&
            s.photos.length <= 20 &&
            s.photos.every(
              (p) => typeof p.key === 'string' && PHOTO_KEY.test(p.key) && (!p.caption || validL10n(p.caption)),
            ))),
    ) &&
    Array.isArray(b.photos) &&
    b.photos.length <= 40 &&
    b.photos.every((p) => typeof p.key === 'string' && PHOTO_KEY.test(p.key) && (!p.caption || validL10n(p.caption))) &&
    Array.isArray(b.articles) &&
    b.articles.length <= 50 &&
    b.articles.every(
      (a) =>
        a.id &&
        typeof a.title === 'string' &&
        validL10n(a.description) &&
        typeof a.url === 'string' &&
        /^https?:\/\//.test(a.url),
    )
  if (!ok) return res.status(400).json({ error: 'bad_biography' })
  db.prepare(
    `INSERT INTO content (key, json, updated_at) VALUES ('biography', ?, datetime('now'))
     ON CONFLICT(key) DO UPDATE SET json = excluded.json, updated_at = excluded.updated_at`,
  ).run(JSON.stringify({ sections: b.sections, photos: b.photos, articles: b.articles }))
  res.json({ ok: true })
})

bioAdminRouter.post('/photo-upload', async (req, res) => {
  const { type, size } = req.body || {}
  const ext = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }[type]
  if (!ext) return res.status(400).json({ error: 'unsupported_type' })
  if (typeof size !== 'number' || size <= 0 || size > 25 * 1024 * 1024) {
    return res.status(400).json({ error: 'file_too_large' })
  }
  const key = `biography/${crypto.randomUUID()}.${ext}`
  const origin = `${req.protocol}://${req.get('host')}`
  res.json({ key, url: await createUploadUrl(key, type, origin), headers: { 'Content-Type': type } })
})
