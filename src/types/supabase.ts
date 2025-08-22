// Custom types for Supabase RPC functions
export interface SupabaseRpcResponse<T> {
  data: T | null;
  error: any;
}

export interface CoachAthlete {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url: string | null;
  created_at: string;
}

export interface CoachProgram {
  id: string;
  title: string;
  description: string | null;
  scheduled_date: string | null;
  created_at: string;
  athlete_id: string;
  athlete_first_name: string;
  athlete_last_name: string;
}

export interface AthleteProgram {
  id: string;
  title: string;
  description: string | null;
  instructions: string | null;
  scheduled_date: string | null;
  created_at: string;
  coach_first_name: string;
  coach_last_name: string;
  session_id: string | null;
  session_completed: boolean | null;
  session_completed_at: string | null;
}

export interface WeeklyActivity {
  day_date: string;
  assigned_count: number;
  completed_count: number;
}

export interface FitnessTrend {
  month_label: string;
  motivation_avg: number;
  energy_avg: number;
  fatigue_avg: number;
}