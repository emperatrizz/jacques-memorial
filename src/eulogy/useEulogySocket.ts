import { useEffect, useRef, useState } from 'react'

export type EulogyState = {
  session: 'live' | 'rehearsal'
  index: number
  active: boolean
  published: boolean
  count: number
  revealed: number
}

/**
 * Subscribes to the eulogy WebSocket with automatic reconnection (backoff up
 * to 15 s) and an HTTP polling fallback while disconnected, so guests stay in
 * sync even on flaky venue Wi-Fi.
 */
export function useEulogySocket(session: 'live' | 'rehearsal', onState: (s: EulogyState) => void) {
  const [connected, setConnected] = useState(false)
  const onStateRef = useRef(onState)
  onStateRef.current = onState

  useEffect(() => {
    let ws: WebSocket | null = null
    let closed = false
    let attempts = 0
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null
    let pollTimer: ReturnType<typeof setInterval> | null = null

    const poll = async () => {
      try {
        const r = await fetch('/api/eulogy/state')
        if (r.ok) {
          const s = await r.json()
          onStateRef.current({ session: 'live', ...s })
        }
      } catch {
        /* still offline */
      }
    }

    const connect = () => {
      if (closed) return
      const proto = window.location.protocol === 'https:' ? 'wss' : 'ws'
      ws = new WebSocket(`${proto}://${window.location.host}/ws/eulogy?session=${session}`)
      ws.onopen = () => {
        attempts = 0
        setConnected(true)
        if (pollTimer) {
          clearInterval(pollTimer)
          pollTimer = null
        }
      }
      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data)
          if (msg.type === 'state') onStateRef.current(msg)
        } catch {
          /* ignore malformed */
        }
      }
      ws.onclose = () => {
        setConnected(false)
        if (closed) return
        if (session === 'live' && !pollTimer) pollTimer = setInterval(poll, 10_000)
        attempts++
        const delay = Math.min(15_000, 1000 * 2 ** Math.min(attempts, 4))
        reconnectTimer = setTimeout(connect, delay)
      }
      ws.onerror = () => ws?.close()
    }

    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        if (session === 'live') poll()
        if (ws && ws.readyState !== WebSocket.OPEN && ws.readyState !== WebSocket.CONNECTING) connect()
      }
    }

    connect()
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      closed = true
      document.removeEventListener('visibilitychange', onVisible)
      if (reconnectTimer) clearTimeout(reconnectTimer)
      if (pollTimer) clearInterval(pollTimer)
      ws?.close()
    }
  }, [session])

  return connected
}
