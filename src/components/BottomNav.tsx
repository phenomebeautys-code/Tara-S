'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import styles from './BottomNav.module.css'

export default function BottomNav() {
  const path = usePathname()
  const t = useTranslations('nav')

  const NAV = [
    { href: '/today',    label: t('home')     },
    { href: '/log',      label: t('log')      },
    { href: '/insights', label: t('insights') },
    { href: '/privacy',  label: t('privacy')  },
  ]

  return (
    <nav className={styles.nav}>
      {NAV.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={`${styles.item} ${path === href ? styles.active : ''}`}
        >
          <span className={styles.label}>{label}</span>
        </Link>
      ))}
    </nav>
  )
}
