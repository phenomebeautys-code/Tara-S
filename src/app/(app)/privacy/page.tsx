'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import styles from './privacy.module.css'

export default function PrivacyPage() {
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    if (!confirm('This will permanently delete all your data. This cannot be undone.')) return
    setDeleting(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      // Cascade deletes all related rows via FK constraints
      await supabase.from('users').delete().eq('id', user.id)
      await supabase.auth.signOut()
    }
    router.push('/login')
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
      <h1 className={`display ${styles.title}`}>Your Data &amp; Privacy</h1>
      <p className={styles.subtitle}>We believe in radical transparency</p>

      <div className={styles.section}>
        <h2>What we collect</h2>
        <p>Period start and end dates, symptom logs, appointment dates. Nothing else.</p>
      </div>

      <div className={styles.section}>
        <h2>Where it&apos;s stored</h2>
        <p>Securely on Supabase servers in the EU. Your data is never shared or sold.</p>
      </div>

      <div className={styles.section}>
        <h2>Your rights</h2>
        <p>You own your data. Export or delete it at any time — instantly.</p>
      </div>

      <div className={styles.actions}>
        <button className={styles.exportBtn} onClick={handleExport}>
          ⬇ Download my data (CSV)
        </button>
        <button className={styles.deleteBtn} onClick={handleDelete} disabled={deleting}>
          {deleting ? 'Deleting…' : '🗑 Delete my account permanently'}
        </button>
      </div>
    </div>
  )
}
