import { Link } from 'react-router-dom'
import { useContent } from '../content'
import { pick, useLang } from '../i18n'
import { ui } from '../ui'

export default function UpdatesBar() {
  const { lang } = useLang()
  const { updates } = useContent()
  const latest = updates[0]
  if (!latest) return null
  return (
    <Link to="/updates" className="updates-bar">
      <span className="updates-dot" aria-hidden="true" />
      <span className="updates-text">
        <span className="updates-label">{pick(ui.latestUpdates, lang)}</span>
        <span className="updates-title">{pick(latest.title, lang)}</span>
      </span>
      <svg className="chevron" width="8" height="14" viewBox="0 0 8 14" fill="none" aria-hidden="true">
        <path d="M1.5 1.5L7 7l-5.5 5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Link>
  )
}
