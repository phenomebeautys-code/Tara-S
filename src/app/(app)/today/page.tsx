'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { useCycleStats } from '@/lib/hooks/useCycleStats'
import TodayCard from '@/components/TodayCard'
import PwaPrompt from '@/components/PwaPrompt'
import styles from '../home.module.css'

export default function TodayPage() {
  const t = useTranslations('home')
  const tCommon = useTranslations('common')
  const tNav = useTranslations('nav')
  const [userId, setUserId] = useState<string | null>(null)
  const [displayName, setDisplayName] = useState<string | null>(null)
  const [greeting, setGreeting] = useState('')
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    const h = new Date().getHours()
    const time =
      h < 12 ? t('greeting_morning') : h < 17 ? t('greeting_afternoon') : t('greeting_evening')

    const supabase = createClient()
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        window.location.href = '/'
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
  }, [t])

  const { stats, phase, loading } = useCycleStats(userId)

  if (!authChecked) return null

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.logoBlock}>
          <span className={`display ${styles.logo}`}>{tCommon('app_name')}</span>
          <Link href="/about" className={styles.aboutLink}>{tNav('about')}</Link>
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
