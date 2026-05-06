'use client'
import { useEffect, useState, Suspense, lazy } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { getPersonalInsights } from '@/lib/hooks/useCycleStats'
import IrregularCycleDrawer from '@/components/IrregularCycleDrawer'
import { IRREGULAR_THRESHOLD_DAYS } from '@/lib/irregularCycleContent'
import styles from './insights.module.css'

const CycleCalendar = lazy(() => import('@/components/CycleCalendar'))

function parseInsight(raw: string, t: ReturnType<typeof useTranslations<'insights'>>): { text: string; isIrregular: boolean } {
  if (raw === 'need_more_data') return { text: t('need_more_data'), isIrregular: false }
  if (raw === 'variability_consistent') return { text: t('variability_consistent'), isIrregular: false }
  if (raw === 'variability_regular') return { text: t('variability_regular'), isIrregular: false }
  if (raw.startsWith('avg_cycle:')) {
    const days = raw.split(':')[1]
    return { text: t('avg_cycle', { days }), isIrregular: false }
  }
  if (raw.startsWith('avg_duration:')) {
    const days = raw.split(':')[1]
    return { text: t('avg_duration', { days }), isIrregular: false }
  }
  if (raw.startsWith('variability_irregular:')) {
    const days = parseInt(raw.split(':')[1], 10)
    return {
      text: t('variability_irregular', { days }),
      isIrregular: days >= IRREGULAR_THRESHOLD_DAYS,
    }
  }
  return { text: raw, isIrregular: false }
}

export default function InsightsPage() {
  const t = useTranslations('insights')
  const [insights, setInsights] = useState<{ text: string; isIrregular: boolean }[]>([])
  const [loading, setLoading] = useState(true)
  const [needMoreData, setNeedMoreData] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

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
              <span className={styles.itemText}>{insight.text}</span>
              {insight.isIrregular && (
                <button
                  className={styles.irregularFlag}
                  onClick={() => setDrawerOpen(true)}
                  aria-label="Learn more about irregular cycles"
                >
                  Why might this happen?
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {userId && (
        <Suspense fallback={<div style={{ height: 280 }} />}>
          <CycleCalendar userId={userId} />
        </Suspense>
      )}

      <IrregularCycleDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  )
}
