'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import styles from './login.module.css'

type Mode = 'login' | 'signup'

export default function LoginPage() {
  const t = useTranslations('login')
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
        if (!signInError) {
          router.push('/today')
          router.refresh()
        } else {
          setError(t('account_created'))
          setMode('login')
        }
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
      } else {
        router.push('/today')
        router.refresh()
      }
    }

    setLoading(false)
  }

  return (
    <main className={styles.container}>
      <div className={styles.card}>
        <h1 className={`${styles.logo} display`}>TARA-S</h1>
        <p className={styles.tagline}>{t('tagline')}</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <label htmlFor="email">{t('email_label')}</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('email_placeholder')}
            required
            autoComplete="email"
          />

          <label htmlFor="password">{t('password_label')}</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={mode === 'signup' ? t('password_create') : t('password_existing')}
            required
            minLength={6}
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
          />

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? t('wait') : mode === 'signup' ? t('create_account') : t('sign_in')}
          </button>
        </form>

        <p className={styles.toggle}>
          {mode === 'login' ? (
            <>{t('no_account')}{' '}
              <button type="button" onClick={() => { setMode('signup'); setError(null) }}>
                {t('sign_up')}
              </button>
            </>
          ) : (
            <>{t('have_account')}{' '}
              <button type="button" onClick={() => { setMode('login'); setError(null) }}>
                {t('sign_in')}
              </button>
            </>
          )}
        </p>
      </div>
    </main>
  )
}
