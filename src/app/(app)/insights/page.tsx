'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getPersonalInsights } from '@/lib/hooks/useCycleStats'
import styles from './insights.module.css'

export default function InsightsPage() {
  const [insights, setInsights] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get session from local cache first — no network round trip
    const supabase = createClient()
    supabase.auth.getSession().then(async ({ data }) => {
      const uid = data.session?.user?.id
      if (uid) {
        const result = await getPersonalInsights(uid)
        setInsights(result)
      }
      setLoading(false)
    })
  }, [])

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Insights</p>
        <h1 className={`display ${styles.title}`}>What your body is telling you.</h1>
        <p className={styles.subtitle}>Patterns drawn from what you have logged.</p>
      </header>

      {loading ? (
        <div className={styles.skeletonList}>
          {[1,2,3].map((n) => <div key={n} className={styles.skeletonItem} />)}
        </div>
      ) : insights.length === 0 ? (
        <div className={styles.empty}>
          <p className={`display ${styles.emptyTitle}`}>Tara is listening.</p>
          <p className={styles.emptyBody}>She will find your patterns as you go.</p>
        </div>
      ) : (
        <ul className={styles.list}>
          {insights.map((insight, i) => (
            <li key={i} className={styles.item}>
              <span className={styles.itemPrefix}>Tara noticed</span>
              <span className={styles.itemText}>{insight}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
