'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { logPeriodStart } from '@/lib/hooks/usePeriodLogs'
import { useRouter } from 'next/navigation'
import styles from './log.module.css'

const SYMPTOM_KEYS = ['cramps', 'bloating', 'skin_breakout', 'low_energy', 'mood_low', 'headache'] as const
type SymptomKey = typeof SYMPTOM_KEYS[number]

const SYMPTOM_LABELS: Record<SymptomKey, string> = {
  cramps: 'Cramps',
  bloating: 'Bloating',
  skin_breakout: 'Skin breakout',
  low_energy: 'Low energy',
  mood_low: 'Mood low',
  headache: 'Headache',
}

export default function LogPage() {
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
        <p className={styles.eyebrow}>Log</p>
        <h1 className={`display ${styles.title}`}>tara-s</h1>
        <p className={styles.meaning}>The woman, in Khoekhoegowab.</p>
        <p className={styles.body}>She has always known her body. This space is yours to remember.</p>
      </header>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>When did your period begin?</h2>
        <p className={styles.sectionSub}>Enter the date your last period started.</p>
        <div className={styles.dateWrap}>
          <input
            type="date"
            value={periodDate}
            onChange={(e) => setPeriodDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className={styles.dateInput}
          />
        </div>
        {periodDate && (
          <div className={styles.flowRow}>
            {(['light', 'medium', 'heavy'] as const).map((f) => (
              <button
                key={f}
                className={`${styles.flowBtn} ${flow === f ? styles.flowActive : ''}`}
                onClick={() => setFlow(f)}
              >
                {f}
              </button>
            ))}
          </div>
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>How are you feeling today?</h2>
        <div className={styles.symptomGrid}>
          {SYMPTOM_KEYS.map((key) => (
            <button
              key={key}
              className={`${styles.symptomBtn} ${activeSymptoms.has(key) ? styles.symptomActive : ''}`}
              onClick={() => toggleSymptom(key)}
            >
              {SYMPTOM_LABELS[key]}
            </button>
          ))}
        </div>
      </section>

      <button
        className={styles.saveBtn}
        onClick={handleSave}
        disabled={saving || saved || (!periodDate && activeSymptoms.size === 0)}
      >
        {saved ? 'Saved' : saving ? 'Saving...' : 'Save to Tara'}
      </button>
    </div>
  )
}
