import styles from './offline.module.css'

export default function OfflinePage() {
  return (
    <main className={styles.container}>
      <span className={styles.icon} aria-hidden="true">🌿</span>
      <h1 className={`display ${styles.title}`}>You&apos;re offline</h1>
      <p className={styles.body}>TARA-S needs a connection to sync your cycle data. Check your internet and try again.</p>
    </main>
  )
}
