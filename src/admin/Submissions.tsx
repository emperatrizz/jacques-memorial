import { useEffect, useState } from 'react'
import AdminShell from './AdminShell'
import { api } from './api'

type SubFile = {
  id: string
  originalName: string
  contentType: string
  kind: 'image' | 'video'
  size: number | null
  viewUrl: string
  downloadUrl: string
}

type Submission = {
  id: string
  contributor?: string
  message?: string
  visibility: 'public' | 'family'
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  moderator?: string
  files: SubFile[]
}

const STATUSES = ['pending', 'approved', 'rejected'] as const
const VISIBILITIES = ['', 'public', 'family'] as const

export default function Submissions() {
  const [status, setStatus] = useState<(typeof STATUSES)[number]>('pending')
  const [visibility, setVisibility] = useState<(typeof VISIBILITIES)[number]>('')
  const [items, setItems] = useState<Submission[] | null>(null)
  const [confirmDelete, setConfirmDelete] = useState('')

  const load = () => {
    setItems(null)
    const q = new URLSearchParams({ status })
    if (visibility) q.set('visibility', visibility)
    api<Submission[]>(`/api/admin/submissions?${q}`).then(setItems)
  }
  useEffect(load, [status, visibility])

  async function setSubStatus(id: string, next: string) {
    await api(`/api/admin/submissions/${id}/status`, { method: 'POST', body: { status: next } })
    load()
  }

  async function remove(id: string) {
    if (confirmDelete !== id) {
      setConfirmDelete(id)
      return
    }
    setConfirmDelete('')
    await api(`/api/admin/submissions/${id}`, { method: 'DELETE' })
    load()
  }

  const zipQuery = new URLSearchParams({ status })
  if (visibility) zipQuery.set('visibility', visibility)

  return (
    <AdminShell title="Submissions">
      <div className="filter-row">
        {STATUSES.map((s) => (
          <button key={s} className={`lang-btn ${status === s ? 'active' : ''}`} onClick={() => setStatus(s)}>
            {s[0].toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>
      <div className="filter-row">
        {VISIBILITIES.map((v) => (
          <button key={v || 'all'} className={`lang-btn ${visibility === v ? 'active' : ''}`} onClick={() => setVisibility(v)}>
            {v === '' ? 'All' : v === 'public' ? 'Public' : 'Family-only'}
          </button>
        ))}
        <a className="button ghost zip-link" href={`/api/admin/submissions/zip?${zipQuery}`}>
          ⬇ ZIP of this view
        </a>
      </div>

      {!items && <p className="section-note">Loading…</p>}
      {items && items.length === 0 && <p className="section-note">Nothing here.</p>}

      {items?.map((s) => (
        <div className="card submission-card" key={s.id}>
          <div className="submission-head">
            <span className="update-title">{s.contributor || 'Anonymous'}</span>
            <span className={`pending-chip ${s.visibility === 'family' ? 'family-chip' : ''}`}>
              {s.visibility === 'family' ? 'Family only' : 'Public'}
            </span>
          </div>
          <span className="update-date">
            {s.createdAt}
            {s.moderator ? ` · moderated by ${s.moderator}` : ''}
          </span>
          {s.message && <p className="memory-text">{s.message}</p>}

          {s.files.length > 0 && (
            <div className="mod-media">
              {s.files.map((f) => (
                <div className="mod-media-item" key={f.id}>
                  {f.kind === 'video' ? (
                    <video controls preload="metadata" src={f.viewUrl} />
                  ) : (
                    <img src={f.viewUrl} alt={f.originalName} loading="lazy" />
                  )}
                  <a className="mod-download" href={f.downloadUrl}>
                    ⬇ {f.originalName}
                    {f.size ? ` (${(f.size / 1024 / 1024).toFixed(1)} MB)` : ''}
                  </a>
                </div>
              ))}
            </div>
          )}

          <div className="row-actions">
            {s.status !== 'approved' && (
              <button className="button" onClick={() => setSubStatus(s.id, 'approved')}>
                {s.visibility === 'public' ? 'Approve for public' : 'Mark reviewed'}
              </button>
            )}
            {s.status !== 'rejected' && (
              <button className="button ghost" onClick={() => setSubStatus(s.id, 'rejected')}>
                Reject
              </button>
            )}
            {s.status !== 'pending' && (
              <button className="button ghost" onClick={() => setSubStatus(s.id, 'pending')}>
                Back to pending
              </button>
            )}
            <button className="button ghost danger" onClick={() => remove(s.id)}>
              {confirmDelete === s.id ? 'Press again to delete forever' : 'Delete'}
            </button>
          </div>
        </div>
      ))}
    </AdminShell>
  )
}
