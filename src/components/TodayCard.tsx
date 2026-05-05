'use client'
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import type { CycleStats, CyclePhase } from '@/lib/hooks/useCycleStats'
import CycleRing from './CycleRing'
import styles from './TodayCard.module.css'

export default function TodayCard({
  stats,
  phase,
}: {
  stats: CycleStats | null
  phase: CyclePhase | null
}) {
  const t = useTranslations('today')

  const phaseName = phase?.phase_name ?? 'unknown'
  const cycleDay = phase?.cycle_day ?? 0
  const cycleLength = stats?.avg_cycle_length ?? 28
  const skinNote = phase?.phase_skin_note ?? null

  const phaseKey = phaseName.toLowerCase() as 'menstrual' | 'follicular' | 'ovulation' | 'luteal' | 'unknown'
  const displayName = ['menstrual', 'follicular', 'ovulation', 'luteal'].includes(phaseKey)
    ? t(`phase_${phaseKey}`)
    : t('phase_unknown')
  const description = ['menstrual', 'follicular', 'ovulation', 'luteal'].includes(phaseKey)
    ? t(`desc_${phaseKey}`)
    : t('desc_unknown')
  const bookingCta = ['follicular', 'ovulation'].includes(phaseKey)
    ? t(`cta_${phaseKey}`)
    : null

  const [countdown, setCountdown] = useState<number | null>(null)

  useEffect(() => {
    if (!stats?.predicted_next_start) {
      setCountdown(null)
      return
    }
    const diff = new Date(stats.predicted_next_start).getTime() - Date.now()
    setCountdown(Math.ceil(diff / (1000 * 60 * 60 * 24)))
  }, [stats?.predicted_next_start])

  return (
    <div className={`${styles.card} phase-${phaseKey}`}>

      <div className={styles.ringWrap}>
        <CycleRing
          cycleDay={cycleDay}
          cycleLength={cycleLength}
          phaseName={phaseName}
        />
      </div>

      <div className={styles.phaseInfo}>
        <span className={`display ${styles.phaseName}`}>{displayName}</span>
        {countdown !== null && countdown >= 0 && (
          <span className={styles.countdown}>
            {countdown === 0
              ? t('countdown_today')
              : countdown === 1
                ? t('countdown_day', { count: countdown })
                : t('countdown_days', { count: countdown })}
          </span>
        )}
      </div>

      <p className={styles.description}>{description}</p>

      {skinNote && (
        <div className={styles.skinNote}>
          <span className={styles.skinLabel}>{t('skin_label')}</span>
          <p className={`display ${styles.skinText}`}>{skinNote}</p>
        </div>
      )}

      {bookingCta && (
        <div className={styles.booking}>
          <p className={styles.bookingCta}>{bookingCta}</p>
          <a
            href="https://phenomebeauty.nextslot.co.za/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.bookingLink}
          >
            {t('book_cta')}
          </a>
        </div>
      )}
    </div>
  )
}
