'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useCycleStats } from '@/lib/hooks/useCycleStats'
import TodayCard from '@/components/TodayCard'
import PwaPrompt from '@/components/PwaPrompt'
import SplashScreen from '@/components/SplashScreen'
import styles from './home.module.css'

const SPLASH_KEY = 'tara-splash-shown'

function getGreeting(name?: string | null) {
  const h = new Date().getHours()
  const time = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
  return name ? `${time}, ${name}` : time
}

export default function HomePage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [displayName, setDisplayName] = useState<string | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [preloadDone, setPreloadDone] = useState(false)

  // Splash shows only on first visit per session
  const [showSplash, setShowSplash] = useState(() => {
    if (typeof window === 'undefined') return false
    return sessionStorage.getItem(SPLASH_KEY) !== '1'
  })

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

  useEffect(() => {
    if (authReady && !loading) {
      setPreloadDone(true)
    }
  }, [authReady, loading])

  const handleEnter = useCallback(() => {
    sessionStorage.setItem(SPLASH_KEY, '1')
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
