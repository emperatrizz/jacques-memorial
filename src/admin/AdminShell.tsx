import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export default function AdminShell({
  title,
  backTo = '/admin',
  backLabel = 'Admin',
  children,
}: {
  title: string
  backTo?: string
  backLabel?: string
  children: ReactNode
}) {
  return (
    <div className="app">
      <header className="page-header">
        <Link to={backTo} className="back-link">
          <svg width="10" height="16" viewBox="0 0 10 16" fill="none" aria-hidden="true">
            <path d="M8.5 1.5L2 8l6.5 6.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>{backLabel}</span>
        </Link>
      </header>
      <main>
        <h1 className="page-title">{title}</h1>
        {children}
      </main>
    </div>
  )
}
