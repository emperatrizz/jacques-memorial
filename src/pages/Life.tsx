import { useEffect, useState } from 'react'
import PageShell from '../components/PageShell'
import { pick, useLang } from '../i18n'
import type { L10n } from '../i18n'
import { ui } from '../ui'

export type BioSection = { id: string; title: Partial<L10n>; body: Partial<L10n> }
export type BioPhoto = { key: string; caption?: Partial<L10n> | null }
export type BioArticle = { id: string; title: string; description: Partial<L10n>; url: string }
export type Biography = { sections: BioSection[]; photos: BioPhoto[]; articles: BioArticle[] }

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
