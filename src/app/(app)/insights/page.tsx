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

  // Rhythm settings state
  const [cycleLength, setCycleLength] = useState('')
  const [periodDuration, setPeriodDuration] = useState('')
  const [rhythmSaving, setRhythmSaving] = useState(false)
  const [rhythmSaved, setRhythmSaved] = useState(false)
  const [rhythmError, setRhythmError] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(async ({ data }) => {
      const uid = data.session?.user?.id
      if (uid) {
        setUserId(uid)

        // Load existing rhythm values
        const { data: userData } = await supabase
          .from('users')
          .select('cycle_length, period_duration')
          .eq('id', uid)
          .single()

        if (userData?.cycle_length) setCycleLength(String(userData.cycle_length))
        if (userData?.period_duration) setPeriodDuration(String(userData.period_duration))

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

  async function handleRhythmSave() {
    const parsedCycle = cycleLength ? parseInt(cycleLength, 10) : null
    const parsedDuration = periodDuration ? parseInt(periodDuration, 10) : null

    if (parsedCycle !== null && (parsedCycle < 15 || parsedCycle > 60)) { setRhythmError(true); return }
    if (parsedDuration !== null && (parsedDuration < 1 || parsedDuration > 14)) { setRhythmError(true); return }
    if (!parsedCycle && !parsedDuration) return

    setRhythmError(false)
    setRhythmSaving(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setRhythmSaving(false); return }

    const updates: Record<string, number> = {}
    if (parsedCycle) updates.cycle_length = parsedCycle
    if (parsedDuration) updates.period_duration = parsedDuration

    await supabase.from('users').update(updates).eq('id', user.id)

    setRhythmSaving(false)
    setRhythmSaved(true)
    setTimeout(() => setRhythmSaved(false), 2500)
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>{t('eyebrow')}</p>
        <h1 className={`display ${styles.title}`}>{t('title')}</h1>
        <p className={styles.subtitle}>{t('subtitle')}</p>
      </header>

      {/* Your rhythm settings block — always shown at top */}
      <div className={styles.rhythmBlock}>
        <p className={styles.rhythmEyebrow}>Your rhythm</p>
        <p className={styles.rhythmBody}>
          Every body moves to its own timing. If your cycle is longer, shorter, or simply not 28 days, tell{' '}
          <span className={styles.rhythmBrandName}>tara-s</span>. Everything will adjust to fit you.
        </p>

        <div className={styles.rhythmRow}>
          <label className={styles.rhythmLabel} htmlFor="cycle-length-input">
            My cycle is usually
          </label>
          <div className={styles.rhythmInputGroup}>
            <input
              id="cycle-length-input"
              type="number"
              min={15}
              max={60}
              value={cycleLength}
              onChange={(e) => { setCycleLength(e.target.value); setRhythmError(false) }}
              className={styles.rhythmInput}
              placeholder="28"
              aria-label="My cycle is usually how many days"
            />
            <span className={styles.rhythmUnit}>days</span>
          </div>
        </div>

        <div className={styles.rhythmRow}>
          <label className={styles.rhythmLabel} htmlFor="period-duration-input">
            My period usually lasts
          </label>
          <div className={styles.rhythmInputGroup}>
            <input
              id="period-duration-input"
              type="number"
              min={1}
              max={14}
              value={periodDuration}
              onChange={(e) => { setPeriodDuration(e.target.value); setRhythmError(false) }}
              className={styles.rhythmInput}
              placeholder="5"
              aria-label="My period usually lasts how many days"
            />
            <span className={styles.rhythmUnit}>days</span>
          </div>
        </div>

        {rhythmError && (
          <p className={styles.rhythmError}>
            Please enter a cycle length between 15 and 60 days, and a period duration between 1 and 14 days.
          </p>
        )}

        <button
          className={styles.rhythmSaveBtn}
          onClick={handleRhythmSave}
          disabled={rhythmSaving || rhythmSaved || (!cycleLength && !periodDuration)}
        >
          {rhythmSaved
            ? 'Saved. TARA-S will use this going forward.'
            : rhythmSaving
              ? 'Saving...'
              : 'Save my rhythm'}
        </button>
      </div>

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
