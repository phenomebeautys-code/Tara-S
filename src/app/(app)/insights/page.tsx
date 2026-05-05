'use client'
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { getPersonalInsights } from '@/lib/hooks/useCycleStats'
import styles from './insights.module.css'

export default function InsightsPage() {
  const t = useTranslations('insights')
  const [insights, setInsights] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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
          <p className={`display ${styles.emptyTitle}`}>{t('empty_title')}</p>
          <p className={styles.emptyBody}>{t('empty_body')}</p>
        </div>
      ) : (
        <ul className={styles.list}>
          {insights.map((insight, i) => (
            <li key={i} className={styles.item}>
              <span className={styles.itemPrefix}>
                <span className={styles.itemPrefixWord}>{t('prefix')}</span>
              </span>
              <span className={styles.itemText}>{insight}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
