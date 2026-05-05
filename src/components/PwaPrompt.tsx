'use client'
import { useEffect, useState } from 'react'
import styles from './PwaPrompt.module.css'

export default function PwaPrompt() {
  const [show, setShow] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const already = localStorage.getItem('pwa-prompt-dismissed')
    if (already) return
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true
    if (!isStandalone) {
      const timer = setTimeout(() => setShow(true), 3000)
      return () => clearTimeout(timer)
    }
  }, [])

  function dismiss() {
    localStorage.setItem('pwa-prompt-dismissed', '1')
    setDismissed(true)
    setShow(false)
  }

  if (!show || dismissed) return null

  return (
    <div className={styles.banner}>
      <div className={styles.inner}>
        <p className={styles.text}>
          💡 <strong>Add <span className="display">TARA-S</span> to your home screen</strong> for faster access — no App Store needed!
        </p>
        <div className={styles.steps}>
          <span>iOS: tap Share → &ldquo;Add to Home Screen&rdquo;</span>
          <span>Android: tap ⋮ → &ldquo;Add to Home Screen&rdquo;</span>
        </div>
        <button className={styles.dismiss} onClick={dismiss}>Got it</button>
      </div>
    </div>
  )
}
