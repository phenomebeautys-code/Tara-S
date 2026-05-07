'use client'
import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { logPeriodStart } from '@/lib/hooks/usePeriodLogs'
import { enqueue } from '@/lib/offlineQueue'
import styles from './log.module.css'

const SYMPTOM_KEYS = ['cramps', 'bloating', 'skin_breakout', 'low_energy', 'mood_low', 'headache'] as const
type SymptomKey = typeof SYMPTOM_KEYS[number]

const DRIFT_THRESHOLD = 3 // days

export default function LogPage() {
  const t = useTranslations('log')
  const [periodDate, setPeriodDate] = useState('')
  const [flow, setFlow] = useState<'light' | 'medium' | 'heavy' | ''>('')
  const [activeSymptoms, setActiveSymptoms] = useState<Set<SymptomKey>>(new Set())
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [syncStatus, setSyncStatus] = useState<null | 'pending' | 'synced'>(null)

  // Cycle-length nudge state
  const [showNudge, setShowNudge] = useState(false)
  const [nudgeDismissed, setNudgeDismissed] = useState(false)
  const [newCycleLength, setNewCycleLength] = useState('')
  const [nudgeSaved, setNudgeSaved] = useState(false)

  useEffect(() => {
    function onSynced() {
      setSyncStatus((prev) => {
        if (prev === 'pending') {
          setTimeout(() => setSyncStatus(null), 2000)
          return 'synced'
        }
        return prev
      })
    }
    window.addEventListener('tara-synced', onSynced)
    return () => window.removeEventListener('tara-synced', onSynced)
  }, [])

  function toggleSymptom(key: SymptomKey) {
    setActiveSymptoms((prev) => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  function clearDate() {
    setPeriodDate('')
    setFlow('')
  }

  async function checkCycleDrift(userId: string) {
    const supabase = createClient()
    const { data: logs } = await supabase
      .from('period_logs')
      .select('start_date')
      .eq('user_id', userId)
      .order('start_date', { ascending: false })
      .limit(2)

    if (!logs || logs.length < 2) return

    const { data: userData } = await supabase
      .from('users')
      .select('cycle_length')
      .eq('id', userId)
      .single()

    if (!userData?.cycle_length) return

    const latest = new Date(logs[0].start_date)
    const previous = new Date(logs[1].start_date)
    const gap = Math.round((latest.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24))
    const delta = Math.abs(gap - userData.cycle_length)

    if (delta > DRIFT_THRESHOLD) {
      setShowNudge(true)
    }
  }

  async function handleNudgeUpdate() {
    const parsed = parseInt(newCycleLength, 10)
    if (!parsed || parsed < 15 || parsed > 60) return
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('users').update({ cycle_length: parsed }).eq('id', user.id)
    setNudgeSaved(true)
    setTimeout(() => {
      setShowNudge(false)
      setNudgeDismissed(true)
      setNudgeSaved(false)
      setNewCycleLength('')
    }, 1000)
  }

  async function handleSave() {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }

    const online = navigator.onLine

    if (periodDate) {
      if (online) {
        await logPeriodStart(user.id, periodDate, flow || undefined)
        // Only check drift when we have a real period start logged and online
        if (!nudgeDismissed) {
          await checkCycleDrift(user.id)
        }
      } else {
        await enqueue({
          type: 'period_log',
          user_id: user.id,
          start_date: periodDate,
          flow_intensity: flow || null,
        })
      }
    }

    if (activeSymptoms.size > 0) {
      const today = new Date().toISOString().split('T')[0]
      if (online) {
        const payload: Record<string, unknown> = { user_id: user.id, log_date: today }
        SYMPTOM_KEYS.forEach((key) => { payload[key] = activeSymptoms.has(key) })
        await supabase.from('symptom_logs').upsert(payload)
      } else {
        await enqueue({
          type: 'symptom_log',
          user_id: user.id,
          log_date: today,
          cramps:       activeSymptoms.has('cramps'),
          bloating:     activeSymptoms.has('bloating'),
          skin_breakout: activeSymptoms.has('skin_breakout'),
          low_energy:   activeSymptoms.has('low_energy'),
          mood_low:     activeSymptoms.has('mood_low'),
          headache:     activeSymptoms.has('headache'),
        })
        setSyncStatus('pending')
      }
    }

    setSaved(true)
    setSaving(false)
    setTimeout(() => {
      setSaved(false)
      setPeriodDate('')
      setFlow('')
      setActiveSymptoms(new Set())
    }, 1200)
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerRow}>
          <p className={styles.eyebrow}>{t('eyebrow')}</p>
          {syncStatus && (
            <span className={styles.syncStatus} data-status={syncStatus}>
              {syncStatus === 'pending' ? 'Saved. Syncing soon.' : 'Synced.'}
            </span>
          )}
        </div>
        <h1 className={`display ${styles.title}`}>{t('title')}</h1>
        <p className={styles.meaning}>{t('meaning')}</p>
        <p className={styles.body}>{t('body')}</p>
      </header>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('section_period')}</h2>
        <p className={styles.sectionSub}>{t('section_period_sub')}</p>
        <div className={styles.dateWrap}>
          <input
            type="date"
            value={periodDate}
            onChange={(e) => setPeriodDate(e.target.value ?? '')}
            max={new Date().toISOString().split('T')[0]}
            className={styles.dateInput}
          />
          {periodDate && (
            <button
              type="button"
              className={styles.dateClear}
              onClick={clearDate}
              aria-label="Clear date"
            >
              &#x2715;
            </button>
          )}
        </div>
        {periodDate && (
          <div className={styles.flowRow}>
            {(['light', 'medium', 'heavy'] as const).map((f) => (
              <button
                key={f}
                className={`${styles.flowBtn} ${flow === f ? styles.flowActive : ''}`}
                onClick={() => setFlow(f)}
              >
                {t(`flow_${f}`)}
              </button>
            ))}
          </div>
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('section_symptoms')}</h2>
        <div className={styles.symptomGrid}>
          {SYMPTOM_KEYS.map((key) => (
            <button
              key={key}
              className={`${styles.symptomBtn} ${activeSymptoms.has(key) ? styles.symptomActive : ''}`}
              onClick={() => toggleSymptom(key)}
            >
              {t(`symptom_${key}`)}
            </button>
          ))}
        </div>
      </section>

      <button
        className={styles.saveBtn}
        onClick={handleSave}
        disabled={saving || saved || (!periodDate && activeSymptoms.size === 0)}
      >
        {saved ? t('saved') : saving ? t('saving') : t('save')}
      </button>

      {showNudge && (
        <div className={styles.nudge}>
          <p className={styles.nudgeText}>
            Your rhythm may be shifting. Does this feel right to you?
          </p>
          <div className={styles.nudgeRow}>
            <label className={styles.nudgeLabel} htmlFor="nudge-cycle-input">
              Your cycle is usually
            </label>
            <input
              id="nudge-cycle-input"
              type="number"
              min={15}
              max={60}
              value={newCycleLength}
              onChange={(e) => setNewCycleLength(e.target.value)}
              className={styles.nudgeInput}
              placeholder="28"
              aria-label="Update cycle length in days"
            />
            <span className={styles.nudgeUnit}>days</span>
            <button
              className={styles.nudgeUpdateBtn}
              onClick={handleNudgeUpdate}
              disabled={nudgeSaved || !newCycleLength}
            >
              {nudgeSaved ? 'Saved' : 'Update'}
            </button>
            <button
              className={styles.nudgeDismiss}
              onClick={() => { setShowNudge(false); setNudgeDismissed(true) }}
              aria-label="Dismiss"
            >
              &#x2715;
            </button>
          </div>
        </div>
      )}

      <p className={styles.saveHint}>{t('save_hint')}</p>
    </div>
  )
}
