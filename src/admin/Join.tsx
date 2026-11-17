import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { api, errorText } from './api'

export default function Join({ onDone }: { onDone: () => void }) {
  const [params] = useSearchParams()
  const code = params.get('code') || ''
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    setBusy(true)
    setError('')
    try {
      await api('/api/admin/join', { method: 'POST', body: { code, name, password } })
      onDone()
      navigate('/admin')
    } catch (err) {
      setError(errorText(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="app">
      <main className="auth-main">
        <h1 className="page-title">Join as family administrator</h1>
        {!code && <p className="error-note">This page needs an invitation link. Please ask the owner for one.</p>}
        <form className="card" onSubmit={submit}>
          <div className="field">
            <span className="field-label">Your name</span>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} autoComplete="username" />
          </div>
          <div className="field">
            <span className="field-label">Password (at least 8 characters)</span>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <div className="field">
            <span className="field-label">Repeat password</span>
            <input
              className="input"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          {error && <p className="error-note">{error}</p>}
          <button className="button" type="submit" disabled={busy || !code}>
            {busy ? 'Creating…' : 'Create account'}
          </button>
        </form>
      </main>
    </div>
  )
}
