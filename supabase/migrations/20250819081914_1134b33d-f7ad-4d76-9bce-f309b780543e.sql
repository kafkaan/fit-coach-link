-- Create user role enum
CREATE TYPE public.user_role AS ENUM ('coach', 'athlete');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'athlete',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create coach-athlete relationships table
CREATE TABLE public.coach_athlete_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  athlete_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(coach_id, athlete_id)
);

-- Create workout programs table
CREATE TABLE public.workout_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  athlete_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  instructions TEXT,
  media_urls TEXT[],
  scheduled_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workout sessions table (completed workouts)
CREATE TABLE public.workout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_program_id UUID REFERENCES public.workout_programs(id) ON DELETE CASCADE NOT NULL,
  athlete_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create fitness assessments table (before/after workout states)
CREATE TABLE public.fitness_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_session_id UUID REFERENCES public.workout_sessions(id) ON DELETE CASCADE NOT NULL,
  athlete_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  assessment_type TEXT NOT NULL CHECK (assessment_type IN ('pre_workout', 'post_workout')),
  fatigue_level INTEGER CHECK (fatigue_level >= 1 AND fatigue_level <= 10),
  pain_level INTEGER CHECK (pain_level >= 1 AND pain_level <= 10),
  motivation_level INTEGER CHECK (motivation_level >= 1 AND motivation_level <= 10),
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_athlete_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fitness_assessments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for coach_athlete_relationships
CREATE POLICY "Coaches can view their relationships" ON public.coach_athlete_relationships
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = coach_id AND user_id = auth.uid())
  );

CREATE POLICY "Athletes can view their relationships" ON public.coach_athlete_relationships
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = athlete_id AND user_id = auth.uid())
  );

CREATE POLICY "Coaches can create relationships" ON public.coach_athlete_relationships
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = coach_id AND user_id = auth.uid() AND role = 'coach')
  );

-- RLS Policies for workout_programs
CREATE POLICY "Coaches can manage their programs" ON public.workout_programs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = coach_id AND user_id = auth.uid())
  );

CREATE POLICY "Athletes can view their programs" ON public.workout_programs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = athlete_id AND user_id = auth.uid())
  );

-- RLS Policies for workout_sessions
CREATE POLICY "Athletes can manage their sessions" ON public.workout_sessions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = athlete_id AND user_id = auth.uid())
  );

CREATE POLICY "Coaches can view athlete sessions" ON public.workout_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.workout_programs wp
      JOIN public.profiles p ON wp.coach_id = p.id
      WHERE wp.id = workout_program_id AND p.user_id = auth.uid()
    )
  );

-- RLS Policies for fitness_assessments
CREATE POLICY "Athletes can manage their assessments" ON public.fitness_assessments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = athlete_id AND user_id = auth.uid())
  );

CREATE POLICY "Coaches can view athlete assessments" ON public.fitness_assessments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.workout_sessions ws
      JOIN public.workout_programs wp ON ws.workout_program_id = wp.id
      JOIN public.profiles p ON wp.coach_id = p.id
      WHERE ws.id = workout_session_id AND p.user_id = auth.uid()
    )
  );

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'athlete')
  );
  RETURN NEW;
END;
$$;

-- Trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workout_programs_updated_at
  BEFORE UPDATE ON public.workout_programs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workout_sessions_updated_at
  BEFORE UPDATE ON public.workout_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();