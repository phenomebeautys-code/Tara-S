'use client'
import type { CycleStats, CyclePhase } from '@/lib/hooks/useCycleStats'
import CycleRing from './CycleRing'
import styles from './TodayCard.module.css'

const PHASE_DESCRIPTIONS: Record<string, string> = {
  Menstrual:  'Your body is releasing. Rest, warmth, and gentle movement support you best right now.',
  Follicular: 'Energy is rising. Your skin is clearer, your mind sharper — a great time to plan and create.',
  Ovulation:  'You are at your peak. Confidence is high, skin is luminous, and connection comes naturally.',
  Luteal:     'Slowing down is wisdom. Your body is preparing — honour rest and reduce stimulation.',
  unknown:    'Log your first period to unlock your personal cycle insights.',
}

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null
  const diff = new Date(dateStr).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
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
  const countdown = daysUntil(stats?.predicted_next_start ?? null)
  const description = PHASE_DESCRIPTIONS[phaseName] ?? PHASE_DESCRIPTIONS.unknown
  const skinNote = phase?.phase_skin_note

  return (
    <div className={`${styles.card} phase-${phaseName.toLowerCase()}`}>
      <div className={styles.top}>
        <div className={styles.phaseInfo}>
          <span className={`display ${styles.phaseName}`}>{phaseName}</span>
          {countdown !== null && countdown >= 0 && (
            <span className={styles.countdown}>
              {countdown === 0 ? 'Period due today' : `${countdown}d until next period`}
            </span>
          )}
        </div>
        <CycleRing
          cycleDay={cycleDay}
          cycleLength={cycleLength}
          phaseName={phaseName}
        />
      </div>

      <p className={styles.description}>{description}</p>

      {skinNote && (
        <div className={styles.skinNote}>
          <span className={styles.skinLabel}>Skin today</span>
          <p className={`display ${styles.skinText}`}>{skinNote}</p>
        </div>
      )}
    </div>
  )
}
