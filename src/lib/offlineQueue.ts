// offlineQueue.ts
// Stores period and symptom logs in IndexedDB when the user is offline.
// Call flushQueue() when connection is restored to sync to Supabase.

const DB_NAME    = 'tara-s-offline'
const DB_VERSION = 1
const STORE      = 'queue'

export type QueuedPeriodLog = {
  type: 'period_log'
  user_id: string
  start_date: string
  flow_intensity: 'light' | 'medium' | 'heavy' | null
}

export type QueuedSymptomLog = {
  type: 'symptom_log'
  user_id: string
  log_date: string
  cramps: boolean
  bloating: boolean
  skin_breakout: boolean
  low_energy: boolean
  mood_low: boolean
  headache: boolean
}

export type QueueEntry = (QueuedPeriodLog | QueuedSymptomLog) & { id?: number }

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true })
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror   = () => reject(req.error)
  })
}

export async function enqueue(entry: QueuedPeriodLog | QueuedSymptomLog): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx    = db.transaction(STORE, 'readwrite')
    const store = tx.objectStore(STORE)
    const req   = store.add(entry)
    req.onsuccess = () => resolve()
    req.onerror   = () => reject(req.error)
  })
}

async function getAll(): Promise<QueueEntry[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx    = db.transaction(STORE, 'readonly')
    const req   = tx.objectStore(STORE).getAll()
    req.onsuccess = () => resolve(req.result)
    req.onerror   = () => reject(req.error)
  })
}

async function deleteEntry(id: number): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx    = db.transaction(STORE, 'readwrite')
    const req   = tx.objectStore(STORE).delete(id)
    req.onsuccess = () => resolve()
    req.onerror   = () => reject(req.error)
  })
}

export async function flushQueue(supabase: ReturnType<typeof import('@/lib/supabase/client').createClient>): Promise<void> {
  const entries = await getAll()
  if (entries.length === 0) return

  for (const entry of entries) {
    try {
      if (entry.type === 'period_log') {
        const { error } = await supabase.from('period_logs').upsert({
          user_id:        entry.user_id,
          start_date:     entry.start_date,
          flow_intensity: entry.flow_intensity,
        })
        if (error) throw error
      }

      if (entry.type === 'symptom_log') {
        const { error } = await supabase.from('symptom_logs').upsert({
          user_id:      entry.user_id,
          log_date:     entry.log_date,
          cramps:       entry.cramps,
          bloating:     entry.bloating,
          skin_breakout: entry.skin_breakout,
          low_energy:   entry.low_energy,
          mood_low:     entry.mood_low,
          headache:     entry.headache,
        })
        if (error) throw error
      }

      if (entry.id !== undefined) await deleteEntry(entry.id)
    } catch {
      // Leave failed entries in the queue to retry next time
    }
  }
}

export async function queueCount(): Promise<number> {
  const entries = await getAll()
  return entries.length
}
