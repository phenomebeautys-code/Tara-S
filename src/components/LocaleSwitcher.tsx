'use client'
import { useLocale } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import { locales, localeNames, type Locale } from '../../i18n'
import styles from './LocaleSwitcher.module.css'

export default function LocaleSwitcher() {
  const locale = useLocale() as Locale
  const router = useRouter()
  const pathname = usePathname()

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as Locale
    // Swap locale segment in pathname
    const stripped = pathname.replace(/^\/(af|zu|xh|en)/, '') || '/'
    const newPath = next === 'en' ? stripped : `/${next}${stripped}`
    router.push(newPath)
  }

  return (
    <div className={styles.wrapper}>
      <select
        value={locale}
        onChange={handleChange}
        className={styles.select}
        aria-label="Select language"
      >
        {locales.map((l) => (
          <option key={l} value={l}>
            {localeNames[l]}{(l === 'zu' || l === 'xh') ? ' (Beta)' : ''}
          </option>
        ))}
      </select>
    </div>
  )
}
