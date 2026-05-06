'use client'
import { useState, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import {
  getSavedTimeout,
  saveTimeout,
  TIMEOUT_OPTIONS,
  type TimeoutValue,
} from '@/lib/hooks/useInactivityTimeout'
import { locales, localeNames, type Locale } from '@/lib/locales'
import styles from './privacy.module.css'

export default function PrivacyPage() {
  const t = useTranslations('privacy')
  const tInactivity = useTranslations('inactivity')
  const tCommon = useTranslations('common')
  const currentLocale = useLocale() as Locale
  const [deleting, setDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [timeoutMs, setTimeoutMs] = useState<TimeoutValue>(180000)
  const [localeChanging, setLocaleChanging] = useState(false)
  const [exportError, setExportError] = useState(false)

  useEffect(() => {
    setTimeoutMs(getSavedTimeout())
  }, [])

  function handleTimeoutChange(value: TimeoutValue) {
    saveTimeout(value)
    setTimeoutMs(value)
  }

  async function handleLocaleChange(locale: Locale) {
    if (locale === currentLocale || localeChanging) return
    setLocaleChanging(true)

    // Write cookie so the server picks it up on next request
    document.cookie = `TARA_LOCALE=${locale};path=/;samesite=lax`

    // Persist to Supabase so the middleware stays in sync
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { error } = await supabase.from('users').update({ locale }).eq('id', user.id)
        if (error) {
          // Revert cookie if DB write failed so they stay in sync
          document.cookie = `TARA_LOCALE=${currentLocale};path=/;samesite=lax`
          setLocaleChanging(false)
          return
        }
      }
      // Reload so the server re-renders in the new language
      window.location.reload()
    } catch {
      document.cookie = `TARA_LOCALE=${currentLocale};path=/;samesite=lax`
      setLocaleChanging(false)
    }
  }

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  async function handleDeleteConfirmed() {
    setShowDeleteModal(false)
    setDeleting(true)

    const res = await fetch('/api/delete-account', { method: 'DELETE' })
    if (res.ok) {
      window.location.href = '/'
    } else {
      setDeleting(false)
    }
  }

  async function handleExport() {
    setExportError(false)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [{ data: periods, error: periodsError }, { data: symptoms, error: symptomsError }] =
        await Promise.all([
          supabase.from('period_logs').select('*').eq('user_id', user.id),
          supabase.from('symptom_logs').select('*').eq('user_id', user.id),
        ])

      if (periodsError || symptomsError) {
        setExportError(true)
        return
      }

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
    } catch {
      setExportError(true)
    }
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

      {/* Preferences */}
      <div className={styles.preferencesBlock}>
        <p className={styles.preferencesEyebrow}>{t('preferences_title')}</p>

        <div className={styles.preferenceRow}>
          <p className={styles.preferenceLabel}>{tInactivity('change_timeout')}</p>
          <div className={styles.timeoutOptions}>
            {TIMEOUT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                className={`${styles.timeoutBtn} ${
                  timeoutMs === opt.value ? styles.optionActive : ''
                }`}
                onClick={() => handleTimeoutChange(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.preferenceRow}>
          <p className={styles.preferenceLabel}>{tCommon('language_label')}</p>
          <div
            className={`${styles.localeOptions} ${localeChanging ? styles.localeChanging : ''}`}
          >
            {locales.map((locale) => (
              <button
                key={locale}
                className={`${styles.localeBtn} ${
                  currentLocale === locale ? styles.optionActive : ''
                }`}
                onClick={() => handleLocaleChange(locale)}
                disabled={localeChanging}
              >
                {localeNames[locale]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <button className={styles.exportBtn} onClick={handleExport}>
          {t('export_btn')}
        </button>
        {exportError && (
          <p className={styles.exportError}>{t('export_error')}</p>
        )}
        <button className={styles.signOutBtn} onClick={handleSignOut}>
          {tInactivity('sign_out')}
        </button>
      </div>

      <div className={styles.deleteZone}>
        <button
          className={styles.deleteBtn}
          onClick={() => setShowDeleteModal(true)}
          disabled={deleting}
        >
          {deleting ? t('deleting') : t('delete_btn')}
        </button>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard}>
            <p className={styles.modalEyebrow}>{t('delete_modal_eyebrow')}</p>
            <h2 className={`display ${styles.modalTitle}`}>{t('delete_modal_title')}</h2>
            <p className={styles.modalBody}>{t('delete_modal_body')}</p>
            <div className={styles.modalActions}>
              <button
                className={styles.modalCancelBtn}
                onClick={() => setShowDeleteModal(false)}
              >
                {t('delete_modal_cancel')}
              </button>
              <button
                className={styles.modalConfirmBtn}
                onClick={handleDeleteConfirmed}
              >
                {t('delete_modal_confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
