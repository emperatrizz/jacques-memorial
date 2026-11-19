import PageShell from '../components/PageShell'
import { useContent } from '../content'
import { pick, useLang } from '../i18n'
import { ui } from '../ui'

export default function Flowers() {
  const { lang } = useLang()
  const { content, error } = useContent()
  const flowers = content?.flowers

  return (
    <PageShell title={ui.flowersTitle}>
      {error && <p className="error-note">{pick(ui.loadError, lang)}</p>}

      <div className="card">
        <h2 className="card-label">{pick(ui.deliveryAddress, lang)}</h2>
        {flowers?.deliveryAddress ? (
          <p className="card-value">{pick(flowers.deliveryAddress, lang)}</p>
        ) : (
          <span className="pending-chip">{pick(ui.toBeConfirmed, lang)}</span>
        )}
        {flowers?.recipient && (
          <>
            <h2 className="card-label">{pick(ui.recipient, lang)}</h2>
            <p className="card-value">{pick(flowers.recipient, lang)}</p>
          </>
        )}
      </div>

      {flowers?.instructions && (
        <div className="card">
          <h2 className="card-label">{pick(ui.instructions, lang)}</h2>
          <p className="card-value">{pick(flowers.instructions, lang)}</p>
        </div>
      )}

      {flowers?.abroad && (
        <div className="card">
          <h2 className="card-label">{pick(ui.fromAbroad, lang)}</h2>
          <p className="card-value">{pick(flowers.abroad, lang)}</p>
          {flowers.florists && flowers.florists.length > 0 && (
            <div className="florist-list">
              {flowers.florists.map((f) => (
                <a className="card update-card linked florist-card" key={f.url} href={f.url} target="_blank" rel="noopener noreferrer">
                  <span className="update-title">{f.name}</span>
                  {f.note && <span className="update-body">{pick(f.note, lang)}</span>}
                  <span className="article-link">{f.url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/.*$/, '')} ↗</span>
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </PageShell>
  )
}
