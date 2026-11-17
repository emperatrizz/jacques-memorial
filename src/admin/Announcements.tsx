import { useEffect, useState } from 'react'
import AdminShell from './AdminShell'
import L10nInput from './L10nInput'
import { api, errorText } from './api'
import type { Update } from '../content'

const LINKS = [
  { value: '/', label: 'Home page' },
  { value: '/ceremony', label: 'Ceremony & Schedule' },
  { value: '/flowers', label: 'Flowers & Wreaths' },
  { value: '/photos', label: 'Photographs & Videos' },
  { value: '/memories', label: 'Memories & Anecdotes' },
  { value: '/eulogy', label: 'Eulogy' },
]

type Draft = {
  id?: string
  date: string
  title: Record<string, string>
  body: Record<string, string>
  link: string
}

const emptyDraft = (): Draft => ({
  date: new Date().toISOString().slice(0, 10),
  title: { th: '', en: '', fr: '' },
  body: { th: '', en: '', fr: '' },
  link: '/',
})

export default function Announcements() {
  const [updates, setUpdates] = useState<Update[] | null>(null)
  const [draft, setDraft] = useState<Draft | null>(null)
  const [msg, setMsg] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const load = () => api<Update[]>('/api/admin/updates').then(setUpdates)
  useEffect(() => {
    load()
  }, [])

  async function save() {
    if (!draft) return
    setMsg('')
    if (!draft.title.th.trim() && !draft.title.en.trim() && !draft.title.fr.trim()) {
      setMsg('Please enter a title in at least one language.')
      return
    }
    const body = {
      date: draft.date,
      title: draft.title,
      body: draft.body.th.trim() || draft.body.en.trim() || draft.body.fr.trim() ? draft.body : undefined,
      link: draft.link || undefined,
    }
    try {
      if (draft.id) {
        await api(`/api/admin/updates/${draft.id}`, { method: 'PUT', body })
      } else {
        await api('/api/admin/updates', { method: 'POST', body })
      }
      setDraft(null)
      load()
    } catch (err) {
      setMsg(errorText(err))
    }
  }

  async function remove(id: string) {
    if (confirmDelete !== id) {
      setConfirmDelete(id)
      return
    }
    setConfirmDelete(null)
    await api(`/api/admin/updates/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <AdminShell title="Announcements">
      {!draft && (
        <button className="button" onClick={() => setDraft(emptyDraft())}>
          + New announcement
        </button>
      )}

      {draft && (
        <div className="card">
          <h2 className="card-label">{draft.id ? 'Edit announcement' : 'New announcement'}</h2>
          <div className="field">
            <span className="field-label">Date</span>
            <input
              className="input"
              type="date"
              value={draft.date}
              onChange={(e) => setDraft((d) => d && { ...d, date: e.target.value })}
            />
          </div>
          <L10nInput
            label="Title"
            value={draft.title}
            onChange={(v) => setDraft((d) => d && { ...d, title: { th: v.th || '', en: v.en || '', fr: v.fr || '' } })}
          />
          <L10nInput
            label="Details (optional)"
            value={draft.body}
            onChange={(v) => setDraft((d) => d && { ...d, body: { th: v.th || '', en: v.en || '', fr: v.fr || '' } })}
            multiline
          />
          <div className="field">
            <span className="field-label">Links to</span>
            <select
              className="input"
              value={draft.link}
              onChange={(e) => setDraft((d) => d && { ...d, link: e.target.value })}
            >
              {LINKS.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
          {msg && <p className="error-note">{msg}</p>}
          <div className="row-actions">
            <button className="button" onClick={save}>
              {draft.id ? 'Save changes' : 'Publish'}
            </button>
            <button className="button ghost" onClick={() => setDraft(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {!updates && <p className="section-note">Loading…</p>}
      {updates?.map((u) => (
        <div className="card update-card" key={u.id}>
          <span className="update-date">{u.date}</span>
          <span className="update-title">{u.title.en || u.title.th || u.title.fr}</span>
          {u.body && <span className="update-body">{u.body.en || u.body.th || u.body.fr}</span>}
          <div className="row-actions">
            <button
              className="button ghost"
              onClick={() =>
                setDraft({
                  id: u.id,
                  date: u.date,
                  title: { th: u.title.th || '', en: u.title.en || '', fr: u.title.fr || '' },
                  body: { th: u.body?.th || '', en: u.body?.en || '', fr: u.body?.fr || '' },
                  link: u.link || '/',
                })
              }
            >
              Edit
            </button>
            <button className="button ghost danger" onClick={() => remove(u.id)}>
              {confirmDelete === u.id ? 'Press again to delete' : 'Delete'}
            </button>
          </div>
        </div>
      ))}
    </AdminShell>
  )
}
