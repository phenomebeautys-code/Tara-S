import type { CycleStats, CyclePhase } from '@/lib/hooks/useCycleStats'
import styles from './TodayCard.module.css'

const PHASE_CLASS: Record<string, string> = {
  Menstrual:  'phase-menstrual',
  Follicular: 'phase-follicular',
  Ovulation:  'phase-ovulation',
  Luteal:     'phase-luteal',
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
  const phaseClass = PHASE_CLASS[phaseName] ?? ''
  const countdown = daysUntil(stats?.predicted_next_start ?? null)

  return (
    <div className={`${styles.card} ${phaseClass}`}>
      <div className={styles.top}>
        <span className={`display ${styles.phaseBadge}`}>{phaseName}</span>
        {phase && (
          <span className={styles.cycleDay}>Day {phase.cycle_day}</span>
        )}
      </div>

      {countdown !== null && countdown >= 0 && (
        <p className={styles.countdown}>
          <strong>{countdown}</strong> days until your next period
        </p>
      )}

      {phase?.phase_skin_note && (
        <p className={`display ${styles.skinNote}`}>{phase.phase_skin_note}</p>
      )}

      <a
        href={`https://phenomebeauty.co.za/book?utm_source=period-app&phase=${phaseName.toLowerCase()}`}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.ctaBtn}
      >
        Book a Phenomebeauty appointment
      </a>
    </div>
  )
}
