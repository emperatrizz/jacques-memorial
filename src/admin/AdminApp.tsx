import { useCallback, useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { api } from './api'
import Login from './Login'
import Setup from './Setup'
import Join from './Join'
import Dashboard from './Dashboard'
import ContentEditor from './ContentEditor'
import Announcements from './Announcements'
import Admins from './Admins'
import Submissions from './Submissions'

export type AdminState = {
  setupNeeded: boolean
  setupCodeRequired: boolean
  loggedIn: boolean
  name?: string
  role?: 'owner' | 'admin'
}

export default function AdminApp() {
  const [state, setState] = useState<AdminState | null>(null)
  const [failed, setFailed] = useState(false)
  const location = useLocation()

  const refresh = useCallback(() => {
    api<AdminState>('/api/admin/state')
      .then((s) => {
        setState(s)
        setFailed(false)
      })
      .catch(() => setFailed(true))
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  if (location.pathname.startsWith('/admin/join')) {
    return <Join onDone={refresh} />
  }
  if (failed) {
    return (
      <div className="app">
        <main>
          <p className="error-note">Could not reach the server. Please try again.</p>
        </main>
      </div>
    )
  }
  if (!state) {
    return (
      <div className="app">
        <main>
          <p className="section-note">Loading…</p>
        </main>
      </div>
    )
  }
  if (state.setupNeeded) {
    return <Setup codeRequired={state.setupCodeRequired} onDone={refresh} />
  }
  if (!state.loggedIn) {
    return <Login onDone={refresh} />
  }
  return (
    <Routes>
      <Route index element={<Dashboard state={state} onChange={refresh} />} />
      <Route path="content" element={<ContentEditor />} />
      <Route path="updates" element={<Announcements />} />
      <Route path="submissions" element={<Submissions />} />
      <Route path="admins" element={state.role === 'owner' ? <Admins /> : <Navigate to="/admin" replace />} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  )
}
