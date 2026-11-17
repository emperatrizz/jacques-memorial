import { useEffect, useState } from 'react'
import AdminShell from './AdminShell'
import { api } from './api'
import EulogyReader from '../eulogy/EulogyReader'
import type { EulogyParagraph } from '../eulogy/EulogyReader'
import { useEulogySocket } from '../eulogy/useEulogySocket'

type AdminEulogy = {
  paragraphs: (EulogyParagraph & { position: number })[]
  sessions: { rehearsal: { index: number } }
}

/** Admin-only guest view of the REHEARSAL session — what guests would see. */
export default function EulogyPreview() {
  const [paragraphs, setParagraphs] = useState<EulogyParagraph[]>([])
  const [index, setIndex] = useState(-1)

  useEffect(() => {
    api<AdminEulogy>('/api/admin/eulogy').then((d) => {
      setParagraphs(d.paragraphs)
      setIndex(d.sessions.rehearsal.index)
    })
  }, [])

  const connected = useEulogySocket('rehearsal', (s) => setIndex(s.index))

  return (
    <AdminShell title="Rehearsal — guest view" backTo="/admin/eulogy" backLabel="Eulogy">
      <p className="section-note">
        This is what guests' phones will show during the live reading (using the rehearsal session; the public page is
        untouched). Open it next to the presenter to watch them move together.
      </p>
      <EulogyReader paragraphs={paragraphs} liveIndex={index} active={index >= 0} connected={connected} />
    </AdminShell>
  )
}
