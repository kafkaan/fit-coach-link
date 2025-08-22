-- Weekly activity (assigned vs completed) for current coach over last 7 days
CREATE OR REPLACE FUNCTION public.coach_weekly_activity()
RETURNS TABLE (
  day_date DATE,
  assigned_count INTEGER,
  completed_count INTEGER
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH me AS (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  ), days AS (
    SELECT generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, INTERVAL '1 day')::date AS day_date
  ), assigned AS (
    SELECT wp.scheduled_date::date AS day_date, COUNT(*) AS assigned_count
    FROM public.workout_programs wp, me
    WHERE wp.coach_id = me.id AND wp.scheduled_date IS NOT NULL
      AND wp.scheduled_date BETWEEN CURRENT_DATE - INTERVAL '6 days' AND CURRENT_DATE
    GROUP BY 1
  ), completed AS (
    SELECT ws.completed_at::date AS day_date, COUNT(*) AS completed_count
    FROM public.workout_sessions ws
    JOIN public.workout_programs wp ON wp.id = ws.workout_program_id
    JOIN me ON wp.coach_id = me.id
    WHERE ws.completed = TRUE AND ws.completed_at IS NOT NULL
      AND ws.completed_at::date BETWEEN CURRENT_DATE - INTERVAL '6 days' AND CURRENT_DATE
    GROUP BY 1
  )
  SELECT d.day_date,
         COALESCE(a.assigned_count, 0) AS assigned_count,
         COALESCE(c.completed_count, 0) AS completed_count
  FROM days d
  LEFT JOIN assigned a ON a.day_date = d.day_date
  LEFT JOIN completed c ON c.day_date = d.day_date
  ORDER BY d.day_date;
$$;

REVOKE ALL ON FUNCTION public.coach_weekly_activity() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.coach_weekly_activity() TO authenticated;

-- Active athletes this week for current coach
CREATE OR REPLACE FUNCTION public.coach_active_this_week()
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH me AS (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
  SELECT COUNT(DISTINCT ws.athlete_id)::int
  FROM public.workout_sessions ws
  JOIN public.workout_programs wp ON wp.id = ws.workout_program_id
  JOIN me ON wp.coach_id = me.id
  WHERE ws.completed_at::date BETWEEN CURRENT_DATE - INTERVAL '6 days' AND CURRENT_DATE;
$$;

REVOKE ALL ON FUNCTION public.coach_active_this_week() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.coach_active_this_week() TO authenticated;

-- Monthly fitness trends (avg motivation/energy/fatigue) for current coach over last 6 months
CREATE OR REPLACE FUNCTION public.coach_fitness_trends()
RETURNS TABLE (
  month_label TEXT,
  motivation_avg NUMERIC,
  energy_avg NUMERIC,
  fatigue_avg NUMERIC
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH me AS (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  ), months AS (
    SELECT to_char(date_trunc('month', CURRENT_DATE) - (n || ' months')::interval, 'Mon') AS month_label,
           date_trunc('month', CURRENT_DATE) - (n || ' months')::interval AS month_start,
           (date_trunc('month', CURRENT_DATE) - (n || ' months')::interval + INTERVAL '1 month') AS month_end
    FROM generate_series(5, 0, -1) AS g(n)
  ), data AS (
    SELECT m.month_label,
           avg(fa.motivation_level)::numeric(10,2) AS motivation_avg,
           avg(fa.energy_level)::numeric(10,2) AS energy_avg,
           avg(fa.fatigue_level)::numeric(10,2) AS fatigue_avg
    FROM months m
    LEFT JOIN public.workout_sessions ws ON ws.created_at >= m.month_start AND ws.created_at < m.month_end
    LEFT JOIN public.workout_programs wp ON wp.id = ws.workout_program_id
    LEFT JOIN me ON wp.coach_id = me.id
    LEFT JOIN public.fitness_assessments fa ON fa.workout_session_id = ws.id
    GROUP BY m.month_label, m.month_start
    ORDER BY m.month_start
  )
  SELECT * FROM data;
$$;

REVOKE ALL ON FUNCTION public.coach_fitness_trends() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.coach_fitness_trends() TO authenticated;


