'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import {
  useInactivityTimeout,
  getSavedTimeout,
  saveTimeout,
  TIMEOUT_OPTIONS,
  type TimeoutValue,
} from '@/lib/hooks/useInactivityTimeout'
import styles from './InactivityModal.module.css'

const GRACE_SECONDS = 45

export default function InactivityModal() {
  const router = useRouter()
  const t = useTranslations('inactivity')
  const [timeoutMs, setTimeoutMs] = useState<TimeoutValue>(180000)
  const [showModal, setShowModal] = useState(false)
  const [countdown, setCountdown] = useState(GRACE_SECONDS)
  const graceTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    setTimeoutMs(getSavedTimeout())
  }, [])

  function clearGrace() {
    if (graceTimer.current) {
      clearInterval(graceTimer.current)
      graceTimer.current = null
    }
  }

  async function signOutAndRedirect() {
    clearGrace()
    const supabase = createClient()
    await supabase.auth.signOut()
    router.replace('/')
  }

  const handleExpire = useCallback(() => {
    setCountdown(GRACE_SECONDS)
    setShowModal(true)
  }, [])

  const resetTimer = useInactivityTimeout(handleExpire, timeoutMs)

  useEffect(() => {
    if (!showModal) return
    clearGrace()
    graceTimer.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearGrace()
          signOutAndRedirect()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return clearGrace
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showModal])

  function handleStillHere() {
    clearGrace()
    setShowModal(false)
    setCountdown(GRACE_SECONDS)
    resetTimer()
  }

  function handleTimeoutChange(value: TimeoutValue) {
    clearGrace()
    saveTimeout(value)
    setTimeoutMs(value)
    setShowModal(false)
    setCountdown(GRACE_SECONDS)
    if (value !== 0) resetTimer()
  }

  if (!showModal) return null

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <p className={styles.eyebrow}>{t('eyebrow')}</p>
        <h2 className={`display ${styles.title}`}>{t('title')}</h2>
        <p className={styles.body}>
          {t('body_before')}{' '}
          <span className={styles.countdown}>{countdown}</span>{' '}
          {countdown !== 1 ? t('seconds') : t('second')}.
        </p>

        <div className={styles.progressWrap}>
          <div
            className={styles.progressBar}
            style={{ width: `${(countdown / GRACE_SECONDS) * 100}%` }}
          />
        </div>

        <div className={styles.timeoutSection}>
          <p className={styles.timeoutLabel}>{t('change_timeout')}</p>
          <div className={styles.options}>
            {TIMEOUT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                className={`${styles.optionBtn} ${
                  timeoutMs === opt.value ? styles.optionActive : ''
                }`}
                onClick={() => handleTimeoutChange(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.stayBtn} onClick={handleStillHere}>
            {t('stay')}
          </button>
          <button className={styles.signOutBtn} onClick={signOutAndRedirect}>
            {t('sign_out')}
          </button>
        </div>
      </div>
    </div>
  )
}
