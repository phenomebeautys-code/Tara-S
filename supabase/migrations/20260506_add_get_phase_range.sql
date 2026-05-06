-- Returns one row per day in range with phase_name for the cycle calendar.
-- Efficiently computed from period_logs; no per-day RPC calls needed from the client.
CREATE OR REPLACE FUNCTION public.get_phase_range(
  p_user_id   uuid,
  p_start     date,
  p_end       date
)
RETURNS TABLE(day date, phase_name text)
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_avg_cycle INTEGER;
BEGIN
  SELECT COALESCE(ROUND(cs.avg_cycle_length)::INTEGER, 28)
  INTO v_avg_cycle
  FROM public.cycle_stats cs
  WHERE cs.user_id = p_user_id;

  RETURN QUERY
  SELECT
    d::date AS day,
    CASE
      WHEN EXISTS (
        SELECT 1 FROM public.period_logs pl
        WHERE pl.user_id = p_user_id
          AND d::date >= pl.start_date
          AND d::date < pl.start_date + INTERVAL '6 days'
      ) THEN 'menstrual'
      ELSE (
        SELECT
          CASE
            WHEN cycle_day <= 6  THEN 'menstrual'
            WHEN cycle_day <= ROUND(v_avg_cycle * 0.45) THEN 'follicular'
            WHEN cycle_day <= ROUND(v_avg_cycle * 0.55) THEN 'ovulation'
            ELSE 'luteal'
          END
        FROM (
          SELECT
            (d::date - MAX(pl2.start_date) + 1)::INTEGER AS cycle_day
          FROM public.period_logs pl2
          WHERE pl2.user_id = p_user_id
            AND pl2.start_date <= d::date
        ) sub
        WHERE cycle_day IS NOT NULL AND cycle_day > 0
      )
    END AS phase_name
  FROM generate_series(p_start, p_end, '1 day'::interval) d
  ORDER BY day;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_phase_range(uuid, date, date) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.get_phase_range(uuid, date, date) FROM anon;
