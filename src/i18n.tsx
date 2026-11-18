import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'

export type Lang = 'th' | 'en' | 'fr'
export type L10n = { th: string; en: string; fr: string }

function detectLang(): Lang {
  try {
    const saved = localStorage.getItem('memorial-lang')
    if (saved === 'th' || saved === 'en' || saved === 'fr') return saved
  } catch {
    /* localStorage unavailable */
  }
  const prefs = navigator.languages || [navigator.language]
  for (const p of prefs) {
    if (p.toLowerCase().startsWith('th')) return 'th'
    if (p.toLowerCase().startsWith('fr')) return 'fr'
    if (p.toLowerCase().startsWith('en')) return 'en'
  }
  return 'en'
}

const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({
  lang: 'en',
  setLang: () => {},
})

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectLang)

  useEffect(() => {
    document.documentElement.lang = lang
    try {
      localStorage.setItem('memorial-lang', lang)
    } catch {
      /* ignore */
    }
  }, [lang])

  return (
    <LangContext.Provider value={{ lang, setLang: setLangState }}>{children}</LangContext.Provider>
  )
}

export function useLang() {
  return useContext(LangContext)
}

/** Pick the current language's text from a trilingual value; falls back to English. */
export function pick(l10n: Partial<L10n> | null | undefined, lang: Lang): string {
  if (!l10n) return ''
  return l10n[lang] ?? l10n.en ?? l10n.th ?? l10n.fr ?? ''
}

export function formatDate(iso: string, lang: Lang): string {
  const locale = lang === 'th' ? 'th-TH' : lang === 'fr' ? 'fr-FR' : 'en-GB'
  try {
    return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric' }).format(
      new Date(iso + 'T12:00:00'),
    )
  } catch {
    return iso
  }
}

export function formatDateWithDay(iso: string, lang: Lang): string {
  const locale = lang === 'th' ? 'th-TH' : lang === 'fr' ? 'fr-FR' : 'en-GB'
  try {
    const s = new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(
      new Date(iso + 'T12:00:00'),
    )
    // French weekdays come back lowercase ("dimanche") — capitalize for display.
    return s.charAt(0).toLocaleUpperCase(locale) + s.slice(1)
  } catch {
    return iso
  }
}
