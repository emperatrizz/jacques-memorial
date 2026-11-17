import PageShell from '../components/PageShell'
import { useContent } from '../content'
import { formatDate, pick, useLang } from '../i18n'
import { ui } from '../ui'

function Pending() {
  const { lang } = useLang()
  return <span className="pending-chip">{pick(ui.toBeConfirmed, lang)}</span>
}

export default function Ceremony() {
  const { lang } = useLang()
  const { content, error } = useContent()
  const ceremony = content?.ceremony

  return (
    <PageShell title={ui.ceremonyTitle}>
      {error && <p className="error-note">{pick(ui.loadError, lang)}</p>}

      <div className="card">
        <h2 className="card-label">{pick(ui.venue, lang)}</h2>
        {ceremony?.venueName ? (
          <p className="card-value">{pick(ceremony.venueName, lang)}</p>
        ) : (
          <Pending />
        )}
        {ceremony?.venueAddress && (
          <>
            <h2 className="card-label">{pick(ui.address, lang)}</h2>
            <p className="card-value">{pick(ceremony.venueAddress, lang)}</p>
          </>
        )}
        {ceremony?.mapsUrl && (
          <a className="button" href={ceremony.mapsUrl} target="_blank" rel="noopener noreferrer">
            {pick(ui.openMaps, lang)}
          </a>
        )}
      </div>

      <div className="card">
        <h2 className="card-label">{pick(ui.schedule, lang)}</h2>
        {ceremony && ceremony.schedule.length > 0 ? (
          <ul className="schedule-list">
            {ceremony.schedule.map((item, i) => (
              <li key={i} className="schedule-item">
                <span className="schedule-when">
                  {item.date ? formatDate(item.date, lang) : ''}
                  {item.time ? ` · ${pick(item.time, lang)}` : ''}
                </span>
                <span className="schedule-title">{pick(item.title, lang)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <Pending />
        )}
      </div>

      {ceremony?.note && <p className="section-note">{pick(ceremony.note, lang)}</p>}
    </PageShell>
  )
}
