export interface Exercise {
  id: string;
  name: string;
  description?: string;
  sets?: number;
  reps?: string;
  duration?: string;
  rest?: string;
  weight?: string;
  notes?: string;
  videoUrl?: string;
  imageUrl?: string;
  category: ExerciseCategory;
  equipment?: string[];
  muscleGroups: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface ExerciseSet {
  reps?: number;
  weight?: number;
  duration?: number;
  rest?: number;
  notes?: string;
}

export interface WorkoutBlock {
  id: string;
  title: string;
  type: 'warmup' | 'main' | 'cooldown' | 'strength' | 'cardio' | 'flexibility';
  exercises: Exercise[];
  duration?: number;
  instructions?: string;
  order: number;
}

export interface WorkoutProgram {
  id: string;
  title: string;
  description?: string;
  instructions?: string;
  scheduledDate?: string;
  duration?: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  equipment: string[];
  goals: WorkoutGoal[];
  blocks: WorkoutBlock[];
  tags: string[];
  mediaUrls?: string[];
  isTemplate: boolean;
  coachId: string;
  athleteId?: string;
  createdAt: string;
  updatedAt: string;
}

export type ExerciseCategory = 
  | 'strength'
  | 'cardio'
  | 'flexibility'
  | 'balance'
  | 'sports_specific'
  | 'rehabilitation'
  | 'plyometric';

export type WorkoutGoal = 
  | 'strength'
  | 'endurance'
  | 'flexibility'
  | 'weight_loss'
  | 'muscle_gain'
  | 'sports_performance'
  | 'rehabilitation'
  | 'general_fitness';

export interface WorkoutTemplate {
  id: string;
  name: string;
  description: string;
  category: ExerciseCategory;
  estimatedDuration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  blocks: Omit<WorkoutBlock, 'id'>[];
}