'use client'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import DisclaimerBanner from '@/components/DisclaimerBanner'
import { RESEARCH_CATEGORIES } from '@/lib/informationContent'
import styles from './information.module.css'

export default function InformationPage() {
  const searchParams = useSearchParams()
  const initialCategory = searchParams.get('category') ?? RESEARCH_CATEGORIES[0].key
  const [activeCategory, setActiveCategory] = useState(initialCategory)

  useEffect(() => {
    const cat = searchParams.get('category')
    if (cat) setActiveCategory(cat)
  }, [searchParams])

  const current = RESEARCH_CATEGORIES.find((c) => c.key === activeCategory) ?? RESEARCH_CATEGORIES[0]

  return (
    <div className={styles.page}>
      <DisclaimerBanner />

      <nav className={styles.categoryNav} aria-label="Research categories">
        <div className={styles.categoryTrack}>
          {RESEARCH_CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              className={`${styles.categoryPill} ${activeCategory === cat.key ? styles.categoryPillActive : ''}`}
              onClick={() => setActiveCategory(cat.key)}
              aria-pressed={activeCategory === cat.key}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </nav>

      <section className={styles.cards}>
        {current.items.map((item) => (
          <article key={item.title} className={styles.card}>
            <div className={styles.cardMeta}>
              <span className={styles.journal}>{item.journal}</span>
              <span className={styles.year}>{item.year}</span>
            </div>
            <h2 className={styles.cardTitle}>{item.title}</h2>
            <p className={styles.cardBody}>{item.body}</p>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.readMore}
            >
              Read more
            </a>
          </article>
        ))}
      </section>
    </div>
  )
}
