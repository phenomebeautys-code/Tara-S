'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { logPeriodStart } from '@/lib/hooks/usePeriodLogs'
import { useRouter } from 'next/navigation'
import styles from './onboarding.module.css'

const STEPS = [
  {
    question: 'When did your last period begin?',
    sub: 'This helps us find where you are in your cycle today.',
    required: true,
  },
  {
    question: 'And the one before that?',
    sub: 'Two dates give us your rhythm.',
    required: true,
  },
  {
    question: 'One more, if you remember.',
    sub: 'Three dates and we can begin to see your pattern.',
    required: false,
  },
]

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const [dates, setDates] = useState<(string | null)[]>([null, null, null])
  const [ready, setReady] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  function setDate(val: string) {
    const next = [...dates]
    next[step] = val || null
    setDates(next)
  }

  async function save() {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const validDates = dates.filter(Boolean).sort() as string[]
    for (const d of validDates) {
      await logPeriodStart(user.id, d)
    }

    await supabase
      .from('users')
      .update({ onboarding_complete: true })
      .eq('id', user.id)

    router.push('/')
  }

  function handleContinue() {
    if (step < STEPS.length - 1) {
      setStep(step + 1)
    } else {
      setReady(true)
    }
  }

  function handleSkip() {
    if (step < STEPS.length - 1) {
      setStep(step + 1)
    } else {
      setReady(true)
    }
  }

  if (ready) {
    return (
      <div className={styles.container}>
        <div className={styles.inner}>
          <div className={styles.readyWrap}>
            <p className={`display ${styles.readyTitle}`}>You are ready.</p>
            <p className={styles.readySub}>
              TARA-S will learn alongside you. The more you log, the more she understands.
            </p>
            <button
              className={styles.primaryBtn}
              onClick={save}
              disabled={loading}
            >
              {loading ? 'One moment...' : 'Enter'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  const current = STEPS[step]

  return (
    <div className={styles.container}>
      <div className={styles.inner}>

        <div className={styles.dots}>
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`${styles.dot} ${i === step ? styles.dotActive : ''} ${i < step ? styles.dotDone : ''}`}
            />
          ))}
        </div>

        <div className={styles.questionWrap}>
          <p className={`display ${styles.question}`}>{current.question}</p>
          <p className={styles.sub}>{current.sub}</p>
        </div>

        <input
          type="date"
          value={dates[step] ?? ''}
          onChange={(e) => setDate(e.target.value)}
          max={new Date().toISOString().split('T')[0]}
          className={styles.dateInput}
        />

        <div className={styles.actions}>
          <button
            className={styles.primaryBtn}
            onClick={handleContinue}
            disabled={current.required && !dates[step]}
          >
            Continue
          </button>
          {!current.required && (
            <button className={styles.skipBtn} onClick={handleSkip}>
              I am not sure — continue anyway
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
