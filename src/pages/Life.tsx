import { useEffect, useRef, useState } from 'react'
import PageShell from '../components/PageShell'
import { pick, useLang } from '../i18n'
import type { L10n } from '../i18n'
import { ui } from '../ui'

export type BioSection = { id: string; title: Partial<L10n>; body: Partial<L10n>; photos?: BioPhoto[] }
export type BioPhoto = { key: string; caption?: Partial<L10n> | null }
export type BioArticle = { id: string; title: string; description: Partial<L10n>; url: string }
export type Biography = { sections: BioSection[]; photos: BioPhoto[]; articles: BioArticle[] }

// Slideshow: tap a photo or the arrows to move on; left alone, it drifts to
// the next photo by itself and starts again after a short pause.
function Carousel({ photos }: { photos: BioPhoto[] }) {
  const { lang } = useLang()
  const ref = useRef<HTMLDivElement>(null)
  const lastTouch = useRef(0)
  const autoScrolling = useRef(false)
  const settle = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const goTo = (left: number) => {
    const el = ref.current
    if (!el) return
    autoScrolling.current = true
    clearTimeout(settle.current)
    settle.current = setTimeout(() => {
      autoScrolling.current = false
    }, 1600)
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollTo({ left, behavior: reduce ? 'auto' : 'smooth' })
  }

  const advance = (dir: 1 | -1, manual = false) => {
    const el = ref.current
    if (!el) return
    if (manual) lastTouch.current = Date.now()
    const maxLeft = el.scrollWidth - el.clientWidth
    if (maxLeft <= 0) return
    const items = Array.from(el.children) as HTMLElement[]
    const n = items.length
    // Scroll position that centers each photo (matches scroll-snap-align: center),
    // so stepping works with the browser's snapping instead of against it.
    const desired = items.map((it) => {
      const pos = it.offsetLeft - items[0].offsetLeft
      return Math.max(0, Math.min(pos - (el.clientWidth - it.offsetWidth) / 2, maxLeft))
    })
    let cur = 0
    let best = Infinity
    desired.forEach((d, i) => {
      const dist = Math.abs(d - el.scrollLeft)
      if (dist < best) {
        best = dist
        cur = i
      }
    })
    let next = (cur + dir + n) % n
    // Photos clamped to the same end position would make a click look dead; skip past them.
    while (next !== cur && Math.abs(desired[next] - desired[cur]) < 2) next = (next + dir + n) % n
    goTo(desired[next])
  }

  useEffect(() => {
    const el = ref.current
    if (!el || photos.length < 2) return
    // A horizontal scroll we didn't start = the visitor swiping; pause the
    // slideshow briefly. Vertical page scrolling never reaches this listener.
    const onScroll = () => {
      if (autoScrolling.current) {
        clearTimeout(settle.current)
        settle.current = setTimeout(() => {
          autoScrolling.current = false
        }, 400)
        return
      }
      lastTouch.current = Date.now()
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    let visible = false
    const io = new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting
    }, { threshold: 0.4 })
    io.observe(el)
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const timer = reduce
      ? undefined
      : setInterval(() => {
          if (!visible || document.hidden) return
          if (Date.now() - lastTouch.current < 7000) return
          advance(1)
        }, 4500)
    return () => {
      if (timer) clearInterval(timer)
      clearTimeout(settle.current)
      io.disconnect()
      el.removeEventListener('scroll', onScroll)
    }
  }, [photos.length])

  const chevron = (d: 1 | -1) => (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points={d === 1 ? '9 5 16 12 9 19' : '15 5 8 12 15 19'} />
    </svg>
  )

  return (
    <div className="carousel-wrap">
      <div className="carousel" ref={ref}>
        {photos.map((p) => (
          <figure className="carousel-item" key={p.key} onClick={() => advance(1, true)}>
            <img src={`/api/biography/photo?key=${encodeURIComponent(p.key)}`} alt="" loading="lazy" />
            {p.caption && <figcaption>{pick(p.caption, lang)}</figcaption>}
          </figure>
        ))}
      </div>
      {photos.length > 1 && (
        <>
          <button className="car-btn prev" type="button" aria-label="Previous photo" onClick={() => advance(-1, true)}>
            {chevron(-1)}
          </button>
          <button className="car-btn next" type="button" aria-label="Next photo" onClick={() => advance(1, true)}>
            {chevron(1)}
          </button>
        </>
      )}
    </div>
  )
}

export default function Life() {
  const { lang } = useLang()
  const [bio, setBio] = useState<Biography | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch('/api/biography')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setBio)
      .catch(() => setError(true))
  }, [])

  return (
    <PageShell title={ui.lifeTitle}>
      {error && <p className="error-note">{pick(ui.loadError, lang)}</p>}
      {!bio && !error && <p className="section-note">…</p>}

      {bio && bio.photos.length > 0 && (
        <div className="bio-photos">
          {bio.photos.map((p) => (
            <figure className="bio-photo" key={p.key}>
              <img src={`/api/biography/photo?key=${encodeURIComponent(p.key)}`} alt="" loading="lazy" />
              {p.caption && <figcaption>{pick(p.caption, lang)}</figcaption>}
            </figure>
          ))}
        </div>
      )}

      {bio?.sections.map((s) => (
        <section className="bio-section" key={s.id}>
          {s.photos && s.photos.length > 0 && <Carousel photos={s.photos} />}
          <h2 className="bio-heading">{pick(s.title, lang)}</h2>
          <p className="bio-body">{pick(s.body, lang)}</p>
        </section>
      ))}

      {bio && bio.articles.length > 0 && (
        <>
          <h2 className="bio-heading press-heading">{pick(ui.pressHeading, lang)}</h2>
          {bio.articles.map((a) => (
            <a className="card update-card linked" key={a.id} href={a.url} target="_blank" rel="noopener noreferrer">
              <span className="update-title">{a.title}</span>
              <span className="update-body">{pick(a.description, lang)}</span>
              <span className="article-link">{pick(ui.readSource, lang)} ↗</span>
            </a>
          ))}
        </>
      )}
    </PageShell>
  )
}
