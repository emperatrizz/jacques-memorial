import PageShell from '../components/PageShell'
import { useContent, youtubeEmbedUrl } from '../content'
import { formatDateWithDay, pick, useLang } from '../i18n'
import { ui } from '../ui'

function Pending() {
  const { lang } = useLang()
  return <span className="pending-chip">{pick(ui.toBeConfirmed, lang)}</span>
}

type ScheduleEntry = { date?: string; time?: unknown; title: unknown }

// Consecutive entries on the same date render as one day with a small timeline.
function groupByDate<T extends ScheduleEntry>(schedule: T[]): { date: string; items: T[] }[] {
  const groups: { date: string; items: T[] }[] = []
  for (const item of schedule) {
    const last = groups[groups.length - 1]
    if (last && last.date === (item.date || '')) last.items.push(item)
    else groups.push({ date: item.date || '', items: [item] })
  }
  return groups
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

      {ceremony?.livestreamUrl && (
        <div className="card">
          <h2 className="card-label">{pick(ui.livestream, lang)}</h2>
          {ceremony.livestreamNote && <p className="card-value">{pick(ceremony.livestreamNote, lang)}</p>}
          {youtubeEmbedUrl(ceremony.livestreamUrl) && (
            <div className="video-wrap">
              <iframe
                src={youtubeEmbedUrl(ceremony.livestreamUrl)!}
                title={pick(ui.livestream, lang)}
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
          <a className="button" href={ceremony.livestreamUrl} target="_blank" rel="noopener noreferrer">
            {pick(ui.openYouTube, lang)}
          </a>
        </div>
      )}

      <div className="card">
        <h2 className="card-label">{pick(ui.schedule, lang)}</h2>
        {ceremony && ceremony.schedule.length > 0 ? (
          groupByDate(ceremony.schedule).map((day) => (
            <div className="schedule-day" key={day.date}>
              {day.date && <h3 className="schedule-date">{formatDateWithDay(day.date, lang)}</h3>}
              <ul className="timeline">
                {day.items.map((item, i) => (
                  <li key={i} className="timeline-item">
                    <span className={`tl-marker ${i === 0 ? 'filled' : ''}`} aria-hidden="true" />
                    {item.time && <span className="schedule-when">{pick(item.time, lang)}</span>}
                    <span className="schedule-title">{pick(item.title, lang)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))
        ) : (
          <Pending />
        )}
      </div>

      {ceremony?.note && <p className="section-note">{pick(ceremony.note, lang)}</p>}
    </PageShell>
  )
}
