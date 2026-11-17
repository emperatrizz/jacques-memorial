import { useRef, useState } from 'react'
import { pick, useLang } from '../i18n'
import { ui } from '../ui'

const MAX_FILES = 10
const MAX_IMAGE = 50 * 1024 * 1024
const MAX_VIDEO = 1024 * 1024 * 1024
const ALLOWED = new Set([
  'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif',
  'video/mp4', 'video/quicktime', 'video/webm', 'video/x-m4v', 'video/3gpp',
])

function xhrPut(url: string, file: File, contentType: string, onProgress: (sent: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', url)
    xhr.setRequestHeader('Content-Type', contentType)
    xhr.upload.onprogress = (e) => onProgress(e.loaded)
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error('upload_failed')))
    xhr.onerror = () => reject(new Error('upload_failed'))
    xhr.send(file)
  })
}

export default function SubmissionForm({ mode }: { mode: 'media' | 'text' }) {
  const { lang } = useLang()
  const [files, setFiles] = useState<File[]>([])
  const [contributor, setContributor] = useState('')
  const [message, setMessage] = useState('')
  const [visibility, setVisibility] = useState<'public' | 'family'>('public')
  const [website, setWebsite] = useState('') // honeypot — humans never see or fill this
  const [state, setState] = useState<'idle' | 'uploading' | 'done'>('idle')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const fileInput = useRef<HTMLInputElement>(null)

  function pickFiles(list: FileList | null) {
    if (!list) return
    setError('')
    const next = [...files]
    for (const f of Array.from(list)) {
      if (!ALLOWED.has(f.type)) {
        setError(pick(ui.unsupportedType, lang))
        return
      }
      const max = f.type.startsWith('video/') ? MAX_VIDEO : MAX_IMAGE
      if (f.size > max) {
        setError(pick(ui.fileTooLarge, lang))
        return
      }
      next.push(f)
    }
    if (next.length > MAX_FILES) {
      setError(pick(ui.tooManyFiles, lang))
      return
    }
    setFiles(next)
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (mode === 'text' && !message.trim()) {
      setError(pick(ui.needSomething, lang))
      return
    }
    if (mode === 'media' && files.length === 0 && !message.trim()) {
      setError(pick(ui.needSomething, lang))
      return
    }
    setState('uploading')
    setProgress(0)
    try {
      const start = await fetch('/api/submissions/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contributor: contributor.trim() || undefined,
          message: message.trim() || undefined,
          visibility,
          website,
          files: files.map((f) => ({ name: f.name, type: f.type, size: f.size })),
        }),
      })
      if (!start.ok) {
        const err = await start.json().catch(() => ({ error: '' }))
        throw new Error(err.error || 'request_failed')
      }
      const { id, uploadToken, uploads } = await start.json()

      const totalBytes = files.reduce((n, f) => n + f.size, 0) || 1
      let doneBytes = 0
      for (let i = 0; i < files.length; i++) {
        const f = files[i]
        const u = uploads[i]
        await xhrPut(u.url, f, f.type, (sent) => {
          setProgress(Math.min(99, Math.round(((doneBytes + sent) / totalBytes) * 100)))
        })
        doneBytes += f.size
      }
      if (files.length > 0) {
        const done = await fetch(`/api/submissions/${id}/complete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uploadToken }),
        })
        if (!done.ok) throw new Error('upload_failed')
      }
      setState('done')
    } catch (err) {
      const key = err instanceof Error ? err.message : ''
      setError(
        key === 'too_many_submissions'
          ? pick(ui.tooManySubmissions, lang)
          : key === 'file_too_large'
            ? pick(ui.fileTooLarge, lang)
            : key === 'unsupported_type'
              ? pick(ui.unsupportedType, lang)
              : pick(ui.submitError, lang),
      )
      setState('idle')
    }
  }

  if (state === 'done') {
    return (
      <div className="card coming-soon">
        <p className="coming-soon-title">{pick(ui.thanksTitle, lang)}</p>
        <p className="card-value">{pick(ui.thanksBody, lang)}</p>
        <button
          className="button"
          onClick={() => {
            setFiles([])
            setMessage('')
            setState('idle')
            setProgress(0)
          }}
        >
          {pick(ui.shareMore, lang)}
        </button>
      </div>
    )
  }

  return (
    <form className="card" onSubmit={submit}>
      {mode === 'media' && (
        <div className="field">
          <input
            ref={fileInput}
            type="file"
            accept="image/*,video/*"
            multiple
            hidden
            onChange={(e) => {
              pickFiles(e.target.files)
              e.target.value = ''
            }}
          />
          <button type="button" className="button ghost file-button" onClick={() => fileInput.current?.click()}>
            {pick(ui.chooseFiles, lang)}
          </button>
          {files.length > 0 && (
            <ul className="file-list">
              {files.map((f, i) => (
                <li key={i} className="file-item">
                  <span className="file-name">{f.name}</span>
                  <button
                    type="button"
                    className="file-remove"
                    aria-label="remove"
                    onClick={() => setFiles((list) => list.filter((_, j) => j !== i))}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="field">
        <span className="field-label">{pick(mode === 'text' ? ui.memoryLabel : ui.messageLabel, lang)}</span>
        <textarea
          className="input"
          rows={mode === 'text' ? 6 : 3}
          maxLength={5000}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>

      <div className="field">
        <span className="field-label">{pick(ui.yourName, lang)}</span>
        <input className="input" maxLength={100} value={contributor} onChange={(e) => setContributor(e.target.value)} />
      </div>

      {/* Honeypot: hidden from real visitors, bots fill it */}
      <input
        type="text"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: 'absolute', left: '-9999px', height: 0, width: 0, opacity: 0 }}
      />

      <div className="field">
        <span className="field-label">{pick(ui.visibilityLabel, lang)}</span>
        <label className={`choice ${visibility === 'public' ? 'selected' : ''}`}>
          <input
            type="radio"
            name="visibility"
            checked={visibility === 'public'}
            onChange={() => setVisibility('public')}
          />
          <span>
            <span className="choice-title">{pick(ui.visPublicTitle, lang)}</span>
            <span className="choice-desc">{pick(ui.visPublicDesc, lang)}</span>
          </span>
        </label>
        <label className={`choice ${visibility === 'family' ? 'selected' : ''}`}>
          <input
            type="radio"
            name="visibility"
            checked={visibility === 'family'}
            onChange={() => setVisibility('family')}
          />
          <span>
            <span className="choice-title">{pick(ui.visFamilyTitle, lang)}</span>
            <span className="choice-desc">{pick(ui.visFamilyDesc, lang)}</span>
          </span>
        </label>
      </div>

      {error && <p className="error-note">{error}</p>}

      {state === 'uploading' ? (
        <div className="progress-wrap">
          <div className="progress-bar" style={{ width: `${progress}%` }} />
          <span className="progress-label">
            {pick(ui.uploadingLabel, lang)} {files.length > 0 ? `${progress}%` : ''}
          </span>
        </div>
      ) : (
        <button className="button save-button" type="submit">
          {pick(ui.send, lang)}
        </button>
      )}
    </form>
  )
}
