import styles from './DisclaimerBanner.module.css'

export default function DisclaimerBanner({
  title,
  body,
}: {
  title: string
  body: string
}) {
  return (
    <aside className={styles.banner} role="note" aria-label={title}>
      <p className={styles.label}>{title}</p>
      <p className={styles.body}>{body}</p>
    </aside>
  )
}
