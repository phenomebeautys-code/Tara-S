import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export type PeriodLog = {
  id: string
  user_id: string
  start_date: string
  end_date: string | null
  flow_intensity: 'light' | 'medium' | 'heavy' | null
}

export function usePeriodLogs(userId: string | null) {
  const [logs, setLogs] = useState<PeriodLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    const supabase = createClient()
    supabase
      .from('period_logs')
      .select('*')
      .eq('user_id', userId)
      .order('start_date', { ascending: false })
      .then(({ data }) => {
        setLogs(data ?? [])
        setLoading(false)
      })
  }, [userId])

  return { logs, loading }
}

export async function logPeriodStart(
  userId: string,
  startDate: string,
  flowIntensity?: 'light' | 'medium' | 'heavy'
) {
  const supabase = createClient()
  return supabase.from('period_logs').upsert({
    user_id: userId,
    start_date: startDate,
    flow_intensity: flowIntensity ?? null,
  })
}
