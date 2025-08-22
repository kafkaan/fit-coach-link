-- Remove recursive profiles policies
DROP POLICY IF EXISTS "Coaches can view their athletes' profiles" ON public.profiles;
DROP POLICY IF EXISTS "Athletes can view their coach profiles" ON public.profiles;

-- RPC: list athletes of current coach (bypasses RLS via SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.list_coach_athletes()
RETURNS TABLE (
  id UUID,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT a.id, a.first_name, a.last_name, a.email, a.avatar_url, a.created_at
  FROM public.coach_athlete_relationships car
  JOIN public.profiles a ON a.id = car.athlete_id
  WHERE car.coach_id = (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
  ORDER BY a.created_at DESC;
$$;

REVOKE ALL ON FUNCTION public.list_coach_athletes() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.list_coach_athletes() TO authenticated;

-- RPC: list programs of current coach with athlete names
CREATE OR REPLACE FUNCTION public.list_coach_programs()
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  scheduled_date DATE,
  created_at TIMESTAMPTZ,
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


