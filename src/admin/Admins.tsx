import { useEffect, useState } from 'react'
import AdminShell from './AdminShell'
import { api } from './api'

type AdminRow = { id: number; name: string; role: string; active: boolean; created_at: string }
type Invite = { code: string; created_at: string; expires_at: string }

export default function Admins() {
  const [admins, setAdmins] = useState<AdminRow[] | null>(null)
  const [invites, setInvites] = useState<Invite[]>([])
  const [copied, setCopied] = useState('')

  const load = () => {
    api<AdminRow[]>('/api/admin/admins').then(setAdmins)
    api<Invite[]>('/api/admin/invites').then(setInvites)
  }
  useEffect(load, [])

  async function setActive(id: number, active: boolean) {
    await api(`/api/admin/admins/${id}/active`, { method: 'POST', body: { active } })
    load()
  }

  async function createInvite() {
    await api<{ code: string }>('/api/admin/invites', { method: 'POST', body: {} })
    load()
  }

  async function revoke(code: string) {
    await api(`/api/admin/invites/${code}`, { method: 'DELETE' })
    load()
  }

  function inviteUrl(code: string) {
    return `${window.location.origin}/admin/join?code=${code}`
  }

  async function copy(code: string) {
    try {
      await navigator.clipboard.writeText(inviteUrl(code))
      setCopied(code)
      setTimeout(() => setCopied(''), 2000)
    } catch {
      /* clipboard unavailable; the URL is visible to copy manually */
    }
  }

  return (
    <AdminShell title="Administrators">
      <div className="card">
        <h2 className="card-label">Family administrators</h2>
        {!admins && <p className="section-note">Loading…</p>}
        {admins?.map((a) => (
          <div className="admin-row" key={a.id}>
            <div className="admin-row-text">
              <span className="update-title">
                {a.name} {a.role === 'owner' && <span className="pending-chip">Owner</span>}
                {!a.active && <span className="pending-chip">Deactivated</span>}
              </span>
            </div>
            {a.role !== 'owner' &&
              (a.active ? (
                <button className="button ghost danger" onClick={() => setActive(a.id, false)}>
                  Deactivate
                </button>
              ) : (
                <button className="button ghost" onClick={() => setActive(a.id, true)}>
                  Reactivate
                </button>
              ))}
          </div>
        ))}
      </div>

      <div className="card">
        <h2 className="card-label">Invitations</h2>
        <p className="section-note">
          Create an invitation link and send it privately (for example on LINE or WhatsApp) to a family member. The link
          lets them choose their own name and password, works once, and expires after 7 days.
        </p>
        <button className="button" onClick={createInvite}>
          + Create invitation link
        </button>
        {invites.map((inv) => (
          <div className="invite-row" key={inv.code}>
            <code className="invite-url">{inviteUrl(inv.code)}</code>
            <div className="row-actions">
              <button className="button ghost" onClick={() => copy(inv.code)}>
                {copied === inv.code ? 'Copied ✓' : 'Copy link'}
              </button>
              <button className="button ghost danger" onClick={() => revoke(inv.code)}>
                Revoke
              </button>
            </div>
          </div>
        ))}
      </div>
    </AdminShell>
  )
}
