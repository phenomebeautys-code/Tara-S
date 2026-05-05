'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useCycleStats } from '@/lib/hooks/useCycleStats'
import TodayCard from '@/components/TodayCard'
import PwaPrompt from '@/components/PwaPrompt'
import styles from '../home.module.css'

export default function TodayPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [displayName, setDisplayName] = useState<string | null>(null)
  const [greeting, setGreeting] = useState('')
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    // All browser-only logic here — no hydration mismatch possible
    const h = new Date().getHours()
    const time = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'

    const supabase = createClient()
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        // No session — send back to splash regardless of how they got here
        router.replace('/')
        return
      }
      const uid = data.session.user.id
      setUserId(uid)

      const { data: profile } = await supabase
        .from('users')
        .select('display_name')
        .eq('id', uid)
        .single()

      const name = profile?.display_name ?? null
      setDisplayName(name)
      setGreeting(name ? `${time}, ${name}` : time)
      setAuthChecked(true)
    })
  }, [router])

  const { stats, phase, loading } = useCycleStats(userId)

  // Render nothing until auth is confirmed — prevents flash of data
  if (!authChecked) return null

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.logoBlock}>
          <span className={`display ${styles.logo}`}>TARA-S</span>
          <Link href="/about" className={styles.aboutLink}>About</Link>
        </div>
        <span className={styles.greeting}>{greeting}</span>
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
