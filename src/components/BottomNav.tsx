'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './BottomNav.module.css'

const NAV = [
  { href: '/',          icon: '🌿', label: 'Today'    },
  { href: '/log',       icon: '＋', label: 'Log'      },
  { href: '/insights',  icon: '✦',  label: 'Insights' },
  { href: '/privacy',   icon: '🔒', label: 'Privacy'  },
]

export default function BottomNav() {
  const path = usePathname()
  return (
    <nav className={styles.nav}>
      {NAV.map(({ href, icon, label }) => (
        <Link
          key={href}
          href={href}
          className={`${styles.item} ${path === href ? styles.active : ''}`}
        >
          <span className={styles.icon}>{icon}</span>
          <span className={styles.label}>{label}</span>
        </Link>
      ))}
    </nav>
  )
}
