import { useEffect, useState } from 'react'
import PageShell from '../components/PageShell'
import EulogyReader from '../eulogy/EulogyReader'
import type { EulogyParagraph } from '../eulogy/EulogyReader'
import { useEulogySocket } from '../eulogy/useEulogySocket'
import { pick, useLang } from '../i18n'
import { ui } from '../ui'

type EulogyData = {
  published: boolean
  archived?: boolean
  paragraphs: EulogyParagraph[]
  live: { index: number; active: boolean }
}

export default function Eulogy() {
  const { lang } = useLang()
  const [data, setData] = useState<EulogyData | null>(null)

  useEffect(() => {
    fetch('/api/eulogy')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setData)
      .catch(() => setData({ published: false, paragraphs: [], live: { index: -1, active: false } }))
  }, [])

  if (!data) {
    return (
      <PageShell title={ui.eulogyTitle}>
        <p className="section-note">…</p>
      </PageShell>
    )
  }

  if (!data.published) {
    return (
      <PageShell title={ui.eulogyTitle}>
        <div className="card coming-soon">
          <p className="coming-soon-title">{pick(ui.comingSoonTitle, lang)}</p>
          <p className="card-value">{pick(ui.comingSoonBody, lang)}</p>
        </div>
      </PageShell>
    )
  }

  // After the ceremony: a quiet, static memorial page — the full speech with
  // the dateline, no live connection, no live indicators.
  if (data.archived) {
    return (
      <PageShell title={ui.eulogyTitle}>
        <EulogyReader paragraphs={data.paragraphs} liveIndex={-1} active={false} connected archived />
      </PageShell>
    )
  }

  return <LiveEulogy initial={data} />
}

// The live-ceremony experience, mounted only while the page is not archived.
function LiveEulogy({ initial }: { initial: EulogyData }) {
  const [data, setData] = useState<EulogyData>(initial)
  const [liveIndex, setLiveIndex] = useState(initial.live.index)
  const [active, setActive] = useState(initial.live.active)
  const [everActive, setEverActive] = useState(initial.live.active)

  const load = () =>
    fetch('/api/eulogy')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: EulogyData) => {
        setData(d)
        setLiveIndex(d.live.index)
        setActive(d.live.active)
        if (d.live.active) setEverActive(true)
      })
      .catch(() => {})

  const connected = useEulogySocket('live', (s) => {
    setLiveIndex(s.index)
    setActive(s.active)
    if (s.active) setEverActive(true)
    // Fetch newly revealed paragraphs (progressive reveal), or react to publishing
    setData((d) => {
      if (d && s.published !== d.published) load()
      else if (d && s.published && s.revealed !== d.paragraphs.length) load()
      return d
    })
  })

  return (
    <PageShell title={ui.eulogyTitle}>
      <EulogyReader
        paragraphs={data.paragraphs}
        liveIndex={liveIndex}
        active={active}
        connected={connected}
        ended={everActive && !active}
      />
    </PageShell>
  )
}
