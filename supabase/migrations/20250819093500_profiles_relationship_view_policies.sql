-- Allow coaches to view athlete profiles they are linked to
CREATE POLICY "Coaches can view their athletes' profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM public.coach_athlete_relationships car
      JOIN public.profiles coach_p ON car.coach_id = coach_p.id
      WHERE car.athlete_id = profiles.id
        AND coach_p.user_id = auth.uid()
    )
  );

-- Optionally, allow athletes to view their coach profiles
CREATE POLICY "Athletes can view their coach profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM public.coach_athlete_relationships car
      JOIN public.profiles athlete_p ON car.athlete_id = athlete_p.id
      WHERE car.coach_id = profiles.id
        AND athlete_p.user_id = auth.uid()
    )
  );


