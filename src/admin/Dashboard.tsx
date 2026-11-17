import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api, errorText } from './api'
import type { AdminState } from './AdminApp'

export default function Dashboard({ state, onChange }: { state: AdminState; onChange: () => void }) {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [pwMsg, setPwMsg] = useState('')

  async function logout() {
    try {
      await api('/api/admin/logout', { method: 'POST', body: {} })
    } finally {
      onChange()
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault()
    setPwMsg('')
    try {
      await api('/api/admin/password', { method: 'POST', body: { current, next } })
      setCurrent('')
      setNext('')
      setPwMsg('Password changed.')
    } catch (err) {
      setPwMsg(errorText(err))
    }
  }

  return (
    <div className="app">
      <header className="page-header">
        <Link to="/" className="back-link">
          <svg width="10" height="16" viewBox="0 0 10 16" fill="none" aria-hidden="true">
            <path d="M8.5 1.5L2 8l6.5 6.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>View site</span>
        </Link>
        <button className="button ghost" onClick={logout}>
          Sign out
        </button>
      </header>
      <main>
        <h1 className="page-title">Hello, {state.name}</h1>
        <nav className="tiles">
          <Link to="/admin/content" className="tile">
            <span className="tile-text">
              <span className="tile-title">Ceremony & Flowers</span>
              <span className="tile-desc">Edit venue, schedule and delivery details</span>
            </span>
            <svg className="chevron" width="8" height="14" viewBox="0 0 8 14" fill="none" aria-hidden="true">
              <path d="M1.5 1.5L7 7l-5.5 5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <Link to="/admin/updates" className="tile">
            <span className="tile-text">
              <span className="tile-title">Announcements</span>
              <span className="tile-desc">Publish updates in three languages</span>
            </span>
            <svg className="chevron" width="8" height="14" viewBox="0 0 8 14" fill="none" aria-hidden="true">
              <path d="M1.5 1.5L7 7l-5.5 5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          {state.role === 'owner' && (
            <Link to="/admin/admins" className="tile">
              <span className="tile-text">
                <span className="tile-title">Administrators</span>
                <span className="tile-desc">Invite or deactivate family administrators</span>
              </span>
              <svg className="chevron" width="8" height="14" viewBox="0 0 8 14" fill="none" aria-hidden="true">
                <path d="M1.5 1.5L7 7l-5.5 5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          )}
        </nav>

        <details className="card details-card">
          <summary className="field-label">Change my password</summary>
          <form onSubmit={changePassword}>
            <div className="field">
              <span className="field-label">Current password</span>
              <input
                className="input"
                type="password"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            <div className="field">
              <span className="field-label">New password (at least 8 characters)</span>
              <input
                className="input"
                type="password"
                value={next}
                onChange={(e) => setNext(e.target.value)}
                autoComplete="new-password"
              />
            </div>
            {pwMsg && <p className="section-note">{pwMsg}</p>}
            <button className="button" type="submit">
              Change password
            </button>
          </form>
        </details>
      </main>
    </div>
  )
}
