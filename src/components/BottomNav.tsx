'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './BottomNav.module.css'

const NAV = [
  { href: '/',         label: 'Today'    },
  { href: '/log',      label: 'Log'      },
  { href: '/insights', label: 'Insights' },
  { href: '/privacy',  label: 'Privacy'  },
]

export default function BottomNav() {
  const path = usePathname()
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
