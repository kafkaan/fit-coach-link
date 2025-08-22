-- Fix 42P13 by dropping and recreating the function with new OUT columns
DROP FUNCTION IF EXISTS public.list_coach_programs();

CREATE FUNCTION public.list_coach_programs()
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  scheduled_date DATE,
  created_at TIMESTAMPTZ,
  athlete_id UUID,
  athlete_first_name TEXT,
  athlete_last_name TEXT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT wp.id,
         wp.title,
         wp.description,
         wp.scheduled_date,
         wp.created_at,
         a.id AS athlete_id,
         a.first_name AS athlete_first_name,
         a.last_name AS athlete_last_name
  FROM public.workout_programs wp
  JOIN public.profiles a ON a.id = wp.athlete_id
  WHERE wp.coach_id = (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
  ORDER BY wp.created_at DESC;
$$;

REVOKE ALL ON FUNCTION public.list_coach_programs() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.list_coach_programs() TO authenticated;


