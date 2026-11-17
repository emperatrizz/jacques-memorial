import { useEffect, useState } from 'react'
import PageShell from '../components/PageShell'
import SubmissionForm from '../components/SubmissionForm'
import { pick, useLang } from '../i18n'
import { ui } from '../ui'

export type GalleryItem = {
  id: string
  contributor?: string
  message?: string
  date: string
  files: { id: string; kind: 'image' | 'video'; contentType: string; url: string }[]
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

export default function Photos() {
  const { lang } = useLang()
  const items = useGallery()
  const withFiles = items?.filter((i) => i.files.length > 0) ?? null

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
                <img src={f.url} alt={item.contributor || ''} loading="lazy" />
              )}
              {(item.contributor || item.message) && (
                <figcaption>
                  {item.message && <span className="gallery-message">{item.message}</span>}
                  {item.contributor && <span className="gallery-name">— {item.contributor}</span>}
                </figcaption>
              )}
            </figure>
          )),
        )}
      </div>
    </PageShell>
  )
}
