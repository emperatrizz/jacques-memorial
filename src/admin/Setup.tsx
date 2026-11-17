import { useState } from 'react'
import { api, errorText } from './api'

export default function Setup({ codeRequired, onDone }: { codeRequired: boolean; onDone: () => void }) {
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [setupCode, setSetupCode] = useState('')
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
      await api('/api/admin/setup', { method: 'POST', body: { name, password, setupCode } })
      onDone()
    } catch (err) {
      setError(errorText(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="app">
      <main className="auth-main">
        <h1 className="page-title">Create the owner account</h1>
        <p className="section-note">
          This one-time step creates the website's owner account. Choose a password you don't use anywhere else.
        </p>
        <form className="card" onSubmit={submit}>
          {codeRequired && (
            <div className="field">
              <span className="field-label">Setup code</span>
              <input className="input" value={setupCode} onChange={(e) => setSetupCode(e.target.value)} />
            </div>
          )}
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
          <button className="button" type="submit" disabled={busy}>
            {busy ? 'Creating…' : 'Create owner account'}
          </button>
        </form>
      </main>
    </div>
  )
}
