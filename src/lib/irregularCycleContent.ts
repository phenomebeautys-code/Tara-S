export interface CycleCondition {
  key: string
  headline: string
  summary: string
  body: string
}

export const IRREGULAR_CYCLE_CONDITIONS: CycleCondition[] = [
  {
    key: 'pcos',
    headline: 'PCOS',
    summary: 'Polycystic ovary syndrome can cause cycles to arrive early, late, or skip altogether.',
    body: 'Polycystic ovary syndrome is one of the most common hormonal conditions affecting women of reproductive age. It can cause cycles to arrive early, late, or skip altogether. It is entirely manageable with the right support, and you are far from alone.',
  },
  {
    key: 'endometriosis',
    headline: 'Endometriosis',
    summary: 'Endometriosis can cause cycles that are heavier, longer, more painful, or irregular in timing.',
    body: 'Endometriosis occurs when tissue similar to the uterine lining grows outside the womb. It can cause cycles that are heavier, longer, more painful, or irregular in timing. It is often dismissed for years before diagnosis. If your cycle changes feel significant, you deserve to be heard by a healthcare provider.',
  },
  {
    key: 'perimenopause',
    headline: 'Perimenopause',
    summary: 'In the years leading up to menopause, cycles may become longer, shorter, or unpredictable.',
    body: 'In the years leading up to menopause, your body begins a gradual transition. Cycles may become longer, shorter, or unpredictable. This is natural and it is worth talking to someone you trust.',
  },
  {
    key: 'post_pregnancy',
    headline: 'Post-pregnancy',
    summary: 'After pregnancy or breastfeeding, it can take many months for your cycle to settle into a new rhythm.',
    body: 'After pregnancy or breastfeeding, it can take many months for your cycle to find its new rhythm. Your body has done something remarkable. Give it time, and track what you notice.',
  },
  {
    key: 'stress_lifestyle',
    headline: 'Stress and lifestyle',
    summary: 'Sleep, stress, travel, and changes in weight can all shift your cycle.',
    body: 'Sleep, stress, travel, and changes in weight can all shift your cycle. Your body is responding to your world. Paying attention to patterns over time will tell you more than any single month.',
  },
]

export const IRREGULAR_THRESHOLD_DAYS = 7
