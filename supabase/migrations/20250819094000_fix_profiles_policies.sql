-- Fix recursion in profiles policies by using a SECURITY DEFINER helper

-- Drop the previous recursive policies if they exist
DROP POLICY IF EXISTS "Coaches can view their athletes' profiles" ON public.profiles;
DROP POLICY IF EXISTS "Athletes can view their coach profiles" ON public.profiles;

-- Helper function to fetch current user's profile id without triggering RLS recursion
CREATE OR REPLACE FUNCTION public.current_profile_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.profiles WHERE user_id = auth.uid();
$$;

REVOKE ALL ON FUNCTION public.current_profile_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.current_profile_id() TO authenticated;

-- Recreate policies using the helper (no self-reference to profiles in the policy body)
CREATE POLICY "Coaches can view their athletes' profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM public.coach_athlete_relationships car
      WHERE car.athlete_id = profiles.id
        AND car.coach_id = public.current_profile_id()
    )
  );

CREATE POLICY "Athletes can view their coach profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM public.coach_athlete_relationships car
      WHERE car.coach_id = profiles.id
        AND car.athlete_id = public.current_profile_id()
    )
  );


