import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export type CycleStats = {
  avg_cycle_length: number | null
  avg_period_duration: number | null
  cycle_variability: number | null
  last_period_start: string | null
  predicted_next_start: string | null
  safety_window_start: string | null
  total_cycles_logged: number
}

export type CyclePhase = {
  phase_name: string
  cycle_day: number
  phase_skin_note: string
}

export type AppointmentRisk = {
  risk_level: 'low' | 'medium' | 'high' | 'unknown'
  risk_reason: string
}

export function useCycleStats(userId: string | null) {
  const [stats, setStats] = useState<CycleStats | null>(null)
  const [phase, setPhase] = useState<CyclePhase | null>(null)
  const [loading, setLoading] = useState(true)
  // Stored user preference - used as fallback before the 28-day default
  const [storedCycleLength, setStoredCycleLength] = useState<number | null>(null)
  const [storedPeriodDuration, setStoredPeriodDuration] = useState<number | null>(null)

  useEffect(() => {
    if (!userId) return
    const supabase = createClient()

    async function load() {
      setLoading(true)
      const today = new Date().toISOString().split('T')[0]

      const [{ data: statsData }, { data: phaseData }, { data: userData }] = await Promise.all([
        supabase
          .from('cycle_stats')
          .select('*')
          .eq('user_id', userId)
          .single(),
        supabase.rpc('get_cycle_phase', {
          p_user_id: userId,
          p_date: today,
        }),
        supabase
          .from('users')
          .select('cycle_length, period_duration')
          .eq('id', userId)
          .single(),
      ])

      setStats(statsData)
      setPhase(phaseData?.[0] ?? null)
      if (userData?.cycle_length) setStoredCycleLength(userData.cycle_length)
      if (userData?.period_duration) setStoredPeriodDuration(userData.period_duration)
      setLoading(false)
    }

    load()
  }, [userId])

  return { stats, phase, loading, storedCycleLength, storedPeriodDuration }
}

export async function getAppointmentRisk(
  userId: string,
  appointmentDate: string
): Promise<AppointmentRisk> {
  const supabase = createClient()
  const { data } = await supabase.rpc('get_appointment_risk', {
    p_user_id: userId,
    p_appt_date: appointmentDate,
  })
  return data?.[0] ?? { risk_level: 'unknown', risk_reason: 'Unable to assess risk.' }
}

export async function getPersonalInsights(userId: string): Promise<string[]> {
  const supabase = createClient()
  const { data } = await supabase.rpc('get_personal_insights', { p_user_id: userId })
  return (data ?? []).map((r: { insight: string }) => r.insight)
}
