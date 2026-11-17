import type { L10n } from '../i18n'

const LANGS: { code: keyof L10n; tag: string }[] = [
  { code: 'th', tag: 'ไทย' },
  { code: 'en', tag: 'EN' },
  { code: 'fr', tag: 'FR' },
]

export default function L10nInput({
  label,
  value,
  onChange,
  multiline,
}: {
  label: string
  value: Partial<L10n> | null | undefined
  onChange: (v: Partial<L10n>) => void
  multiline?: boolean
}) {
  const v = value || {}
  return (
    <div className="field">
      <span className="field-label">{label}</span>
      {LANGS.map(({ code, tag }) => (
        <div className="l10n-row" key={code}>
          <span className="lang-tag">{tag}</span>
          {multiline ? (
            <textarea
              className="input"
              rows={3}
              value={v[code] || ''}
              onChange={(e) => onChange({ ...v, [code]: e.target.value })}
            />
          ) : (
            <input
              className="input"
              type="text"
              value={v[code] || ''}
              onChange={(e) => onChange({ ...v, [code]: e.target.value })}
            />
          )}
        </div>
      ))}
    </div>
  )
}

/** An all-blank trilingual value becomes null so the public site shows "To be confirmed". */
export function normalizeL10n(v: Partial<L10n> | null | undefined): Partial<L10n> | null {
  if (!v) return null
  const trimmed = { th: v.th?.trim() || '', en: v.en?.trim() || '', fr: v.fr?.trim() || '' }
  if (!trimmed.th && !trimmed.en && !trimmed.fr) return null
  return trimmed
}
