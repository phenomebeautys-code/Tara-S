'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { logPeriodStart } from '@/lib/hooks/usePeriodLogs'
import { useRouter } from 'next/navigation'
import styles from './log.module.css'

const SYMPTOMS = [
  { key: 'cramps',        label: 'Cramps'        },
  { key: 'bloating',      label: 'Bloating'      },
  { key: 'skin_breakout', label: 'Skin breakout' },
  { key: 'low_energy',    label: 'Low energy'    },
  { key: 'mood_low',      label: 'Mood low'      },
  { key: 'headache',      label: 'Headache'      },
] as const

type SymptomKey = typeof SYMPTOMS[number]['key']

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
    if (!user) return

    if (periodDate) {
      await logPeriodStart(user.id, periodDate, flow || undefined)
    }

    if (activeSymptoms.size > 0) {
      const today = new Date().toISOString().split('T')[0]
      const payload: Record<string, unknown> = { user_id: user.id, log_date: today }
      SYMPTOMS.forEach(({ key }) => { payload[key] = activeSymptoms.has(key) })
      await supabase.from('symptom_logs').upsert(payload)
    }

    setSaved(true)
    setSaving(false)
    setTimeout(() => router.push('/'), 800)
  }

  return (
    <div className={styles.page}>

      <div className={styles.greeting}>
        <p className={`display ${styles.greetingName}`}>tara-s</p>
        <p className={styles.greetingMeaning}>The woman, in Khoekhoegowab.</p>
        <p className={styles.greetingBody}>She has always known her body. This space is yours to remember.</p>
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Period start</h2>
        <input
          type="date"
          value={periodDate}
          onChange={(e) => setPeriodDate(e.target.value)}
          max={new Date().toISOString().split('T')[0]}
          className={styles.dateInput}
        />
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
          {SYMPTOMS.map(({ key, label }) => (
            <button
              key={key}
              className={`${styles.symptomBtn} ${activeSymptoms.has(key) ? styles.symptomActive : ''}`}
              onClick={() => toggleSymptom(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <button
        className={styles.saveBtn}
        onClick={handleSave}
        disabled={saving || saved || (!periodDate && activeSymptoms.size === 0)}
      >
        {saved ? 'Saved' : saving ? 'Saving...' : 'Save'}
      </button>
    </div>
  )
}
