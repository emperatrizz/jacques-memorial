// Storage abstraction: Cloudflare R2 (production) or local disk (development).
// R2 is used when R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY are set.
import { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import crypto from 'crypto'
import { createReadStream, createWriteStream, existsSync, mkdirSync, statSync, unlinkSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const DATA_DIR = process.env.DATA_DIR || path.join(ROOT, 'data')

const R2_READY = Boolean(
  process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY,
)
const BUCKET = process.env.R2_BUCKET || 'jacques-memorial-media'

export const storageMode = R2_READY ? 'r2' : 'local'

// Accepts either the bare account id or a pasted endpoint URL like
// "https://<id>.r2.cloudflarestorage.com" (with or without protocol/path).
function r2Endpoint() {
  const raw = (process.env.R2_ACCOUNT_ID || '').trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '')
  const host = raw.includes('r2.cloudflarestorage.com') ? raw : `${raw}.r2.cloudflarestorage.com`
  return `https://${host}`
}

let s3 = null
if (R2_READY) {
  s3 = new S3Client({
    region: 'auto',
    endpoint: r2Endpoint(),
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID.trim(),
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY.trim(),
    },
  })
}

// ——— Local driver internals (development only) ———
const MEDIA_DIR = path.join(DATA_DIR, 'media')
const localSecret = crypto.randomBytes(32)

function localPath(key) {
  const safe = path.normalize(key).replace(/^(\.\.(\/|\\|$))+/, '')
  const full = path.join(MEDIA_DIR, safe)
  if (!full.startsWith(MEDIA_DIR)) throw new Error('bad key')
  return full
}

function localSign(action, key, expires) {
  return crypto.createHmac('sha256', localSecret).update(`${action}:${key}:${expires}`).digest('hex')
}

export function localVerify(action, key, expires, sig) {
  if (Number(expires) < Date.now()) return false
  const expect = localSign(action, key, expires)
  return sig.length === expect.length && crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expect))
}

export function localWriteStream(key) {
  const p = localPath(key)
  mkdirSync(path.dirname(p), { recursive: true })
  return createWriteStream(p)
}

export function localReadStream(key) {
  return createReadStream(localPath(key))
}

// ——— Shared API ———

/** URL a visitor's browser PUTs the file to, valid 1 hour. */
export async function createUploadUrl(key, contentType, origin) {
  if (s3) {
    return getSignedUrl(s3, new PutObjectCommand({ Bucket: BUCKET, Key: key, ContentType: contentType }), {
      expiresIn: 3600,
    })
  }
  const expires = Date.now() + 3600_000
  return `${origin}/api/local-media/${encodeURIComponent(key)}?expires=${expires}&sig=${localSign('put', key, expires)}`
}

/** Short-lived view/download URL (15 minutes). */
export async function createDownloadUrl(key, { filename, contentType, origin } = {}) {
  if (s3) {
    return getSignedUrl(
      s3,
      new GetObjectCommand({
        Bucket: BUCKET,
        Key: key,
        ResponseContentType: contentType,
        ResponseContentDisposition: filename
          ? `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`
          : undefined,
      }),
      { expiresIn: 900 },
    )
  }
  const expires = Date.now() + 900_000
  const dl = filename ? `&dl=${encodeURIComponent(filename)}` : ''
  return `${origin}/api/local-media/${encodeURIComponent(key)}?expires=${expires}&sig=${localSign('get', key, expires)}${dl}`
}

/** Confirms an uploaded object exists; returns its size or null. */
export async function objectSize(key) {
  if (s3) {
    try {
      const head = await s3.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }))
      return head.ContentLength ?? 0
    } catch {
      return null
    }
  }
  try {
    return statSync(localPath(key)).size
  } catch {
    return null
  }
}

/** Readable stream of the object (for ZIP archives). */
export async function objectStream(key) {
  if (s3) {
    const res = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }))
    return res.Body
  }
  return localReadStream(key)
}

export async function deleteObject(key) {
  if (s3) {
    try {
      await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }))
    } catch (err) {
      console.error('deleteObject failed:', key, err.message)
    }
    return
  }
  try {
    if (existsSync(localPath(key))) unlinkSync(localPath(key))
  } catch (err) {
    console.error('deleteObject failed:', key, err.message)
  }
}
