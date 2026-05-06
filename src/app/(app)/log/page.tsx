'use client'
import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { logPeriodStart } from '@/lib/hooks/usePeriodLogs'
import { enqueue } from '@/lib/offlineQueue'
import styles from './log.module.css'

const SYMPTOM_KEYS = ['cramps', 'bloating', 'skin_breakout', 'low_energy', 'mood_low', 'headache'] as const
type SymptomKey = typeof SYMPTOM_KEYS[number]

export default function LogPage() {
  const t = useTranslations('log')
  const [periodDate, setPeriodDate] = useState('')
  const [flow, setFlow] = useState<'light' | 'medium' | 'heavy' | ''>('')
  const [activeSymptoms, setActiveSymptoms] = useState<Set<SymptomKey>>(new Set())
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [syncStatus, setSyncStatus] = useState<null | 'pending' | 'synced'>(null)

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

  async function handleSave() {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }

    const online = navigator.onLine

    if (periodDate) {
      if (online) {
        await logPeriodStart(user.id, periodDate, flow || undefined)
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
    setTimeout(() => { window.location.href = '/today' }, 800)
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
    </div>
  )
}
