-- Lower threshold from 3 to 2 cycles (3 start dates = 2 complete cycles).
-- Remove all hardcoded English strings — return neutral keys the UI translates.
CREATE OR REPLACE FUNCTION public.get_personal_insights(p_user_id uuid)
 RETURNS TABLE(insight text)
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_avg_cycle NUMERIC(5,2);
  v_avg_duration NUMERIC(5,2);
  v_variability NUMERIC(5,2);
  v_total INTEGER;
BEGIN
  SELECT cs.avg_cycle_length, cs.avg_period_duration, cs.cycle_variability, cs.total_cycles_logged
  INTO v_avg_cycle, v_avg_duration, v_variability, v_total
  FROM public.cycle_stats cs WHERE cs.user_id = p_user_id;

  -- Threshold lowered to 2: 3 onboarding start dates yield 2 complete cycles.
  IF v_total IS NULL OR v_total < 2 THEN
    RETURN QUERY SELECT 'need_more_data'::TEXT;
    RETURN;
  END IF;

  IF v_avg_cycle IS NOT NULL THEN
    RETURN QUERY SELECT ('avg_cycle:' || ROUND(v_avg_cycle)::TEXT)::TEXT;
  END IF;

  IF v_avg_duration IS NOT NULL THEN
    RETURN QUERY SELECT ('avg_duration:' || ROUND(v_avg_duration)::TEXT)::TEXT;
  END IF;

  IF v_variability IS NOT NULL THEN
    IF v_variability <= 2 THEN
      RETURN QUERY SELECT 'variability_consistent'::TEXT;
    ELSIF v_variability <= 4 THEN
      RETURN QUERY SELECT 'variability_regular'::TEXT;
    ELSE
      RETURN QUERY SELECT ('variability_irregular:' || ROUND(v_variability)::TEXT)::TEXT;
    END IF;
  END IF;
END;
$$;
