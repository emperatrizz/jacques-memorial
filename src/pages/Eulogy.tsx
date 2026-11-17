import { useEffect, useState } from 'react'
import PageShell from '../components/PageShell'
import EulogyReader from '../eulogy/EulogyReader'
import type { EulogyParagraph } from '../eulogy/EulogyReader'
import { useEulogySocket } from '../eulogy/useEulogySocket'
import { pick, useLang } from '../i18n'
import { ui } from '../ui'

type EulogyData = {
  published: boolean
  paragraphs: EulogyParagraph[]
  live: { index: number; active: boolean }
}

export default function Eulogy() {
  const { lang } = useLang()
  const [data, setData] = useState<EulogyData | null>(null)
  const [liveIndex, setLiveIndex] = useState(-1)
  const [active, setActive] = useState(false)
  const [everActive, setEverActive] = useState(false)

  const load = () =>
    fetch('/api/eulogy')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: EulogyData) => {
        setData(d)
        setLiveIndex(d.live.index)
        setActive(d.live.active)
        if (d.live.active) setEverActive(true)
      })
      .catch(() => setData({ published: false, paragraphs: [], live: { index: -1, active: false } }))

  useEffect(() => {
    load()
  }, [])

  const connected = useEulogySocket('live', (s) => {
    setLiveIndex(s.index)
    setActive(s.active)
    if (s.active) setEverActive(true)
    // The speech was just published or edited while we're on the page
    setData((d) => {
      if (d && s.published !== d.published) load()
      else if (d && s.published && s.count !== d.paragraphs.length) load()
      return d
    })
  })

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
