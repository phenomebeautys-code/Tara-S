'use client'
import { useEffect, useState } from 'react'
import type { CycleStats, CyclePhase } from '@/lib/hooks/useCycleStats'
import CycleRing from './CycleRing'
import styles from './TodayCard.module.css'

const PHASE_DESCRIPTIONS: Record<string, string> = {
  Menstrual:  'Your body is releasing. Rest, warmth, and gentle movement support you best right now.',
  Follicular: 'Energy is rising. Your skin is clearer, your mind sharper. A great time to plan and create.',
  Ovulation:  'You are at your peak. Confidence is high, skin is luminous, and connection comes naturally.',
  Luteal:     'Slowing down is wisdom. Your body is preparing. Honour rest and reduce stimulation.',
  unknown:    'Log your first period to unlock your personal cycle insights.',
}

const BOOKING_CTA: Partial<Record<string, string>> = {
  Follicular: 'This week your skin is at its clearest. A great time to book a wax or a facial.',
  Ovulation:  'Your skin is luminous right now. Make the most of it with a treatment.',
}

export default function TodayCard({
  stats,
  phase,
}: {
  stats: CycleStats | null
  phase: CyclePhase | null
}) {
  const phaseName = phase?.phase_name ?? 'unknown'
  const cycleDay = phase?.cycle_day ?? 0
  const cycleLength = stats?.avg_cycle_length ?? 28
  const description = PHASE_DESCRIPTIONS[phaseName] ?? PHASE_DESCRIPTIONS.unknown
  const skinNote = phase?.phase_skin_note ?? null
  const bookingCta = BOOKING_CTA[phaseName]

  // Countdown must be calculated client-side only to avoid hydration mismatch
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
    <div className={`${styles.card} phase-${phaseName.toLowerCase()}`}>

      <div className={styles.ringWrap}>
        <CycleRing
          cycleDay={cycleDay}
          cycleLength={cycleLength}
          phaseName={phaseName}
        />
      </div>

      <div className={styles.phaseInfo}>
        <span className={`display ${styles.phaseName}`}>{phaseName}</span>
        {countdown !== null && countdown >= 0 && (
          <span className={styles.countdown}>
            {countdown === 0
              ? 'Your period is due today'
              : `Your next period is in ${countdown} day${countdown === 1 ? '' : 's'}`}
          </span>
        )}
      </div>

      <p className={styles.description}>{description}</p>

      {skinNote && (
        <div className={styles.skinNote}>
          <span className={styles.skinLabel}>Skin note</span>
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
            Book with Phenomebeauty
          </a>
        </div>
      )}
    </div>
  )
}
