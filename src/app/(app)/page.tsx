'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useCycleStats } from '@/lib/hooks/useCycleStats'
import TodayCard from '@/components/TodayCard'
import PwaPrompt from '@/components/PwaPrompt'
import styles from './home.module.css'

export default function HomePage() {
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null))
  }, [])

  const { stats, phase, loading } = useCycleStats(userId)

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <span className={`display ${styles.logo}`}>TARA-S</span>
      </header>

      {loading ? (
        <div className={styles.skeleton} />
      ) : (
        <TodayCard stats={stats} phase={phase} />
      )}

      <PwaPrompt />
    </div>
  )
}
