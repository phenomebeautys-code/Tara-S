export interface ResearchItem {
  title: string
  journal: string
  year: string
  body: string
  url: string
}

export interface ResearchCategory {
  key: string
  label: string
  items: ResearchItem[]
}

export const RESEARCH_CATEGORIES: ResearchCategory[] = [
  {
    key: 'the-cycle',
    label: 'The Cycle',
    items: [
      {
        title: 'General Cycle Overview',
        journal: 'NHS, UK National Health Service',
        year: 'Reviewed January 2023',
        body: 'A medically reviewed public health reference covering phase timing, hormonal changes, and typical cycle variation. An accessible entry point for users who are new to cycle awareness.',
        url: 'https://www.nhs.uk/conditions/periods',
      },
      {
        title: 'Brain and Hormonal Connectivity',
        journal: 'Nature Neuroscience',
        year: '2025',
        body: 'A 2025 study found that hormone fluctuations across the menstrual cycle measurably shift whole-brain structural connectivity, particularly in regions governing mood regulation, memory, and stress response.',
        url: 'https://www.nature.com/articles/s41593-025-02066-2',
      },
    ],
  },
  {
    key: 'skin',
    label: 'Skin',
    items: [
      {
        title: 'Global Skin and Cycle Study',
        journal: 'British Journal of Dermatology',
        year: 'April 2025',
        body: 'A landmark study of 17,009 women confirmed that cycle regularity directly affects skin hydration, barrier integrity, and sebum levels, making it the largest skin-specific menstrual study published to date.',
        url: 'https://pubmed.ncbi.nlm.nih.gov/39931829',
      },
      {
        title: 'Skin Physiology Across the Cycle',
        journal: 'Cureus / PubMed Central',
        year: 'December 2024',
        body: 'A scoping review of 26 studies found that oestrogen peaks at ovulation drive measurable increases in skin elasticity, collagen production, blood flow, and hydration.',
        url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11703644',
      },
      {
        title: 'Skin Changes and Cycle Regularity',
        journal: 'Skin Research and Technology / PubMed Central',
        year: 'May 2023',
        body: 'Approximately 80% of women reported measurable skin changes in the week before menstruation. Oestrogen improves the skin\u2019s water-binding capacity while suppressing sebum, explaining premenstrual congestion and dryness.',
        url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10230734',
      },
    ],
  },
  {
    key: 'mind-mood',
    label: 'Mind and Mood',
    items: [
      {
        title: 'Mood and Self-Perception Across the Cycle',
        journal: 'Evolutionary Human Sciences, Cambridge University Press',
        year: '2021',
        body: 'A pre-registered diary study of 872 women tracked across 70 days found significantly higher self-perceived attractiveness, desirability, and positive mood during the fertile window, effects entirely absent in women using hormonal contraceptives.',
        url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10427307',
      },
      {
        title: 'Brain and Hormonal Connectivity',
        journal: 'Nature Neuroscience',
        year: '2025',
        body: 'Hormone fluctuations across the menstrual cycle measurably shift whole-brain structural connectivity, particularly in regions governing mood regulation, memory, and stress response.',
        url: 'https://www.nature.com/articles/s41593-025-02066-2',
      },
    ],
  },
  {
    key: 'body-energy',
    label: 'Body and Energy',
    items: [
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
    key: 'conditions',
    label: 'Conditions',
    items: [
      {
        title: 'PCOS and Cycle Irregularity',
        journal: 'World Health Organization',
        year: '2023',
        body: 'Polycystic ovary syndrome affects an estimated 8 to 13% of women of reproductive age worldwide. It is one of the most common hormonal conditions and a leading cause of irregular cycles. Early recognition and lifestyle support can significantly improve outcomes.',
        url: 'https://www.who.int/news-room/fact-sheets/detail/polycystic-ovary-syndrome',
      },
      {
        title: 'Endometriosis: A Condition Too Often Dismissed',
        journal: 'The Lancet',
        year: '2024',
        body: 'Endometriosis affects roughly 1 in 10 women of reproductive age. It is characterised by tissue similar to the uterine lining growing outside the womb, causing irregular, heavy, and painful periods. Average time to diagnosis remains 7 to 10 years due to widespread normalisation of symptoms.',
        url: 'https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(24)00375-X/fulltext',
      },
      {
        title: 'Perimenopause and Cycle Change',
        journal: 'British Menopause Society',
        year: '2023',
        body: 'Perimenopause typically begins in a woman\'s 40s and can last 4 to 10 years. Cycles become longer, shorter, heavier, or more widely spaced as oestrogen levels fluctuate. Awareness and early support improve quality of life significantly.',
        url: 'https://thebms.org.uk/publications/tools-for-clinicians/perimenopause/',
      },
      {
        title: 'Postpartum Cycle Return',
        journal: 'American College of Obstetricians and Gynecologists',
        year: '2022',
        body: 'Return of menstruation after pregnancy varies widely, from 6 weeks in non-breastfeeding women to 18 months or more in those who breastfeed. Cycles often differ in length, flow, and timing for months to years following birth or pregnancy loss.',
        url: 'https://www.acog.org/womens-health/faqs/breastfeeding-your-baby',
      },
      {
        title: 'Stress, Lifestyle, and Cycle Disruption',
        journal: 'Human Reproduction Update',
        year: '2021',
        body: 'Psychological stress, sleep disruption, significant weight change, and intense exercise are each independently associated with cycle irregularity. The hypothalamic-pituitary-ovarian axis is highly sensitive to physiological load, and normalising these patterns often restores regularity.',
        url: 'https://academic.oup.com/humupd/article/27/6/1133/6319798',
      },
    ],
  },
]
