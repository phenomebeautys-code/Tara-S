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
  const months: { year: number; month: number; label: string }[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
    months.push({
      year: d.getFullYear(),
      month: d.getMonth(),
      label: d.toLocaleString('default', { month: 'long', year: 'numeric' }),
    })
  }

  const todayStr = today.toISOString().split('T')[0]

  if (loading) {
    return <div className={styles.skeleton} />
  }

  return (
    <section className={styles.section}>
      <p className={styles.eyebrow}>{t('eyebrow')}</p>
      <div className={styles.grid}>
        {months.map(({ year, month, label }) => {
          const cells = getMonthGrid(year, month)
          return (
            <div key={`${year}-${month}`} className={styles.month}>
              <p className={styles.monthLabel}>{label}</p>
              <div className={styles.dots}>
                {cells.map((dateStr, i) => (
                  <span
                    key={i}
                    className={[
                      styles.dot,
                      dateStr ? styles[`phase_${phaseMap[dateStr] ?? 'none'}`] : styles.spacer,
                      dateStr === todayStr ? styles.today : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    aria-label={
                      dateStr
                        ? phaseMap[dateStr]
                          ? t(`phase_${phaseMap[dateStr]}`)
                          : t('no_data')
                        : undefined
                    }
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>
      <div className={styles.legend}>
        {(['menstrual', 'follicular', 'ovulation', 'luteal'] as const).map((p) => (
          <span key={p} className={styles.legendItem}>
            <span className={`${styles.legendDot} ${styles[`phase_${p}`]}`} />
            <span className={styles.legendLabel}>{t(`phase_${p}`)}</span>
          </span>
        ))}
      </div>
    </section>
  )
}
