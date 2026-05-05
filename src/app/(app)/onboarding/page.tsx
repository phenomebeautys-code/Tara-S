'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { logPeriodStart } from '@/lib/hooks/usePeriodLogs'
import styles from './onboarding.module.css'

type Stage = 'welcome' | 'name' | 'dates' | 'ready'

export default function OnboardingPage() {
  const t = useTranslations('onboarding')
  const tLog = useTranslations('log')
  const [stage, setStage] = useState<Stage>('welcome')
  const [name, setName] = useState('')
  const [dateStep, setDateStep] = useState(0)
  const [dates, setDates] = useState<(string | null)[]>([null, null, null])
  const [loading, setLoading] = useState(false)

  const DATE_STEPS = [
    { question: t('date_q1'), sub: t('date_q1_sub') },
    { question: t('date_q2'), sub: t('date_q2_sub') },
    { question: t('date_q3'), sub: t('date_q3_sub') },
  ]

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

    await supabase.from('users').update({ onboarding_complete: true }).eq('id', user.id)

    window.location.href = '/today'
  }

  if (stage === 'welcome') {
    return (
      <div className={styles.container}>
        <div className={styles.inner}>
          <div className={styles.welcomeWrap}>
            <p className={`display ${styles.welcomeTitle}`}>{tLog('title')}</p>
            <p className={styles.welcomeMeaning}>{tLog('meaning')}</p>
            <p className={styles.welcomeBody}>{t('welcome_body')}</p>
            <button className={styles.primaryBtn} onClick={() => setStage('name')}>
              {t('welcome_cta')}
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
            <p className={`display ${styles.question}`}>{t('name_question')}</p>
            <p className={styles.sub}>{t('name_sub')}</p>
          </div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('name_placeholder')}
            autoComplete="given-name"
            className={styles.textInput}
          />
          <div className={styles.actions}>
            <button
              className={styles.primaryBtn}
              onClick={() => setStage('dates')}
              disabled={!name.trim()}
            >
              {t('continue')}
            </button>
            <button className={styles.skipBtn} onClick={() => setStage('dates')}>
              {t('continue_no_name')}
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
              {firstName ? t('ready_named', { name: firstName }) : t('ready')}
            </p>
            <p className={styles.readySub}>{t('ready_sub')}</p>
            <button
              className={styles.primaryBtn}
              onClick={handleEnter}
              disabled={loading}
            >
              {loading ? t('entering') : t('enter')}
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
            {t('continue')}
          </button>
          <button className={styles.skipBtn} onClick={handleDateContinue}>
            {t('dont_remember')}
          </button>
        </div>
      </div>
    </div>
  )
}
