'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useCycleStats } from '@/lib/hooks/useCycleStats'
import TodayCard from '@/components/TodayCard'
import PwaPrompt from '@/components/PwaPrompt'
import styles from './home.module.css'

function getGreeting(name?: string | null) {
  const h = new Date().getHours()
  const time = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
  return name ? `${time}, ${name}` : time
}

export default function HomePage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [displayName, setDisplayName] = useState<string | null>(null)
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      const uid = data.user?.id ?? null
      setUserId(uid)
      if (uid) {
        const { data: profile } = await supabase
          .from('users')
          .select('display_name')
          .eq('id', uid)
          .single()
        setDisplayName(profile?.display_name ?? null)
      }
      setAuthReady(true)
    })
  }, [])

  const { stats, phase, loading } = useCycleStats(userId)

  const showSkeleton = !authReady || loading

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <span className={`display ${styles.logo}`}>TARA-S</span>
        <div className={styles.headerRight}>
          <span className={styles.greeting}>{getGreeting(displayName)}</span>
          <Link href="/about" className={styles.aboutLink}>About</Link>
        </div>
      </header>

      {showSkeleton ? (
        <div className={styles.skeleton} />
      ) : (
        <TodayCard stats={stats} phase={phase} />
      )}

      <PwaPrompt />
    </div>
  )
}
