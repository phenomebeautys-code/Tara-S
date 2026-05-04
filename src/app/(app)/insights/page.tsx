'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getPersonalInsights } from '@/lib/hooks/useCycleStats'
import styles from './insights.module.css'

export default function InsightsPage() {
  const [insights, setInsights] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        const result = await getPersonalInsights(data.user.id)
        setInsights(result)
      }
      setLoading(false)
    })
  }, [])

  return (
    <div className={styles.page}>
      <h1 className={`display ${styles.title}`}>Your Insights</h1>
      <p className={styles.subtitle}>Based on your cycle history</p>

      {loading ? (
        <div className={styles.skeleton} />
      ) : insights.length === 0 ? (
        <p className={styles.empty}>No insights yet — log your first period to get started.</p>
      ) : (
        <ul className={styles.list}>
          {insights.map((insight, i) => (
            <li key={i} className={styles.item}>{insight}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
