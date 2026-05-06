'use client'
import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { IRREGULAR_CYCLE_CONDITIONS } from '@/lib/irregularCycleContent'
import styles from './IrregularCycleDrawer.module.css'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export default function IrregularCycleDrawer({ isOpen, onClose }: Props) {
  const drawerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      <div
        className={styles.backdrop}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Understanding your cycle"
        className={styles.drawer}
      >
        <div className={styles.handle} aria-hidden="true" />

        <header className={styles.header}>
          <p className={`display ${styles.headline}`}>Your cycle has its own rhythm.</p>
          <p className={styles.subheadline}>
            Irregular cycles are common and can have many causes. Here are some of the most frequent.
          </p>
        </header>

        <ul className={styles.conditionList}>
          {IRREGULAR_CYCLE_CONDITIONS.map((condition) => (
            <li key={condition.key} className={styles.conditionItem}>
              <span className={styles.dot} aria-hidden="true" />
              <div>
                <p className={styles.conditionHeadline}>{condition.headline}</p>
                <p className={styles.conditionBody}>{condition.body}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className={styles.footer}>
          <p className={styles.footerText}>
            Want to learn more?{' '}
            <Link
              href="/information?category=conditions"
              className={styles.footerLink}
              onClick={onClose}
            >
              Read the research in the Information tab
            </Link>
            .
          </p>
          <p className={styles.footerDisclaimer}>
            If your cycle changes feel significant, speak to a healthcare provider.
          </p>
        </div>
      </div>
    </>
  )
}
