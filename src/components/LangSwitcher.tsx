import { useLang } from '../i18n'
import type { Lang } from '../i18n'

const LABELS: { code: Lang; label: string }[] = [
  { code: 'th', label: 'ไทย' },
  { code: 'en', label: 'EN' },
  { code: 'fr', label: 'FR' },
]

export default function LangSwitcher() {
  const { lang, setLang } = useLang()
  return (
    <div className="lang-switcher" role="group" aria-label="Language">
      {LABELS.map(({ code, label }) => (
        <button
          key={code}
          className={`lang-btn ${lang === code ? 'active' : ''}`}
          onClick={() => setLang(code)}
          aria-pressed={lang === code}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
