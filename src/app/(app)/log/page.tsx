'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { logPeriodStart } from '@/lib/hooks/usePeriodLogs'
import { useRouter } from 'next/navigation'
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
  const router = useRouter()

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

    if (periodDate) {
      await logPeriodStart(user.id, periodDate, flow || undefined)
    }

    if (activeSymptoms.size > 0) {
      const today = new Date().toISOString().split('T')[0]
      const payload: Record<string, unknown> = { user_id: user.id, log_date: today }
      SYMPTOM_KEYS.forEach((key) => { payload[key] = activeSymptoms.has(key) })
      await supabase.from('symptom_logs').upsert(payload)
    }

    setSaved(true)
    setSaving(false)
    setTimeout(() => router.push('/'), 800)
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>{t('eyebrow')}</p>
        <h1 className={`display ${styles.title}`}>{t('title')}</h1>
        <p className={styles.meaning}>{t('meaning')}</p>
        <p className={styles.body}>{t('body')}</p>
      </header>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('section_period')}</h2>
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
