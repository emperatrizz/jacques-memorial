import { useLang } from '../i18n'
import type { Lang } from '../i18n'

const LABELS: { code: Lang; label: string }[] = [
  { code: 'th', label: 'ไทย' },
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
]

/**
 * The site language bar. A page may add one extra, page-specific language
 * (the eulogy offers Japanese): while the extra is active no site language is
 * highlighted, and picking a site language hands control back to it.
 */
export default function LangSwitcher({
  extra,
}: {
  extra?: { label: string; active: boolean; onSelect: () => void; onSiteLang: (code: Lang) => void }
}) {
  const { lang, setLang } = useLang()
  return (
    <div className="lang-switcher" role="group" aria-label="Language">
      {LABELS.map(({ code, label }) => (
        <button
          key={code}
          className={`lang-btn ${!extra?.active && lang === code ? 'active' : ''}`}
          onClick={() => {
            setLang(code)
            extra?.onSiteLang(code)
          }}
          aria-pressed={!extra?.active && lang === code}
        >
          {label}
        </button>
      ))}
      {extra && (
        <button
          className={`lang-btn ${extra.active ? 'active' : ''}`}
          onClick={extra.onSelect}
          aria-pressed={extra.active}
          lang="ja"
        >
          {extra.label}
        </button>
      )}
    </div>
  )
}
