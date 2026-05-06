import styles from './DisclaimerBanner.module.css'

export default function DisclaimerBanner() {
  return (
    <aside
      className={styles.banner}
      role="note"
      aria-label="Disclaimer"
    >
      <p className={styles.label}>Disclaimer</p>
      <p className={styles.body}>
        <span className={styles.brandWord}>Tara</span> is built on thorough research, and we hold
        that research to a high standard. But every woman&rsquo;s body is beautifully unique. Our
        aim is simply to offer the best possible experience and to walk alongside you through the
        natural phases of your cycle.
      </p>
    </aside>
  )
}
