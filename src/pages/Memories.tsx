import PageShell from '../components/PageShell'
import SubmissionForm from '../components/SubmissionForm'
import { useGallery } from './Photos'
import { formatDate, pick, useLang } from '../i18n'
import { ui } from '../ui'

export default function Memories() {
  const { lang } = useLang()
  const items = useGallery()
  const withText = items?.filter((i) => i.message) ?? null

  return (
    <PageShell title={ui.memoriesTitle}>
      <p className="section-note">{pick(ui.memoriesIntro, lang)}</p>
      <SubmissionForm mode="text" />

      <h2 className="gallery-heading">{pick(ui.galleryTitle, lang)}</h2>
      {withText && withText.length === 0 && <p className="section-note">{pick(ui.noPublicYet, lang)}</p>}
      {withText?.map((item) => (
        <div className="card memory-card" key={item.id}>
          <p className="memory-text">{item.message}</p>
          <p className="memory-attribution">
            {item.contributor ? `— ${item.contributor} · ` : ''}
            {formatDate(item.date, lang)}
          </p>
        </div>
      ))}
    </PageShell>
  )
}
