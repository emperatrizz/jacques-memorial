import { useEffect, useState } from 'react'
import AdminShell from './AdminShell'
import L10nInput, { normalizeL10n } from './L10nInput'
import { api, errorText } from './api'
import type { SiteContent, ScheduleItem } from '../content'

type EditableSchedule = { date: string; time: string; title: Record<string, string> }

export default function ContentEditor() {
  const [site, setSite] = useState<SiteContent | null>(null)
  const [schedule, setSchedule] = useState<EditableSchedule[]>([])
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    api<SiteContent>('/api/admin/content').then((s) => {
      setSite(s)
      setSchedule(
        (s.ceremony.schedule || []).map((item: ScheduleItem) => ({
          date: item.date || '',
          time: item.time?.en || item.time?.th || item.time?.fr || '',
          title: { th: item.title?.th || '', en: item.title?.en || '', fr: item.title?.fr || '' },
        })),
      )
    })
  }, [])

  if (!site) {
    return (
      <AdminShell title="Ceremony & Flowers">
        <p className="section-note">Loading…</p>
      </AdminShell>
    )
  }

  const set = (updater: (s: SiteContent) => SiteContent) => setSite((s) => (s ? updater(s) : s))

  async function save() {
    if (!site) return
    setBusy(true)
    setMsg('')
    const mapsUrl = site.ceremony.mapsUrl?.trim() || null
    if (mapsUrl && !/^https:\/\//.test(mapsUrl)) {
      setMsg('The Google Maps link must start with https://')
      setBusy(false)
      return
    }
    const payload: SiteContent = {
      ...site,
      ceremony: {
        ...site.ceremony,
        venueName: normalizeL10n(site.ceremony.venueName),
        venueAddress: normalizeL10n(site.ceremony.venueAddress),
        mapsUrl,
        note: normalizeL10n(site.ceremony.note),
        schedule: schedule
          .filter((i) => i.date || i.title.th || i.title.en || i.title.fr)
          .map((i) => ({
            date: i.date || null,
            time: i.time.trim() ? { th: i.time.trim(), en: i.time.trim(), fr: i.time.trim() } : null,
            title: { th: i.title.th.trim(), en: i.title.en.trim(), fr: i.title.fr.trim() },
          })),
      },
      flowers: {
        deliveryAddress: normalizeL10n(site.flowers.deliveryAddress),
        recipient: normalizeL10n(site.flowers.recipient),
        instructions: normalizeL10n(site.flowers.instructions),
        abroad: normalizeL10n(site.flowers.abroad),
      },
    }
    try {
      await api('/api/admin/content', { method: 'PUT', body: payload })
      setMsg('Saved. The public site is updated.')
    } catch (err) {
      setMsg(errorText(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <AdminShell title="Ceremony & Flowers">
      <div className="card">
        <h2 className="card-label">Ceremony</h2>
        <L10nInput
          label="Venue name"
          value={site.ceremony.venueName}
          onChange={(v) => set((s) => ({ ...s, ceremony: { ...s.ceremony, venueName: v } }))}
        />
        <L10nInput
          label="Venue address"
          value={site.ceremony.venueAddress}
          onChange={(v) => set((s) => ({ ...s, ceremony: { ...s.ceremony, venueAddress: v } }))}
          multiline
        />
        <div className="field">
          <span className="field-label">Google Maps link</span>
          <input
            className="input"
            type="url"
            placeholder="https://maps.app.goo.gl/…"
            value={site.ceremony.mapsUrl || ''}
            onChange={(e) => set((s) => ({ ...s, ceremony: { ...s.ceremony, mapsUrl: e.target.value } }))}
          />
        </div>
        <L10nInput
          label="Note shown under the ceremony details"
          value={site.ceremony.note}
          onChange={(v) => set((s) => ({ ...s, ceremony: { ...s.ceremony, note: v } }))}
          multiline
        />
      </div>

      <div className="card">
        <h2 className="card-label">Schedule</h2>
        {schedule.map((item, i) => (
          <div className="schedule-edit" key={i}>
            <div className="field-row">
              <div className="field">
                <span className="field-label">Date</span>
                <input
                  className="input"
                  type="date"
                  value={item.date}
                  onChange={(e) =>
                    setSchedule((list) => list.map((it, j) => (j === i ? { ...it, date: e.target.value } : it)))
                  }
                />
              </div>
              <div className="field">
                <span className="field-label">Time (e.g. 10:00)</span>
                <input
                  className="input"
                  value={item.time}
                  onChange={(e) =>
                    setSchedule((list) => list.map((it, j) => (j === i ? { ...it, time: e.target.value } : it)))
                  }
                />
              </div>
            </div>
            <L10nInput
              label="What happens"
              value={item.title}
              onChange={(v) =>
                setSchedule((list) =>
                  list.map((it, j) =>
                    j === i ? { ...it, title: { th: v.th || '', en: v.en || '', fr: v.fr || '' } } : it,
                  ),
                )
              }
            />
            <button
              className="button ghost danger"
              type="button"
              onClick={() => setSchedule((list) => list.filter((_, j) => j !== i))}
            >
              Remove this item
            </button>
          </div>
        ))}
        <button
          className="button ghost"
          type="button"
          onClick={() => setSchedule((list) => [...list, { date: '', time: '', title: { th: '', en: '', fr: '' } }])}
        >
          + Add schedule item
        </button>
      </div>

      <div className="card">
        <h2 className="card-label">Flowers & Wreaths</h2>
        <L10nInput
          label="Delivery address"
          value={site.flowers.deliveryAddress}
          onChange={(v) => set((s) => ({ ...s, flowers: { ...s.flowers, deliveryAddress: v } }))}
          multiline
        />
        <L10nInput
          label="Recipient"
          value={site.flowers.recipient}
          onChange={(v) => set((s) => ({ ...s, flowers: { ...s.flowers, recipient: v } }))}
        />
        <L10nInput
          label="Delivery details"
          value={site.flowers.instructions}
          onChange={(v) => set((s) => ({ ...s, flowers: { ...s.flowers, instructions: v } }))}
          multiline
        />
        <L10nInput
          label="Sending from abroad"
          value={site.flowers.abroad}
          onChange={(v) => set((s) => ({ ...s, flowers: { ...s.flowers, abroad: v } }))}
          multiline
        />
      </div>

      {msg && <p className="section-note">{msg}</p>}
      <button className="button save-button" onClick={save} disabled={busy}>
        {busy ? 'Saving…' : 'Save changes'}
      </button>
    </AdminShell>
  )
}
