import styles from './CycleRing.module.css'

const PHASE_COLORS: Record<string, string> = {
  Menstrual:  '#C4614A',
  Follicular: '#8FAF8A',
  Ovulation:  '#D4899A',
  Luteal:     '#9B7E8E',
  unknown:    '#E8D5C0',
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  }
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle)
  const end = polarToCartesian(cx, cy, r, startAngle)
  const largeArc = endAngle - startAngle <= 180 ? '0' : '1'
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`
}

interface Props {
  cycleDay: number
  cycleLength: number
  phaseName: string
}

export default function CycleRing({ cycleDay, cycleLength, phaseName }: Props) {
  const size = 220
  const cx = size / 2
  const cy = size / 2
  const r = 88
  const strokeWidth = 14

  const safeLength = cycleLength > 0 ? cycleLength : 28
  const safeDay = Math.min(cycleDay, safeLength)
  const progress = safeDay / safeLength
  const endAngle = progress * 360

  const color = PHASE_COLORS[phaseName] ?? PHASE_COLORS.unknown

  return (
    <div className={styles.wrapper}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Track */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className={styles.track}
        />
        {/* Progress arc */}
        {endAngle > 0 && (
          <path
            d={describeArc(cx, cy, r, 0, Math.min(endAngle, 359.99))}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        )}
        {/* Dot at current position */}
        {(() => {
          const dot = polarToCartesian(cx, cy, r, endAngle)
          return (
            <circle
              cx={dot.x} cy={dot.y} r={6}
              fill={color}
              className={styles.dot}
            />
          )
        })()}
      </svg>
      <div className={styles.center}>
        <span className={`display ${styles.day}`}>{safeDay}</span>
        <span className={styles.dayLabel}>day {safeDay === 1 ? '1' : ''}</span>
      </div>
    </div>
  )
}
