import { useEffect, useState } from 'react'
import PageShell from '../components/PageShell'
import EulogyReader from '../eulogy/EulogyReader'
import type { EulogyParagraph, ReadingLang } from '../eulogy/EulogyReader'
import { useEulogySocket } from '../eulogy/useEulogySocket'
import { pick, useLang } from '../i18n'
import { ui } from '../ui'

// On this page the TOP language bar carries the eulogy's extra language:
// ไทย | English | Français | 日本語 — one control instead of two.
function useEulogyLang(): [ReadingLang, (l: ReadingLang) => void] {
  const { lang } = useLang()
  const [readingLang, set] = useState<ReadingLang>(() => {
    try {
      const saved = localStorage.getItem('eulogy-lang')
      if (saved === 'th' || saved === 'en' || saved === 'fr' || saved === 'ja') return saved
    } catch {
      /* ignore */
    }
    return lang
  })
  useEffect(() => {
    try {
      localStorage.setItem('eulogy-lang', readingLang)
    } catch {
      /* ignore */
    }
  }, [readingLang])
  return [readingLang, set]
}

const JA_TITLE = { th: '追悼の言葉', en: '追悼の言葉', fr: '追悼の言葉' }

type EulogyData = {
  published: boolean
  archived?: boolean
  paragraphs: EulogyParagraph[]
  live: { index: number; active: boolean }
}

export default function Eulogy() {
  const { lang } = useLang()
  const [data, setData] = useState<EulogyData | null>(null)
  const [readingLang, setReadingLang] = useEulogyLang()

  const langExtra = {
    label: '日本語',
    active: readingLang === 'ja',
    onSelect: () => setReadingLang('ja'),
    onSiteLang: (code: 'th' | 'en' | 'fr') => setReadingLang(code),
  }
  const title = readingLang === 'ja' ? JA_TITLE : ui.eulogyTitle

  useEffect(() => {
    fetch('/api/eulogy')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setData)
      .catch(() => setData({ published: false, paragraphs: [], live: { index: -1, active: false } }))
  }, [])

  if (!data) {
    return (
      <PageShell title={title} langExtra={langExtra}>
        <p className="section-note">…</p>
      </PageShell>
    )
  }

  if (!data.published) {
    return (
      <PageShell title={title} langExtra={langExtra}>
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
      <PageShell title={title} langExtra={langExtra}>
        <EulogyReader paragraphs={data.paragraphs} liveIndex={-1} active={false} connected archived readingLang={readingLang} />
      </PageShell>
    )
  }

  return <LiveEulogy initial={data} readingLang={readingLang} langExtra={langExtra} title={title} />
}

// The live-ceremony experience, mounted only while the page is not archived.
function LiveEulogy({
  initial,
  readingLang,
  langExtra,
  title,
}: {
  initial: EulogyData
  readingLang: ReadingLang
  langExtra: Parameters<typeof PageShell>[0]['langExtra']
  title: Parameters<typeof PageShell>[0]['title']
}) {
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
    <PageShell title={title} langExtra={langExtra}>
      <EulogyReader
        paragraphs={data.paragraphs}
        liveIndex={liveIndex}
        active={active}
        connected={connected}
        ended={everActive && !active}
        readingLang={readingLang}
      />
    </PageShell>
  )
}
