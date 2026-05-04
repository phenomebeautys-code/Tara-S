'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getPersonalInsights } from '@/lib/hooks/useCycleStats'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import styles from './insights.module.css'

export default function InsightsPage() {
  const t = useTranslations('insights')
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
      <header className={styles.header}>
        <p className={styles.eyebrow}>{t('eyebrow')}</p>
        <h1 className={`display ${styles.title}`}>{t('title')}</h1>
        <p className={styles.subtitle}>{t('subtitle')}</p>
      </header>

      {loading ? (
        <div className={styles.skeletonList}>
          {[1,2,3].map((n) => <div key={n} className={styles.skeletonItem} />)}
        </div>
      ) : insights.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>{t('empty_title')}</p>
          <p className={styles.emptyBody}>{t('empty_body')}</p>
          <Link href="/log" className={styles.emptyLink}>{t('empty_cta')}</Link>
        </div>
      ) : (
        <ul className={styles.list}>
          {insights.map((insight, i) => (
            <li key={i} className={styles.item}>
              <span className={styles.itemPrefix}>{t('prefix')}</span>
              <span className={styles.itemText}>{insight}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
