import styles from './information.module.css'
import DisclaimerBanner from '@/components/DisclaimerBanner'

const SOURCES = [
  {
    tier: 1,
    tierLabel: 'Tier 1 — Highest Credibility',
    tierSub: 'Flagship peer-reviewed journals with international authority.',
    items: [
      {
        title: 'Brain and Hormonal Connectivity',
        journal: 'Nature Neuroscience',
        year: '2025',
        body: 'A 2025 study found that hormone fluctuations across the menstrual cycle measurably shift whole-brain structural connectivity, particularly in regions governing mood regulation, memory, and stress response.',
        url: 'https://www.nature.com/articles/s41593-025-02066-2',
      },
      {
        title: 'Global Skin and Cycle Study',
        journal: 'British Journal of Dermatology',
        year: 'April 2025',
        body: 'A landmark study of 17,009 women confirmed that cycle regularity directly affects skin hydration, barrier integrity, and sebum levels, making it the largest skin-specific menstrual study published to date.',
        url: 'https://pubmed.ncbi.nlm.nih.gov/39931829',
      },
    ],
  },
  {
    tier: 2,
    tierLabel: 'Tier 2 — Recent, High Credibility',
    tierSub: 'Peer-reviewed studies published in the last 18 months, directly relevant to the app content.',
    items: [
      {
        title: 'Skin Physiology Across the Cycle',
        journal: 'Cureus / PubMed Central',
        year: 'December 2024',
        body: 'A scoping review of 26 studies found that oestrogen peaks at ovulation drive measurable increases in skin elasticity, collagen production, blood flow, and hydration.',
        url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11703644',
      },
      {
        title: 'Athletic Performance and Phase Timing',
        journal: 'Journal of Education, Health and Sport',
        year: 'February 2025',
        body: 'The follicular phase favours high-intensity performance and carbohydrate metabolism, while the luteal phase supports fat utilisation and fatigue resistance, directly supporting phase-informed self-care routines.',
        url: 'https://apcz.umk.pl/JEHS/article/view/57659',
      },
    ],
  },
  {
    tier: 3,
    tierLabel: 'Tier 3 — Noteworthy and Foundational',
    tierSub: 'Credible, well-cited studies that establish the core science the app is built on.',
    items: [
      {
        title: 'Mood and Self-Perception Across the Cycle',
        journal: 'Evolutionary Human Sciences, Cambridge University Press',
        year: '2021',
        body: 'A pre-registered diary study of 872 women tracked across 70 days found significantly higher self-perceived attractiveness, desirability, and positive mood during the fertile window, effects entirely absent in women using hormonal contraceptives.',
        url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10427307',
      },
      {
        title: 'Skin Changes and Cycle Regularity',
        journal: 'Skin Research and Technology / PubMed Central',
        year: 'May 2023',
        body: 'Approximately 80% of women reported measurable skin changes in the week before menstruation. Oestrogen improves the skin\u2019s water-binding capacity while suppressing sebum, explaining premenstrual congestion and dryness.',
        url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10230734',
      },
      {
        title: 'General Cycle Overview',
        journal: 'NHS, UK National Health Service',
        year: 'Reviewed January 2023',
        body: 'A medically reviewed public health reference covering phase timing, hormonal changes, and typical cycle variation. An accessible entry point for users who are new to cycle awareness.',
        url: 'https://www.nhs.uk/conditions/periods',
      },
    ],
  },
]

export default function InformationPage() {
  return (
    <div className={styles.page}>
      <DisclaimerBanner
        title="Disclaimer"
        body="TARA-S is built on thorough research, and we hold that research to a high standard. But every woman&#39;s body is beautifully unique. Our aim is simply to offer the best possible experience and to walk alongside you through the natural phases of your cycle."
      />

      {SOURCES.map((tier) => (
        <section key={tier.tier} className={styles.tier}>
          <div className={styles.tierHeader}>
            <p className={styles.tierLabel}>{tier.tierLabel}</p>
            <p className={styles.tierSub}>{tier.tierSub}</p>
          </div>

          <div className={styles.cards}>
            {tier.items.map((item) => (
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
          </div>
        </section>
      ))}
    </div>
  )
}
