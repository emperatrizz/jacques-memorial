import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AdminShell from './AdminShell'
import { api, errorText } from './api'
import type { EulogyParagraph } from '../eulogy/EulogyReader'

type Para = EulogyParagraph & { position: number }
type AdminEulogy = {
  published: boolean
  revealAll: boolean
  paragraphs: Para[]
  sessions: { live: { index: number; active: boolean }; rehearsal: { index: number; active: boolean } }
}

const EMPTY = { th: '', en: '', fr: '' }

export default function EulogyEditor() {
  const [data, setData] = useState<AdminEulogy | null>(null)
  const [draft, setDraft] = useState<{ id?: string; th: string; en: string; fr: string } | null>(null)
  const [msg, setMsg] = useState('')
  const [confirmDelete, setConfirmDelete] = useState('')
  const [confirmResetLive, setConfirmResetLive] = useState(false)

  const load = () => api<AdminEulogy>('/api/admin/eulogy').then(setData)
  useEffect(() => {
    load()
  }, [])

  async function save() {
    if (!draft) return
    setMsg('')
    try {
      if (draft.id) {
        await api(`/api/admin/eulogy/paragraphs/${draft.id}`, { method: 'PUT', body: draft })
      } else {
        await api('/api/admin/eulogy/paragraphs', { method: 'POST', body: draft })
      }
      setDraft(null)
      load()
    } catch (err) {
      setMsg(errorText(err))
    }
  }

  async function move(id: string, dir: 'up' | 'down') {
    await api(`/api/admin/eulogy/paragraphs/${id}/move`, { method: 'POST', body: { dir } })
    load()
  }

  async function remove(id: string) {
    if (confirmDelete !== id) {
      setConfirmDelete(id)
      return
    }
    setConfirmDelete('')
    await api(`/api/admin/eulogy/paragraphs/${id}`, { method: 'DELETE' })
    load()
  }

  async function setPublished(published: boolean) {
    await api('/api/admin/eulogy/publish', { method: 'POST', body: { published } })
    load()
  }

  if (!data) {
    return (
      <AdminShell title="Eulogy">
        <p className="section-note">Loading…</p>
      </AdminShell>
    )
  }

  return (
    <AdminShell title="Eulogy">
      <div className="card">
        <div className="submission-head">
          <h2 className="card-label" style={{ margin: 0 }}>
            Status
          </h2>
          <span className={`pending-chip ${data.published ? '' : 'family-chip'}`}>
            {data.published ? 'Published — visible to visitors' : 'Draft — private'}
          </span>
        </div>
        <p className="section-note">
          {data.published
            ? data.revealAll
              ? 'The whole text is visible to visitors.'
              : 'Visitors see paragraphs one by one, only as they are read aloud. Nobody can read ahead.'
            : 'The text below is private. Publish only when the speech is ready for visitors.'}
        </p>
        <div className="row-actions">
          <button className="button ghost" onClick={() => setPublished(!data.published)}>
            {data.published ? 'Unpublish' : 'Publish to visitors'}
          </button>
          {data.published && (
            <button
              className="button ghost"
              onClick={async () => {
                await api('/api/admin/eulogy/reveal', { method: 'POST', body: { revealAll: !data.revealAll } })
                load()
              }}
            >
              {data.revealAll ? 'Back to reveal-as-read' : 'Reveal whole text (after the ceremony)'}
            </button>
          )}
        </div>
      </div>

      <div className="card">
        <h2 className="card-label">Reading sessions</h2>
        <p className="section-note">
          Rehearsal is completely separate from what visitors see — practice as much as you like.
        </p>
        <div className="row-actions">
          <Link className="button" to="/admin/eulogy/present?session=rehearsal">
            Rehearse
          </Link>
          <Link className="button ghost" to="/admin/eulogy/preview">
            Watch rehearsal as a guest
          </Link>
          <Link className="button ghost danger" to="/admin/eulogy/present?session=live">
            Present LIVE
          </Link>
          <button
            className="button ghost"
            onClick={async () => {
              await api('/api/admin/eulogy/reset-rehearsal', { method: 'POST', body: {} })
              load()
            }}
          >
            Reset rehearsal
          </button>
          <button
            className="button ghost danger"
            onClick={async () => {
              if (!confirmResetLive) {
                setConfirmResetLive(true)
                return
              }
              setConfirmResetLive(false)
              await api('/api/admin/eulogy/reset-live', { method: 'POST', body: {} })
              load()
            }}
          >
            {confirmResetLive ? 'Press again: winds the LIVE page back' : 'Reset live session'}
          </button>
        </div>
      </div>

      {!draft && (
        <button className="button" onClick={() => setDraft({ ...EMPTY })}>
          + Add paragraph
        </button>
      )}

      {draft && (
        <div className="card">
          <h2 className="card-label">{draft.id ? 'Edit paragraph' : 'New paragraph'}</h2>
          {(['th', 'en', 'fr'] as const).map((l) => (
            <div className="field" key={l}>
              <span className="field-label">{l === 'th' ? 'ไทย' : l === 'en' ? 'English' : 'Français'}</span>
              <textarea
                className="input"
                rows={4}
                value={draft[l]}
                onChange={(e) => setDraft((d) => d && { ...d, [l]: e.target.value })}
              />
            </div>
          ))}
          {msg && <p className="error-note">{msg}</p>}
          <div className="row-actions">
            <button className="button" onClick={save}>
              Save
            </button>
            <button className="button ghost" onClick={() => setDraft(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {data.paragraphs.map((p, i) => (
        <div className="card para-card" key={p.id}>
          <span className="update-date">Paragraph {i + 1}</span>
          <p className="para-preview">{p.en || p.th || p.fr}</p>
          <div className="row-actions">
            <button className="button ghost" onClick={() => setDraft({ id: p.id, th: p.th, en: p.en, fr: p.fr })}>
              Edit
            </button>
            <button className="button ghost" disabled={i === 0} onClick={() => move(p.id, 'up')}>
              ↑
            </button>
            <button className="button ghost" disabled={i === data.paragraphs.length - 1} onClick={() => move(p.id, 'down')}>
              ↓
            </button>
            <button className="button ghost danger" onClick={() => remove(p.id)}>
              {confirmDelete === p.id ? 'Press again to delete' : 'Delete'}
            </button>
          </div>
        </div>
      ))}
    </AdminShell>
  )
}
