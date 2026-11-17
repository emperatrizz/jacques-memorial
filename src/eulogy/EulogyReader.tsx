import { useEffect, useRef, useState } from 'react'
import { pick, useLang } from '../i18n'
import { ui } from '../ui'
import type { Lang } from '../i18n'

export type EulogyParagraph = { id: string; th: string; en: string; fr: string }

/**
 * Shared reading view: large text, A−/A+ controls, live-paragraph highlight,
 * free scrolling with a "Return to live" control. Used by the public /eulogy
 * page (live session) and the admin rehearsal preview.
 */
export default function EulogyReader({
  paragraphs,
  liveIndex,
  active,
  connected,
  ended,
}: {
  paragraphs: EulogyParagraph[]
  liveIndex: number
  active: boolean
  connected: boolean
  ended?: boolean
}) {
  const { lang } = useLang()
  const [scale, setScale] = useState(() => {
    try {
      const s = parseFloat(localStorage.getItem('eulogy-scale') || '1')
      return s >= 0.85 && s <= 1.75 ? s : 1
    } catch {
      return 1
    }
  })
  const [following, setFollowing] = useState(true)
  const refs = useRef(new Map<number, HTMLDivElement>())
  const programmaticScroll = useRef(0)

  useEffect(() => {
    try {
      localStorage.setItem('eulogy-scale', String(scale))
    } catch {
      /* ignore */
    }
  }, [scale])

  // Follow the reader: scroll the current paragraph to the center
  useEffect(() => {
    if (!active || !following || liveIndex < 0) return
    const el = refs.current.get(liveIndex)
    if (el) {
      programmaticScroll.current = Date.now()
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [liveIndex, active, following])

  // A manual scroll pauses following (programmatic scrolls don't)
  useEffect(() => {
    const onScroll = () => {
      if (Date.now() - programmaticScroll.current > 1200) setFollowing(false)
    }
    const opts = { passive: true } as AddEventListenerOptions
    window.addEventListener('wheel', onScroll, opts)
    window.addEventListener('touchmove', onScroll, opts)
    return () => {
      window.removeEventListener('wheel', onScroll)
      window.removeEventListener('touchmove', onScroll)
    }
  }, [])

  const textFor = (p: EulogyParagraph, l: Lang) => p[l] || p.en || p.th || p.fr

  return (
    <div className="eulogy-reader">
      <div className="reader-toolbar">
        <span className="reader-status">
          {!connected && <span className="reconnect-note">{pick(ui.reconnecting, lang)}</span>}
          {connected && active && <span className="live-chip">● {pick(ui.eulogyLiveNow, lang)}</span>}
          {connected && !active && !ended && (
            <span className="section-note">{pick(ui.eulogyNotStarted, lang)}</span>
          )}
          {connected && ended && <span className="section-note">{pick(ui.eulogyEnded, lang)}</span>}
        </span>
        <span className="text-size-controls" role="group" aria-label="Text size">
          <button className="size-btn" onClick={() => setScale((s) => Math.max(0.85, +(s - 0.15).toFixed(2)))}>
            A−
          </button>
          <button className="size-btn" onClick={() => setScale((s) => Math.min(1.75, +(s + 0.15).toFixed(2)))}>
            A+
          </button>
        </span>
      </div>

      <div className="reader-body" style={{ fontSize: `${1.25 * scale}rem` }}>
        {paragraphs.map((p, i) => (
          <div
            key={p.id}
            ref={(el) => {
              if (el) refs.current.set(i, el)
            }}
            className={`reader-paragraph ${active && i === liveIndex ? 'current' : ''} ${
              active && i < liveIndex ? 'past' : ''
            }`}
          >
            {textFor(p, lang)}
          </div>
        ))}
      </div>

      {active && !following && (
        <button
          className="button return-live"
          onClick={() => {
            setFollowing(true)
            const el = refs.current.get(liveIndex)
            if (el) {
              programmaticScroll.current = Date.now()
              el.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
          }}
        >
          ↓ {pick(ui.returnToLive, lang)}
        </button>
      )}
    </div>
  )
}
