'use client'
import { useEffect, useState, useCallback } from 'react'
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

export default function InactivityModal() {
  const router = useRouter()
  const [timeoutMs, setTimeoutMs] = useState<TimeoutValue>(180000)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    setTimeoutMs(getSavedTimeout())
  }, [])

  const handleExpire = useCallback(() => {
    setShowModal(true)
  }, [])

  const resetTimer = useInactivityTimeout(handleExpire, timeoutMs)

  async function handleStillHere() {
    setShowModal(false)
    resetTimer()
  }

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.replace('/')
  }

  function handleTimeoutChange(value: TimeoutValue) {
    saveTimeout(value)
    setTimeoutMs(value)
    setShowModal(false)
    if (value !== 0) resetTimer()
  }

  if (!showModal) return null

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <p className={styles.eyebrow}>Privacy</p>
        <h2 className={`display ${styles.title}`}>Are you still there?</h2>
        <p className={styles.body}>
          We take your privacy seriously. You will be signed out due to inactivity.
        </p>

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
          <button className={styles.signOutBtn} onClick={handleSignOut}>
            Sign out
          </button>
        </div>
      </div>
    </div>
  )
}
