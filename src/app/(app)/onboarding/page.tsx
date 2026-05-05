'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { logPeriodStart } from '@/lib/hooks/usePeriodLogs'
import { useRouter } from 'next/navigation'
import styles from './onboarding.module.css'

type Stage = 'welcome' | 'name' | 'dates' | 'ready'

const DATE_STEPS = [
  {
    question: 'When did your last period begin?',
    sub: 'This helps us find where you are in your cycle today.',
  },
  {
    question: 'And the one before that?',
    sub: 'Two dates help us find your rhythm.',
  },
  {
    question: 'One more, if you remember.',
    sub: 'Three dates and we can begin to see your pattern.',
  },
]

export default function OnboardingPage() {
  const [stage, setStage] = useState<Stage>('welcome')
  const [name, setName] = useState('')
  const [dateStep, setDateStep] = useState(0)
  const [dates, setDates] = useState<(string | null)[]>([null, null, null])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  function setDate(val: string) {
    const next = [...dates]
    next[dateStep] = val || null
    setDates(next)
  }

  function handleDateContinue() {
    if (dateStep < DATE_STEPS.length - 1) {
      setDateStep(dateStep + 1)
    } else {
      setStage('ready')
    }
  }

  async function handleEnter() {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const validDates = dates.filter(Boolean).sort() as string[]

    await Promise.all([
      name.trim()
        ? supabase.from('users').update({ display_name: name.trim() }).eq('id', user.id)
        : Promise.resolve(),
      ...validDates.map((d) => logPeriodStart(user.id, d)),
    ])

    await supabase
      .from('users')
      .update({ onboarding_complete: true })
      .eq('id', user.id)

    router.push('/')
    router.refresh()
  }

  if (stage === 'welcome') {
    return (
      <div className={styles.container}>
        <div className={styles.inner}>
          <div className={styles.welcomeWrap}>
            <p className={`display ${styles.welcomeTitle}`}>tara-s</p>
            <p className={styles.welcomeMeaning}>The woman, in Khoekhoegowab.</p>
            <p className={styles.welcomeBody}>
              Before we begin, a few questions to find your rhythm.
            </p>
            <button className={styles.primaryBtn} onClick={() => setStage('name')}>
              I am ready
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (stage === 'name') {
    return (
      <div className={styles.container}>
        <div className={styles.inner}>
          <div className={styles.questionWrap}>
            <p className={`display ${styles.question}`}>What do you go by?</p>
            <p className={styles.sub}><span className="display">tara-s</span> will use this to greet you.</p>
          </div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            autoComplete="given-name"
            className={styles.textInput}
          />
          <div className={styles.actions}>
            <button
              className={styles.primaryBtn}
              onClick={() => setStage('dates')}
              disabled={!name.trim()}
            >
              Continue
            </button>
            <button className={styles.skipBtn} onClick={() => setStage('dates')}>
              Continue without a name
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (stage === 'ready') {
    const firstName = name.trim()
    return (
      <div className={styles.container}>
        <div className={styles.inner}>
          <div className={styles.readyWrap}>
            <p className={`display ${styles.readyTitle}`}>
              {firstName ? `You are ready, ${firstName}.` : 'You are ready.'}
            </p>
            <p className={styles.readySub}>
              <span className="display">tara-s</span> will learn alongside you. The more you log, the more she understands.
            </p>
            <button
              className={styles.primaryBtn}
              onClick={handleEnter}
              disabled={loading}
            >
              {loading ? 'One moment...' : 'Enter'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  const current = DATE_STEPS[dateStep]

  return (
    <div className={styles.container}>
      <div className={styles.inner}>
        <div className={styles.dots}>
          {DATE_STEPS.map((_, i) => (
            <span
              key={i}
              className={`${styles.dot} ${i === dateStep ? styles.dotActive : ''} ${i < dateStep ? styles.dotDone : ''}`}
            />
          ))}
        </div>
        <div className={styles.questionWrap}>
          <p className={`display ${styles.question}`}>{current.question}</p>
          <p className={styles.sub}>{current.sub}</p>
        </div>
        <input
          type="date"
          value={dates[dateStep] ?? ''}
          onChange={(e) => setDate(e.target.value)}
          max={new Date().toISOString().split('T')[0]}
          className={styles.dateInput}
        />
        <div className={styles.actions}>
          <button
            className={styles.primaryBtn}
            onClick={handleDateContinue}
            disabled={!dates[dateStep]}
          >
            Continue
          </button>
          <button className={styles.skipBtn} onClick={handleDateContinue}>
            I don&apos;t remember
          </button>
        </div>
      </div>
    </div>
  )
}
