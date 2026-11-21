import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { L10n } from './i18n'

export type Update = {
  id: string
  date: string
  title: Partial<L10n>
  body?: Partial<L10n>
  link?: string
}

export type ScheduleItem = {
  date?: string | null
  time?: Partial<L10n> | null
  title: Partial<L10n>
}

export type SiteContent = {
  person: { fullName: string; thaiName: string }
  ceremony: {
    venueName: Partial<L10n> | null
    venueAddress: Partial<L10n> | null
    mapsUrl: string | null
    livestreamUrl?: string | null
    livestreamNote?: Partial<L10n> | null
    schedule: ScheduleItem[]
    note: Partial<L10n> | null
  }
  flowers: {
    deliveryAddress: Partial<L10n> | null
    recipient: Partial<L10n> | null
    instructions: Partial<L10n> | null
    abroad: Partial<L10n> | null
    florists?: { name: string; url: string; note?: Partial<L10n> | null }[]
  }
}

export function youtubeEmbedUrl(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:live|embed|shorts)\/|youtu\.be\/|youtube\.com\/watch\?v=)([\w-]{6,})/)
  return m ? `https://www.youtube.com/embed/${m[1]}` : null
}

type ContentState = {
  content: SiteContent | null
  updates: Update[]
  error: boolean
  loaded: boolean
}

const ContentContext = createContext<ContentState>({
  content: null,
  updates: [],
  error: false,
  loaded: false,
})

export function ContentProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ContentState>({
    content: null,
    updates: [],
    error: false,
    loaded: false,
  })

  useEffect(() => {
    let cancelled = false
    Promise.all([
      fetch('/api/content').then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status))))),
      fetch('/api/updates').then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status))))),
    ])
      .then(([content, updates]) => {
        if (!cancelled) setState({ content, updates, error: false, loaded: true })
      })
      .catch(() => {
        if (!cancelled) setState((s) => ({ ...s, error: true, loaded: true }))
      })
    return () => {
      cancelled = true
    }
  }, [])

  return <ContentContext.Provider value={state}>{children}</ContentContext.Provider>
}

export function useContent() {
  return useContext(ContentContext)
}
