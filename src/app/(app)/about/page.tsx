import Link from 'next/link'
import styles from './about.module.css'

export default function AboutPage() {
  return (
    <div className={styles.page}>
      <Link href="/" className={styles.back}>Back</Link>

      <header className={styles.header}>
        <p className={styles.eyebrow}>The name</p>
        <h1 className={`display ${styles.title}`}>tara-s</h1>
        <p className={`display ${styles.meaning}`}>The woman.</p>
      </header>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>The language</h2>
        <p>Khoekhoegowab is the language of the Khoi-San people, the oldest continuous culture on earth. Born in the land that is now Southern Africa, it is one of the few languages that uses click consonants as core sounds. Linguists trace its roots back over 100,000 years, making it one of humanity&apos;s earliest voices.</p>
        <p>In Khoekhoegowab, <em>tara-s</em> means the woman. Not a woman. The woman. Whole. Specific. Herself.</p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>The knowing</h2>
        <p>Long before calendars existed, women tracked their cycles by the moon, by sensation, by the wisdom passed quietly between generations. They knew when to rest, when to create, when to withdraw, when to bloom. That knowledge was never lost. It was simply waiting to be remembered.</p>
        <p>TARA-S was built to return that knowing to you. Not as data points. Not as predictions on a chart. But as a felt sense of your own body, held gently in your hand.</p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>The mission</h2>
        <p>Built by Phenome for South African women. Not imported, not adapted. Made here, from here, for you. Every phase, every symptom, every skin note was written with the South African woman in mind, in the land where the oldest understanding of the female body was first spoken aloud.</p>
      </section>

      <footer className={styles.footer}>
        <p className={`display ${styles.closing}`}>She has always known her body.<br />This space is yours to remember.</p>
      </footer>
    </div>
  )
}
