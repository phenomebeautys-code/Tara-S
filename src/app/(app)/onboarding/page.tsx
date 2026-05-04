'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { logPeriodStart } from '@/lib/hooks/usePeriodLogs'
import { useRouter } from 'next/navigation'
import styles from './onboarding.module.css'

const STEPS = [
  { label: 'When did your last period start?', required: true },
  { label: 'And the one before that?', required: true },
  { label: 'And the one before that?', required: false },
]

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const [dates, setDates] = useState<(string | null)[]>([null, null, null])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  function setDate(val: string) {
    const next = [...dates]
    next[step] = val
    setDates(next)
  }

  async function handleNext() {
    if (step < STEPS.length - 1) {
      setStep(step + 1)
    } else {
      await handleSubmit()
    }
  }

  async function handleSubmit() {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Log all provided dates (oldest first so cycle stats compute correctly)
    const validDates = dates.filter(Boolean).sort() as string[]
    for (const d of validDates) {
      await logPeriodStart(user.id, d)
    }

    // Mark onboarding complete
    await supabase
      .from('users')
      .update({ onboarding_complete: true })
      .eq('id', user.id)

    router.push('/')
  }

  const progress = ((step + 1) / STEPS.length) * 100

  return (
    <main className={styles.container}>
      <div className={styles.inner}>
        <h1 className={`display ${styles.title}`}>Welcome to TARA-S</h1>
        <p className={styles.subtitle}>Let&apos;s get to know your cycle</p>

        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
        </div>

        <div className={styles.card}>
          <p className={styles.stepLabel}>{STEPS[step].label}</p>
          <input
            type="date"
            value={dates[step] ?? ''}
            onChange={(e) => setDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className={styles.dateInput}
          />
        </div>

        <div className={styles.actions}>
          {!STEPS[step].required && (
            <button className={styles.skipBtn} onClick={handleSubmit}>
              Skip — I&apos;ll add this later
            </button>
          )}
          <button
            className={styles.primaryBtn}
            onClick={handleNext}
            disabled={loading || (STEPS[step].required && !dates[step])}
          >
            {loading ? 'Saving…' : step === STEPS.length - 1 ? "Let's go" : 'Continue'}
          </button>
        </div>
      </div>
    </main>
  )
}
