'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
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

  // Start grace countdown when modal opens
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
        <p className={styles.eyebrow}>Privacy</p>
        <h2 className={`display ${styles.title}`}>Are you still there?</h2>
        <p className={styles.body}>
          We take your privacy seriously. You will be signed out in{' '}
          <span className={styles.countdown}>{countdown}</span>{' '}
          second{countdown !== 1 ? 's' : ''}.
        </p>

        <div className={styles.progressWrap}>
          <div
            className={styles.progressBar}
            style={{ width: `${(countdown / GRACE_SECONDS) * 100}%` }}
          />
        </div>

        <div className={styles.timeoutSection}>
          <p className={styles.timeoutLabel}>Change timeout</p>
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
            I am still here
          </button>
          <button className={styles.signOutBtn} onClick={signOutAndRedirect}>
            Sign out
          </button>
        </div>
      </div>
    </div>
  )
}
