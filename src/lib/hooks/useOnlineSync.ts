// useOnlineSync.ts
// Listens for the browser coming back online and flushes the offline queue.
// Dispatches a 'tara-synced' custom event after a successful flush
// so in-page components can react without shared state.

'use client'
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { flushQueue, queueCount } from '@/lib/offlineQueue'

export function useOnlineSync() {
  useEffect(() => {
    async function sync() {
      const count = await queueCount()
      if (count === 0) return
      const supabase = createClient()
      await flushQueue(supabase)
      const remaining = await queueCount()
      if (remaining < count) {
        window.dispatchEvent(new CustomEvent('tara-synced'))
      }
    }

    if (navigator.onLine) sync()

    window.addEventListener('online', sync)
    return () => window.removeEventListener('online', sync)
  }, [])
}
