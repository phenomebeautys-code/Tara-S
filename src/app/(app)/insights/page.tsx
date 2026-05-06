'use client'
import { useEffect, useState, Suspense, lazy } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { getPersonalInsights } from '@/lib/hooks/useCycleStats'
import styles from './insights.module.css'

const CycleCalendar = lazy(() => import('@/components/CycleCalendar'))

function parseInsight(raw: string, t: ReturnType<typeof useTranslations<'insights'>>): string {
  if (raw === 'need_more_data') return t('need_more_data')
  if (raw === 'variability_consistent') return t('variability_consistent')
  if (raw === 'variability_regular') return t('variability_regular')
  if (raw.startsWith('avg_cycle:')) {
    const days = raw.split(':')[1]
    return t('avg_cycle', { days })
  }
  if (raw.startsWith('avg_duration:')) {
    const days = raw.split(':')[1]
    return t('avg_duration', { days })
  }
  if (raw.startsWith('variability_irregular:')) {
    const days = raw.split(':')[1]
    return t('variability_irregular', { days })
  }
  return raw
}

export default function InsightsPage() {
  const t = useTranslations('insights')
  const [insights, setInsights] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [needMoreData, setNeedMoreData] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(async ({ data }) => {
      const uid = data.session?.user?.id
      if (uid) {
        setUserId(uid)
        const raw = await getPersonalInsights(uid)
        if (raw.length === 1 && raw[0] === 'need_more_data') {
          setNeedMoreData(true)
        } else {
          setInsights(raw.map((r) => parseInsight(r, t)))
        }
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
          {[1, 2, 3].map((n) => <div key={n} className={styles.skeletonItem} />)}
        </div>
      ) : needMoreData ? (
        <div className={styles.empty}>
          <p className={`display ${styles.emptyTitle}`}>{t('need_more_data_title')}</p>
          <p className={styles.emptyBody}>{t('need_more_data_body')}</p>
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

      {userId && (
        <Suspense fallback={<div style={{ height: 280 }} />}>
          <CycleCalendar userId={userId} />
        </Suspense>
      )}
    </div>
  )
}
