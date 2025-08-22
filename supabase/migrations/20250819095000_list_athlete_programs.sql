-- RPC: list programs for current athlete with coach names and latest session
CREATE OR REPLACE FUNCTION public.list_my_programs()
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  instructions TEXT,
  scheduled_date DATE,
  created_at TIMESTAMPTZ,
  coach_first_name TEXT,
  coach_last_name TEXT,
  session_id UUID,
  session_completed BOOLEAN,
  session_completed_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH me AS (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
  SELECT
    wp.id,
    wp.title,
    wp.description,
    wp.instructions,
    wp.scheduled_date,
    wp.created_at,
    coach.first_name AS coach_first_name,
    coach.last_name AS coach_last_name,
    ws.id AS session_id,
    ws.completed AS session_completed,
    ws.completed_at AS session_completed_at
  FROM public.workout_programs wp
  JOIN me ON wp.athlete_id = me.id
  LEFT JOIN public.profiles coach ON coach.id = wp.coach_id
  LEFT JOIN LATERAL (
    SELECT id, completed, completed_at
    FROM public.workout_sessions
    WHERE workout_program_id = wp.id AND athlete_id = wp.athlete_id
    ORDER BY created_at DESC
    LIMIT 1
  ) ws ON TRUE
  ORDER BY wp.scheduled_date NULLS LAST, wp.created_at DESC;
$$;

REVOKE ALL ON FUNCTION public.list_my_programs() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.list_my_programs() TO authenticated;


