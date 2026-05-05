'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import {
  getSavedTimeout,
  saveTimeout,
  TIMEOUT_OPTIONS,
  type TimeoutValue,
} from '@/lib/hooks/useInactivityTimeout'
import styles from './privacy.module.css'

export default function PrivacyPage() {
  const [deleting, setDeleting] = useState(false)
  const [timeoutMs, setTimeoutMs] = useState<TimeoutValue>(180000)
  const router = useRouter()

  useEffect(() => {
    setTimeoutMs(getSavedTimeout())
  }, [])

  function handleTimeoutChange(value: TimeoutValue) {
    saveTimeout(value)
    setTimeoutMs(value)
  }

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.replace('/')
  }

  async function handleDelete() {
    if (!confirm('This will permanently delete everything. It cannot be undone. Are you sure?')) return
    setDeleting(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('users').delete().eq('id', user.id)
      await supabase.auth.signOut()
    }
    router.push('/')
  }

  async function handleExport() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [{ data: periods }, { data: symptoms }, { data: appts }] = await Promise.all([
      supabase.from('period_logs').select('*').eq('user_id', user.id),
      supabase.from('symptom_logs').select('*').eq('user_id', user.id),
      supabase.from('appointments').select('*').eq('user_id', user.id),
    ])

    const csv = [
      '=== PERIOD LOGS ===',
      'start_date,end_date,flow_intensity',
      ...(periods ?? []).map((r) => `${r.start_date},${r.end_date ?? ''},${r.flow_intensity ?? ''}`),
      '',
      '=== SYMPTOM LOGS ===',
      'date,cramps,bloating,skin_breakout,low_energy,mood_low,headache',
      ...(symptoms ?? []).map((r) =>
        `${r.log_date},${r.cramps},${r.bloating},${r.skin_breakout},${r.low_energy},${r.mood_low},${r.headache}`
      ),
      '',
      '=== APPOINTMENTS ===',
      'date,service_type,risk_level',
      ...(appts ?? []).map((r) => `${r.appointment_date},${r.service_type ?? ''},${r.risk_level}`),
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'tara-s-my-data.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Privacy</p>
        <h1 className={`display ${styles.title}`}>What we hold, and why.</h1>
        <p className={styles.subtitle}>This is yours. All of it.</p>
      </header>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>What we collect</h2>
        <p>Your dates. Your symptoms. Nothing else. We do not need your location, your contacts, or your habits outside this app.</p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Where it lives</h2>
        <p>Securely held on servers in the EU. Never shared. Never sold. Not to anyone, for any reason.</p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>What you can do</h2>
        <p>Take it all with you, or let it go completely. One tap to download everything. One tap to delete it all, forever.</p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Auto sign-out</h2>
        <p>Automatically sign you out after a period of inactivity to protect your privacy.</p>
        <div className={styles.timeoutOptions}>
          {TIMEOUT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={`${styles.timeoutBtn} ${
                timeoutMs === opt.value ? styles.timeoutActive : ''
              }`}
              onClick={() => handleTimeoutChange(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.actions}>
        <button className={styles.exportBtn} onClick={handleExport}>
          Download my data
        </button>
        <button className={styles.signOutBtn} onClick={handleSignOut}>
          Sign out
        </button>
        <button className={styles.deleteBtn} onClick={handleDelete} disabled={deleting}>
          {deleting ? 'Deleting...' : 'Delete everything'}
        </button>
      </div>
    </div>
  )
}
