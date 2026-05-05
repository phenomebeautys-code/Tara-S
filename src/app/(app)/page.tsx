'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useCycleStats } from '@/lib/hooks/useCycleStats'
import TodayCard from '@/components/TodayCard'
import PwaPrompt from '@/components/PwaPrompt'
import SplashScreen from '@/components/SplashScreen'
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
  const [showSplash, setShowSplash] = useState(true)
  const [preloadDone, setPreloadDone] = useState(false)

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

  // Preload is complete when auth is ready and cycle data has resolved
  useEffect(() => {
    if (authReady && !loading) {
      setPreloadDone(true)
    }
  }, [authReady, loading])

  const handleEnter = useCallback(() => {
    setShowSplash(false)
  }, [])

  return (
    <>
      {showSplash && (
        <SplashScreen onEnter={handleEnter} preloadDone={preloadDone} />
      )}
      <div className={styles.page}>
        <header className={styles.header}>
          <div className={styles.logoBlock}>
            <span className={`display ${styles.logo}`}>TARA-S</span>
            <Link href="/about" className={styles.aboutLink}>About</Link>
          </div>
          <span className={styles.greeting}>{getGreeting(displayName)}</span>
        </header>

        <TodayCard stats={stats} phase={phase} />

        <PwaPrompt />
      </div>
    </>
  )
}
