import { useEffect, useState } from 'react'
import AdminShell from './AdminShell'
import LangSwitcher from '../components/LangSwitcher'
import { api } from './api'
import EulogyReader from '../eulogy/EulogyReader'
import type { EulogyParagraph } from '../eulogy/EulogyReader'
import { useEulogySocket } from '../eulogy/useEulogySocket'

type AdminEulogy = {
  paragraphs: (EulogyParagraph & { position: number })[]
  sessions: { rehearsal: { index: number; revealed: number } }
}

/** Admin-only guest view of the REHEARSAL session — what guests would see. */
export default function EulogyPreview() {
  const [paragraphs, setParagraphs] = useState<EulogyParagraph[]>([])
  const [index, setIndex] = useState(-1)
  const [revealed, setRevealed] = useState(0)

  useEffect(() => {
    api<AdminEulogy>('/api/admin/eulogy').then((d) => {
      setParagraphs(d.paragraphs)
      setIndex(d.sessions.rehearsal.index)
      setRevealed(d.sessions.rehearsal.revealed)
    })
  }, [])

  const connected = useEulogySocket('rehearsal', (s) => {
    setIndex(s.index)
    setRevealed(s.revealed)
  })

  return (
    <AdminShell title="Rehearsal — guest view" backTo="/admin/eulogy" backLabel="Eulogy">
      <div className="lang-bar preview-lang-bar">
        <LangSwitcher />
      </div>
      <p className="section-note">
        This is what guests' phones will show during the live reading (using the rehearsal session; the public page is
        untouched). Paragraphs appear one by one, exactly as guests will experience them — switch languages freely, it
        never affects the presenter.
      </p>
      <EulogyReader
        paragraphs={paragraphs.slice(0, revealed)}
        liveIndex={index}
        active={index >= 0}
        connected={connected}
      />
    </AdminShell>
  )
}
