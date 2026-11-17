import { useEffect, useRef, useState } from 'react'
import AdminShell from './AdminShell'
import L10nInput from './L10nInput'
import { api, errorText } from './api'
import type { Biography } from '../pages/Life'

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

export default function BiographyEditor() {
  const [bio, setBio] = useState<Biography | null>(null)
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)
  // Where the next uploaded photo goes: 'top' = page gallery, number = section index
  const uploadTarget = useRef<'top' | number>('top')

  useEffect(() => {
    fetch('/api/biography')
      .then((r) => r.json())
      .then(setBio)
  }, [])

  if (!bio) {
    return (
      <AdminShell title="Life & Legacy">
        <p className="section-note">Loading…</p>
      </AdminShell>
    )
  }

  const set = (updater: (b: Biography) => Biography) => setBio((b) => (b ? updater(b) : b))
  const moveItem = <T,>(list: T[], i: number, dir: -1 | 1): T[] => {
    const j = i + dir
    if (j < 0 || j >= list.length) return list
    const next = [...list]
    ;[next[i], next[j]] = [next[j], next[i]]
    return next
  }

  async function uploadPhoto(file: File) {
    setMsg('')
    try {
      const { key, url, headers } = await api<{ key: string; url: string; headers: Record<string, string> }>(
        '/api/admin/biography/photo-upload',
        { method: 'POST', body: { type: file.type, size: file.size } },
      )
      const put = await fetch(url, { method: 'PUT', headers, body: file })
      if (!put.ok) throw new Error('request_failed')
      const target = uploadTarget.current
      if (target === 'top') {
        set((b) => ({ ...b, photos: [...b.photos, { key }] }))
      } else {
        set((b) => ({
          ...b,
          sections: b.sections.map((s, j) =>
            j === target ? { ...s, photos: [...(s.photos || []), { key }] } : s,
          ),
        }))
      }
      setMsg('Photo uploaded — press Save to make it visible.')
    } catch (err) {
      setMsg(errorText(err))
    }
  }

  async function save() {
    if (!bio) return
    setBusy(true)
    setMsg('')
    try {
      await api('/api/admin/biography', { method: 'PUT', body: bio })
      setMsg('Saved. The public page is updated.')
    } catch (err) {
      setMsg(errorText(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <AdminShell title="Life & Legacy">
      <p className="section-note">
        This edits the public "Life & Legacy" page in all three languages. Changes go live when you press Save.
      </p>

      <div className="card">
        <h2 className="card-label">Photographs</h2>
        <input
          ref={fileInput}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          hidden
          onChange={(e) => {
            if (e.target.files?.[0]) uploadPhoto(e.target.files[0])
            e.target.value = ''
          }}
        />
        <button
          className="button ghost file-button"
          type="button"
          onClick={() => {
            uploadTarget.current = 'top'
            fileInput.current?.click()
          }}
        >
          + Upload photograph
        </button>
        <div className="mod-media">
          {bio.photos.map((p, i) => (
            <div className="mod-media-item" key={p.key}>
              <img src={`/api/biography/photo?key=${encodeURIComponent(p.key)}`} alt="" loading="lazy" />
              <L10nInput
                label="Caption (optional)"
                value={p.caption}
                onChange={(v) => set((b) => ({ ...b, photos: b.photos.map((x, j) => (j === i ? { ...x, caption: v } : x)) }))}
              />
              <button
                className="button ghost danger"
                type="button"
                onClick={() => set((b) => ({ ...b, photos: b.photos.filter((_, j) => j !== i) }))}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      {bio.sections.map((s, i) => (
        <div className="card" key={s.id}>
          <div className="submission-head">
            <h2 className="card-label" style={{ margin: 0 }}>
              Section {i + 1}
            </h2>
            <span className="row-actions" style={{ marginTop: 0 }}>
              <button className="button ghost" disabled={i === 0} onClick={() => set((b) => ({ ...b, sections: moveItem(b.sections, i, -1) }))}>
                ↑
              </button>
              <button
                className="button ghost"
                disabled={i === bio.sections.length - 1}
                onClick={() => set((b) => ({ ...b, sections: moveItem(b.sections, i, 1) }))}
              >
                ↓
              </button>
              <button
                className="button ghost danger"
                onClick={() => set((b) => ({ ...b, sections: b.sections.filter((_, j) => j !== i) }))}
              >
                Delete
              </button>
            </span>
          </div>
          <L10nInput
            label="Heading"
            value={s.title}
            onChange={(v) => set((b) => ({ ...b, sections: b.sections.map((x, j) => (j === i ? { ...x, title: v } : x)) }))}
          />
          <L10nInput
            label="Text"
            value={s.body}
            onChange={(v) => set((b) => ({ ...b, sections: b.sections.map((x, j) => (j === i ? { ...x, body: v } : x)) }))}
            multiline
          />
          <span className="field-label">Carousel photos (shown above this section)</span>
          <button
            className="button ghost"
            type="button"
            onClick={() => {
              uploadTarget.current = i
              fileInput.current?.click()
            }}
          >
            + Add photo to this section
          </button>
          {(s.photos || []).length > 0 && (
            <div className="mod-media">
              {(s.photos || []).map((p, pi) => (
                <div className="mod-media-item" key={p.key}>
                  <img src={`/api/biography/photo?key=${encodeURIComponent(p.key)}`} alt="" loading="lazy" />
                  <L10nInput
                    label="Caption (optional)"
                    value={p.caption}
                    onChange={(v) =>
                      set((b) => ({
                        ...b,
                        sections: b.sections.map((x, j) =>
                          j === i
                            ? { ...x, photos: (x.photos || []).map((y, k) => (k === pi ? { ...y, caption: v } : y)) }
                            : x,
                        ),
                      }))
                    }
                  />
                  <div className="row-actions">
                    <button
                      className="button ghost"
                      disabled={pi === 0}
                      onClick={() =>
                        set((b) => ({
                          ...b,
                          sections: b.sections.map((x, j) => (j === i ? { ...x, photos: moveItem(x.photos || [], pi, -1) } : x)),
                        }))
                      }
                    >
                      ←
                    </button>
                    <button
                      className="button ghost"
                      disabled={pi === (s.photos || []).length - 1}
                      onClick={() =>
                        set((b) => ({
                          ...b,
                          sections: b.sections.map((x, j) => (j === i ? { ...x, photos: moveItem(x.photos || [], pi, 1) } : x)),
                        }))
                      }
                    >
                      →
                    </button>
                    <button
                      className="button ghost danger"
                      onClick={() =>
                        set((b) => ({
                          ...b,
                          sections: b.sections.map((x, j) =>
                            j === i ? { ...x, photos: (x.photos || []).filter((_, k) => k !== pi) } : x,
                          ),
                        }))
                      }
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
      <button
        className="button ghost"
        onClick={() => set((b) => ({ ...b, sections: [...b.sections, { id: uid(), title: {}, body: {} }] }))}
      >
        + Add section
      </button>

      <h2 className="card-label" style={{ marginTop: 24 }}>
        Articles & publications
      </h2>
      {bio.articles.map((a, i) => (
        <div className="card" key={a.id}>
          <div className="field">
            <span className="field-label">Title (as published)</span>
            <input
              className="input"
              value={a.title}
              onChange={(e) =>
                set((b) => ({ ...b, articles: b.articles.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)) }))
              }
            />
          </div>
          <div className="field">
            <span className="field-label">Link (https://…)</span>
            <input
              className="input"
              type="url"
              value={a.url}
              onChange={(e) =>
                set((b) => ({ ...b, articles: b.articles.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)) }))
              }
            />
          </div>
          <L10nInput
            label="Description"
            value={a.description}
            onChange={(v) =>
              set((b) => ({ ...b, articles: b.articles.map((x, j) => (j === i ? { ...x, description: v } : x)) }))
            }
            multiline
          />
          <div className="row-actions">
            <button className="button ghost" disabled={i === 0} onClick={() => set((b) => ({ ...b, articles: moveItem(b.articles, i, -1) }))}>
              ↑
            </button>
            <button
              className="button ghost"
              disabled={i === bio.articles.length - 1}
              onClick={() => set((b) => ({ ...b, articles: moveItem(b.articles, i, 1) }))}
            >
              ↓
            </button>
            <button
              className="button ghost danger"
              onClick={() => set((b) => ({ ...b, articles: b.articles.filter((_, j) => j !== i) }))}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
      <button
        className="button ghost"
        onClick={() =>
          set((b) => ({ ...b, articles: [...b.articles, { id: uid(), title: '', description: {}, url: 'https://' }] }))
        }
      >
        + Add article
      </button>

      {msg && <p className="section-note">{msg}</p>}
      <button className="button save-button" onClick={save} disabled={busy}>
        {busy ? 'Saving…' : 'Save changes'}
      </button>
    </AdminShell>
  )
}
