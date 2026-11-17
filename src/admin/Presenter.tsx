import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from './api'
import { useEulogySocket } from '../eulogy/useEulogySocket'
import type { EulogyParagraph } from '../eulogy/EulogyReader'

type AdminEulogy = {
  published: boolean
  paragraphs: (EulogyParagraph & { position: number })[]
  sessions: { live: { index: number }; rehearsal: { index: number } }
}

/**
 * The presenter controller, built for iPad Safari: huge current paragraph,
 * previous/next context, large controls, keyboard support, double-tap guard.
 * Only one device holds control; another admin can take over explicitly.
 */
export default function Presenter() {
  const [params] = useSearchParams()
  const session: 'live' | 'rehearsal' = params.get('session') === 'rehearsal' ? 'rehearsal' : 'live'
  const [paragraphs, setParagraphs] = useState<(EulogyParagraph & { position: number })[]>([])
  const [index, setIndex] = useState(-1)
  const [controlToken, setControlToken] = useState<string | null>(null)
  const [lostControl, setLostControl] = useState(false)
  const [displayLang, setDisplayLang] = useState<'th' | 'en' | 'fr'>('en')
  const [error, setError] = useState('')
  const busyUntil = useRef(0)

  const connected = useEulogySocket(session, (s) => setIndex(s.index))

  const takeControl = useCallback(async () => {
    setError('')
    try {
      const res = await api<{ controlToken: string; state: { index: number } }>('/api/admin/eulogy/control', {
        method: 'POST',
        body: { session },
      })
      setControlToken(res.controlToken)
      setIndex(res.state.index)
      setLostControl(false)
    } catch {
      setError('Could not take control. Check your connection and try again.')
    }
  }, [session])

  useEffect(() => {
    api<AdminEulogy>('/api/admin/eulogy').then((d) => {
      setParagraphs(d.paragraphs)
      setIndex(d.sessions[session].index)
    })
    takeControl()
  }, [session, takeControl])

  const go = useCallback(
    async (nextIndex: number) => {
      // Guard against accidental double-taps
      if (Date.now() < busyUntil.current) return
      busyUntil.current = Date.now() + 550
      if (!controlToken) return
      if (nextIndex < -1 || nextIndex >= paragraphs.length) return
      setError('')
      try {
        await api('/api/admin/eulogy/advance', {
          method: 'POST',
          body: { session, controlToken, index: nextIndex },
        })
        setIndex(nextIndex)
      } catch (err) {
        if (err instanceof Error && err.message === 'control_lost') setLostControl(true)
        else setError('Could not update. Your place is kept — if this persists, reload this page.')
      }
    },
    [controlToken, paragraphs.length, session],
  )

  // Keyboard: arrows, space, page keys (page keys also come from presenter remotes)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (['ArrowRight', ' ', 'PageDown'].includes(e.key)) {
        e.preventDefault()
        go(Math.min(index + 1, paragraphs.length - 1))
      } else if (['ArrowLeft', 'PageUp'].includes(e.key)) {
        e.preventDefault()
        go(Math.max(index - 1, -1))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go, index, paragraphs.length])

  const current = index >= 0 ? paragraphs[index] : null
  const prev = index > 0 ? paragraphs[index - 1] : null
  const next = index + 1 < paragraphs.length ? paragraphs[index + 1] : null
  const atEnd = index >= paragraphs.length - 1

  return (
    <div className="presenter">
      <header className="presenter-top">
        <Link to="/admin/eulogy" className="back-link">
          ‹ Exit
        </Link>
        <span className={`session-badge ${session}`}>{session === 'rehearsal' ? 'REHEARSAL' : 'LIVE'}</span>
        <span className="presenter-progress">
          {index + 1} / {paragraphs.length}
        </span>
        <span className="lang-tabs">
          {(['th', 'en', 'fr'] as const).map((l) => (
            <button
              key={l}
              className={`lang-btn ${displayLang === l ? 'active' : ''}`}
              onClick={() => setDisplayLang(l)}
            >
              {l === 'th' ? 'ไทย' : l.toUpperCase()}
            </button>
          ))}
        </span>
        <span className={`conn-dot ${connected ? 'ok' : 'down'}`} title={connected ? 'Connected' : 'Reconnecting…'} />
      </header>

      {lostControl && (
        <div className="control-banner">
          Another device has taken control.
          <button className="button" onClick={takeControl}>
            Take control back
          </button>
        </div>
      )}
      {error && <p className="error-note">{error}</p>}

      <main className="presenter-main">
        {prev && <div className="presenter-context past">{prev[displayLang] || prev.en}</div>}
        {current ? (
          <div className="presenter-current">{current[displayLang] || current.en}</div>
        ) : (
          <div className="presenter-current waiting">
            {paragraphs.length === 0
              ? 'No paragraphs yet — add them in the eulogy editor first.'
              : atEnd && index >= 0
                ? 'Finished.'
                : 'Ready. Press Start when the reading begins.'}
          </div>
        )}
        {next && <div className="presenter-context next">{next[displayLang] || next.en}</div>}
      </main>

      <footer className="presenter-controls">
        <button className="button ghost presenter-btn" onClick={() => go(Math.max(index - 1, -1))} disabled={index <= -1}>
          ‹ Back
        </button>
        {index === -1 ? (
          <button className="button presenter-btn primary" onClick={() => go(0)} disabled={paragraphs.length === 0}>
            Start
          </button>
        ) : atEnd ? (
          <button className="button presenter-btn primary" onClick={() => go(-1)}>
            End reading
          </button>
        ) : (
          <button className="button presenter-btn primary" onClick={() => go(index + 1)}>
            Next ›
          </button>
        )}
      </footer>
      <p className="presenter-recovery">
        If anything goes wrong, reload this page — your place is kept automatically.
      </p>
    </div>
  )
}
