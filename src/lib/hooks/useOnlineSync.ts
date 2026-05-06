// useOnlineSync.ts
// Listens for the browser coming back online and flushes the offline queue.

'use client'
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { flushQueue } from '@/lib/offlineQueue'

export function useOnlineSync() {
  useEffect(() => {
    async function sync() {
      const supabase = createClient()
      await flushQueue(supabase)
    }

    // Flush immediately in case we came back online before mount
    if (navigator.onLine) sync()

    window.addEventListener('online', sync)
    return () => window.removeEventListener('online', sync)
  }, [])
}
