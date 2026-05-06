'use client'
import { useTranslations } from 'next-intl'
import styles from './DisclaimerBanner.module.css'

export default function DisclaimerBanner() {
  const t = useTranslations('information')

  return (
    <aside className={styles.banner} role="note" aria-label={t('disclaimer_title')}>
      <p className={styles.label}>{t('disclaimer_title')}</p>
      <p className={styles.body}>{t('disclaimer_body')}</p>
    </aside>
  )
}
