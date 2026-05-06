'use client'
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import styles from './CycleCalendar.module.css'

type DayEntry = {
  day: string
  phase_name: string | null
}

type Props = {
  userId: string
}

const DAY_INITIALS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function getMonthGrid(year: number, month: number): (string | null)[] {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (string | null)[] = Array(firstDay).fill(null)
  for (let d = 1; d <= daysInMonth; d++) {
    const mm = String(month + 1).padStart(2, '0')
    const dd = String(d).padStart(2, '0')
    cells.push(`${year}-${mm}-${dd}`)
  }
  return cells
}

export default function CycleCalendar({ userId }: Props) {
  const t = useTranslations('calendar')
  const [phaseMap, setPhaseMap] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const today = new Date()
    const end = today.toISOString().split('T')[0]
    const startDate = new Date(today)
    startDate.setMonth(startDate.getMonth() - 5)
    startDate.setDate(1)
    const start = startDate.toISOString().split('T')[0]

    const supabase = createClient()
    supabase
      .rpc('get_phase_range', { p_user_id: userId, p_start: start, p_end: end })
      .then(({ data }) => {
        if (data) {
          const map: Record<string, string> = {}
          ;(data as DayEntry[]).forEach((r) => {
            if (r.phase_name) map[r.day] = r.phase_name
          })
          setPhaseMap(map)
        }
        setLoading(false)
      })
  }, [userId])

  const today = new Date()
  const months: { year: number; month: number; label: string; shortLabel: string }[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
    months.push({
      year: d.getFullYear(),
      month: d.getMonth(),
      label: d.toLocaleString('default', { month: 'long', year: 'numeric' }),
      shortLabel: d.toLocaleString('default', { month: 'short' }).toUpperCase(),
    })
  }

  const todayStr = today.toISOString().split('T')[0]

  if (loading) {
    return (
      <section className={styles.section}>
        <p className={styles.eyebrow}>{t('eyebrow')}</p>
        <div className={styles.skeletonGrid}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className={styles.skeletonCard} />
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className={styles.section}>
      <p className={styles.eyebrow}>{t('eyebrow')}</p>

      <div className={styles.grid}>
        {months.map(({ year, month, label, shortLabel }) => {
          const cells = getMonthGrid(year, month)
          const hasCurrentMonth = year === today.getFullYear() && month === today.getMonth()

          return (
            <div
              key={`${year}-${month}`}
              className={[
                styles.monthCard,
                hasCurrentMonth ? styles.monthCardCurrent : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <div className={styles.monthHeader}>
                <span className={styles.monthShort}>{shortLabel}</span>
                <span className={styles.monthYear}>{year}</span>
              </div>

              <div className={styles.dayHeaders}>
                {DAY_INITIALS.map((d, i) => (
                  <span key={i} className={styles.dayInitial}>{d}</span>
                ))}
              </div>

              <div className={styles.dots} role="grid" aria-label={label}>
                {cells.map((dateStr, i) => {
                  const phase = dateStr ? (phaseMap[dateStr] ?? 'none') : null
                  const isToday = dateStr === todayStr
                  const dayNum = dateStr ? parseInt(dateStr.split('-')[2], 10) : null

                  return (
                    <span
                      key={i}
                      role={dateStr ? 'gridcell' : 'presentation'}
                      className={[
                        dateStr ? styles.dot : styles.spacer,
                        phase ? styles[`phase_${phase}`] : '',
                        isToday ? styles.today : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      aria-label={
                        dateStr
                          ? `${dateStr}${
                              phaseMap[dateStr]
                                ? ` — ${t(`phase_${phaseMap[dateStr]}`)}`
                                : ` — ${t('no_data')}`
                            }${
                              isToday ? ' (today)' : ''
                            }`
                          : undefined
                      }
                      aria-current={isToday ? 'date' : undefined}
                    >
                      {dayNum !== null && (
                        <span className={styles.dayNum}>{dayNum}</span>
                      )}
                    </span>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <div className={styles.legend}>
        {(['menstrual', 'follicular', 'ovulation', 'luteal'] as const).map((p) => (
          <span key={p} className={styles.legendItem}>
            <span className={`${styles.legendSwatch} ${styles[`phase_${p}`]}`} />
            <span className={styles.legendLabel}>{t(`phase_${p}`)}</span>
          </span>
        ))}
      </div>
    </section>
  )
}
