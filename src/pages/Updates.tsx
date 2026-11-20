import { Link } from 'react-router-dom'
import PageShell from '../components/PageShell'
import { useContent } from '../content'
import { formatDate, pick, useLang } from '../i18n'
import { ui } from '../ui'

// Minimal emphasis support: **text** in an update body renders bold.
export function renderEmphasis(text: string) {
  const parts = text.split(/\*\*(.+?)\*\*/g)
  return parts.map((p, i) => (i % 2 === 1 ? <strong key={i}>{p}</strong> : p))
}

export default function Updates() {
  const { lang } = useLang()
  const { updates, error, loaded } = useContent()

  return (
    <PageShell title={ui.updatesPageTitle}>
      {error && <p className="error-note">{pick(ui.loadError, lang)}</p>}
      {loaded && !error && updates.length === 0 && (
        <p className="section-note">{pick(ui.noUpdates, lang)}</p>
      )}
      <div className="updates-list">
        {updates.map((u) => {
          const inner = (
            <>
              <span className="update-date">{formatDate(u.date, lang)}</span>
              <span className="update-title">{pick(u.title, lang)}</span>
              {u.body && <span className="update-body">{renderEmphasis(pick(u.body, lang))}</span>}
            </>
          )
          return u.link ? (
            <Link key={u.id} to={u.link} className="card update-card linked">
              {inner}
            </Link>
          ) : (
            <div key={u.id} className="card update-card">
              {inner}
            </div>
          )
        })}
      </div>
    </PageShell>
  )
}
