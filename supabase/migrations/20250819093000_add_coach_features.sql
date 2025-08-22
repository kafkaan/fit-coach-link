-- Allow coaches to insert workout programs
CREATE POLICY "Coaches can create programs" ON public.workout_programs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = coach_id AND p.user_id = auth.uid() AND p.role = 'coach'
    )
  );

-- RPC to link athlete by email with SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.link_athlete_by_email(athlete_email TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_coach_id UUID;
  v_athlete_id UUID;
  v_role public.user_role;
BEGIN
  -- Find coach profile id from current auth user
  SELECT id INTO v_coach_id
  FROM public.profiles
  WHERE user_id = auth.uid() AND role = 'coach';

  IF v_coach_id IS NULL THEN
    RAISE EXCEPTION 'Only coaches can link athletes';
  END IF;

  -- Find athlete profile id by email
  SELECT id, role INTO v_athlete_id, v_role
  FROM public.profiles
  WHERE email = LOWER(TRIM(athlete_email));

  IF v_athlete_id IS NULL THEN
    RAISE EXCEPTION 'Athlete with this email not found';
  END IF;

  IF v_role <> 'athlete' THEN
    RAISE EXCEPTION 'Target profile is not an athlete';
  END IF;

  -- Insert relationship (ignore duplicates)
  INSERT INTO public.coach_athlete_relationships (coach_id, athlete_id)
  VALUES (v_coach_id, v_athlete_id)
  ON CONFLICT (coach_id, athlete_id) DO NOTHING;
END;
$$;

-- Allow execution of the function to authenticated users (the function has its own checks)
REVOKE ALL ON FUNCTION public.link_athlete_by_email(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.link_athlete_by_email(TEXT) TO authenticated;


