import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { EulogyParagraph } from '../eulogy/EulogyReader'
import { useEulogySocket } from '../eulogy/useEulogySocket'

type EulogyData = {
  published: boolean
  paragraphs: EulogyParagraph[]
  live: { index: number; active: boolean }
}

// Fullscreen display for a TV or projector (e.g. AirPlay): shows only the
// CURRENT paragraph of the live reading, in one language, as large as fits.
// Usage: /eulogy/display?lang=th (also en / fr).
export default function EulogyDisplay() {
  const [params] = useSearchParams()
  const lang = (['th', 'en', 'fr', 'ja'].includes(params.get('lang') || '') ? params.get('lang') : 'th') as
    | 'th'
    | 'en'
    | 'fr'
    | 'ja'
  const [data, setData] = useState<EulogyData | null>(null)
  const [liveIndex, setLiveIndex] = useState(-1)
  const boxRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)

  const load = () =>
    fetch('/api/eulogy')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: EulogyData) => {
        setData(d)
        setLiveIndex(d.live.index)
      })
      .catch(() => {})

  useEffect(() => {
    load()
  }, [])

  useEulogySocket('live', (s) => {
    setLiveIndex(s.index)
    setData((d) => {
      if (d && (s.published !== d.published || (s.published && s.revealed !== d.paragraphs.length))) load()
      return d
    })
  })

  const current = data?.published && liveIndex >= 0 ? data.paragraphs[liveIndex] : null
  const text = current ? current[lang] || '' : ''

  // Fit the paragraph to the screen: start large, shrink until it fits.
  useEffect(() => {
    const box = boxRef.current
    const el = textRef.current
    if (!box || !el) return
    let size = Math.round(window.innerHeight * 0.085)
    el.style.fontSize = size + 'px'
    while (size > 16 && el.scrollHeight > box.clientHeight) {
      size -= 2
      el.style.fontSize = size + 'px'
    }
  }, [text])

  useEffect(() => {
    const onResize = () => setData((d) => (d ? { ...d } : d))
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return (
    <div className="tv-display">
      <div className="tv-box" ref={boxRef}>
        {text ? (
          <div className="tv-text" ref={textRef}>
            {text}
          </div>
        ) : (
          <div className="tv-idle">
            <span className="tv-name">Jacques Léon Joseph Prades</span>
            <div className="tv-qr-panel">
              <img className="tv-qr" src="/qr-eulogy.png" alt="QR code: jacquesprades.com/eulogy" />
            </div>
            <span className="tv-scan-hint">
              สแกนเพื่ออ่านคำกล่าวอาลัยในภาษาของคุณ
              <br />
              Scan to follow the eulogy in your language · Scannez pour suivre dans votre langue
              <br />
              <span lang="ja">スキャンすると、追悼の言葉をご自分の言語でお読みいただけます</span>
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
