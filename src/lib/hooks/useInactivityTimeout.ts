import { useEffect, useRef, useCallback } from 'react'

const TIMEOUT_KEY = 'tara-inactivity-timeout'
const EVENTS = ['mousemove', 'mousedown', 'touchstart', 'keydown', 'scroll']

export type TimeoutValue = 0 | 60000 | 180000 | 300000

export const TIMEOUT_OPTIONS: { label: string; value: TimeoutValue }[] = [
  { label: 'Off',   value: 0      },
  { label: '1 min', value: 60000  },
  { label: '3 min', value: 180000 },
  { label: '5 min', value: 300000 },
]

export function getSavedTimeout(): TimeoutValue {
  if (typeof window === 'undefined') return 180000
  const saved = localStorage.getItem(TIMEOUT_KEY)
  if (saved === null) return 180000 // default 3 min
  return Number(saved) as TimeoutValue
}

export function saveTimeout(value: TimeoutValue) {
  localStorage.setItem(TIMEOUT_KEY, String(value))
}

export function useInactivityTimeout(onExpire: () => void, timeoutMs: TimeoutValue) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const reset = useCallback(() => {
    if (timer.current) clearTimeout(timer.current)
    if (timeoutMs === 0) return
    timer.current = setTimeout(onExpire, timeoutMs)
  }, [onExpire, timeoutMs])

  useEffect(() => {
    if (timeoutMs === 0) {
      if (timer.current) clearTimeout(timer.current)
      return
    }
    EVENTS.forEach((e) => window.addEventListener(e, reset, { passive: true }))
    reset()
    return () => {
      EVENTS.forEach((e) => window.removeEventListener(e, reset))
      if (timer.current) clearTimeout(timer.current)
    }
  }, [reset, timeoutMs])

  return reset
}
