import { useEffect, useRef, useState } from 'react'
import PageShell from '../components/PageShell'
import SubmissionForm from '../components/SubmissionForm'
import { pick, useLang } from '../i18n'
import { ui } from '../ui'

export type GalleryItem = {
  id: string
  contributor?: string
  message?: string
  date: string
  files: { id: string; kind: 'image' | 'video'; contentType: string; url: string; downloadUrl: string }[]
}

export function useGallery() {
  const [items, setItems] = useState<GalleryItem[] | null>(null)
  useEffect(() => {
    fetch('/api/gallery')
      .then((r) => (r.ok ? r.json() : []))
      .then(setItems)
      .catch(() => setItems([]))
  }, [])
  return items
}

type LightboxImage = { id: string; url: string; downloadUrl: string; message?: string; contributor?: string }

// Full-screen photo viewer: arrows / swipe / keyboard step through every
// approved photo; × , tapping outside the photo, or Escape closes it.
function Lightbox({
  images,
  index,
  onStep,
  onClose,
}: {
  images: LightboxImage[]
  index: number
  onStep: (dir: 1 | -1) => void
  onClose: () => void
}) {
  const { lang } = useLang()
  const touch = useRef<{ x: number; y: number } | null>(null)
  const img = images[index]

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight') onStep(1)
      else if (e.key === 'ArrowLeft') onStep(-1)
    }
    window.addEventListener('keydown', onKey)
    // The page behind the viewer should not scroll while it is open.
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose, onStep])

  const chevron = (d: 1 | -1) => (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points={d === 1 ? '9 5 16 12 9 19' : '15 5 8 12 15 19'} />
    </svg>
  )

  return (
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      onTouchStart={(e) => {
        touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
      }}
      onTouchEnd={(e) => {
        const t = touch.current
        touch.current = null
        if (!t || images.length < 2) return
        const dx = e.changedTouches[0].clientX - t.x
        const dy = e.changedTouches[0].clientY - t.y
        if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.5) onStep(dx < 0 ? 1 : -1)
      }}
    >
      {images.length > 1 && (
        <span className="lb-count">
          {index + 1} / {images.length}
        </span>
      )}
      <button className="lb-close" type="button" aria-label="Close" onClick={onClose}>
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <line x1="6" y1="6" x2="18" y2="18" />
          <line x1="18" y1="6" x2="6" y2="18" />
        </svg>
      </button>
      <img src={img.url} alt={img.contributor || ''} onClick={(e) => e.stopPropagation()} />
      <div className="lb-caption" onClick={(e) => e.stopPropagation()}>
        {img.message && <span className="gallery-message">{img.message}</span>}
        {img.contributor && <span className="gallery-name">— {img.contributor}</span>}
        <a className="gallery-save" href={img.downloadUrl}>
          ⬇ {pick(ui.saveFile, lang)}
        </a>
      </div>
      {images.length > 1 && (
        <>
          <button
            className="car-btn prev"
            type="button"
            aria-label="Previous photo"
            onClick={(e) => {
              e.stopPropagation()
              onStep(-1)
            }}
          >
            {chevron(-1)}
          </button>
          <button
            className="car-btn next"
            type="button"
            aria-label="Next photo"
            onClick={(e) => {
              e.stopPropagation()
              onStep(1)
            }}
          >
            {chevron(1)}
          </button>
        </>
      )}
    </div>
  )
}

export default function Photos() {
  const { lang } = useLang()
  const items = useGallery()
  const withFiles = items?.filter((i) => i.files.length > 0) ?? null
  const [openAt, setOpenAt] = useState<number | null>(null)

  // Every approved photo in gallery order, so the viewer can step through them all.
  const images: LightboxImage[] =
    withFiles?.flatMap((item) =>
      item.files
        .filter((f) => f.kind === 'image')
        .map((f) => ({ id: f.id, url: f.url, downloadUrl: f.downloadUrl, message: item.message, contributor: item.contributor })),
    ) ?? []

  return (
    <PageShell title={ui.photosTitle}>
      <p className="section-note">{pick(ui.photosIntro, lang)}</p>
      <SubmissionForm mode="media" />

      <h2 className="gallery-heading">{pick(ui.galleryTitle, lang)}</h2>
      {withFiles && withFiles.length === 0 && <p className="section-note">{pick(ui.noPublicYet, lang)}</p>}
      <div className="gallery-grid">
        {withFiles?.flatMap((item) =>
          item.files.map((f) => (
            <figure className="gallery-item" key={f.id}>
              {f.kind === 'video' ? (
                <video controls preload="metadata" src={f.url} />
              ) : (
                <img
                  src={f.url}
                  alt={item.contributor || ''}
                  loading="lazy"
                  className="gallery-zoomable"
                  onClick={() => {
                    const i = images.findIndex((im) => im.id === f.id)
                    if (i >= 0) setOpenAt(i)
                  }}
                />
              )}
              <figcaption>
                {item.message && <span className="gallery-message">{item.message}</span>}
                {item.contributor && <span className="gallery-name">— {item.contributor}</span>}
                <a className="gallery-save" href={f.downloadUrl}>
                  ⬇ {pick(ui.saveFile, lang)}
                </a>
              </figcaption>
            </figure>
          )),
        )}
      </div>
      {openAt !== null && images.length > 0 && (
        <Lightbox
          images={images}
          index={openAt}
          onStep={(dir) => setOpenAt((cur) => (cur === null ? cur : (cur + dir + images.length) % images.length))}
          onClose={() => setOpenAt(null)}
        />
      )}
    </PageShell>
  )
}
