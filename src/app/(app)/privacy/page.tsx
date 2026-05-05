'use client'
import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import {
  getSavedTimeout,
  saveTimeout,
  TIMEOUT_OPTIONS,
  type TimeoutValue,
} from '@/lib/hooks/useInactivityTimeout'
import styles from './privacy.module.css'

export default function PrivacyPage() {
  const t = useTranslations('privacy')
  const tInactivity = useTranslations('inactivity')
  const [deleting, setDeleting] = useState(false)
  const [timeoutMs, setTimeoutMs] = useState<TimeoutValue>(180000)

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
    window.location.href = '/'
  }

  async function handleDelete() {
    if (!confirm(t('delete_confirm'))) return
    setDeleting(true)

    const res = await fetch('/api/delete-account', { method: 'DELETE' })
    if (res.ok) {
      window.location.href = '/'
    } else {
      setDeleting(false)
      alert('Something went wrong. Please try again.')
    }
  }

  async function handleExport() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [{ data: periods }, { data: symptoms }] = await Promise.all([
      supabase.from('period_logs').select('*').eq('user_id', user.id),
      supabase.from('symptom_logs').select('*').eq('user_id', user.id),
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
        <p className={styles.eyebrow}>{t('eyebrow')}</p>
        <h1 className={`display ${styles.title}`}>{t('title')}</h1>
        <p className={styles.subtitle}>{t('subtitle')}</p>
      </header>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('section_collect_title')}</h2>
        <p>{t('section_collect_body')}</p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('section_storage_title')}</h2>
        <p>{t('section_storage_body')}</p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('section_control_title')}</h2>
        <p>{t('section_control_body')}</p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>{tInactivity('change_timeout')}</h2>
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
          {t('export_btn')}
        </button>
        <button className={styles.signOutBtn} onClick={handleSignOut}>
          {tInactivity('sign_out')}
        </button>
        <button className={styles.deleteBtn} onClick={handleDelete} disabled={deleting}>
          {deleting ? t('deleting') : t('delete_btn')}
        </button>
      </div>
    </div>
  )
}
