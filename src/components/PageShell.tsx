import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import LangSwitcher from './LangSwitcher'
import Footer from './Footer'
import { pick, useLang } from '../i18n'
import type { L10n } from '../i18n'
import { ui } from '../ui'

export default function PageShell({
  title,
  children,
}: {
  title: Partial<L10n>
  children: ReactNode
}) {
  const { lang } = useLang()
  return (
    <div className="app">
      <div className="lang-bar">
        <LangSwitcher />
      </div>
      <header className="page-header">
        <Link to="/" className="back-link" aria-label={pick(ui.back, lang)}>
          <svg width="10" height="16" viewBox="0 0 10 16" fill="none" aria-hidden="true">
            <path d="M8.5 1.5L2 8l6.5 6.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>{pick(ui.home, lang)}</span>
        </Link>
      </header>
      <main>
        <h1 className="page-title">{pick(title, lang)}</h1>
        {children}
      </main>
      <Footer />
    </div>
  )
}
