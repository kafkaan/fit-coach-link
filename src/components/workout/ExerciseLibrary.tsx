import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Plus, Play, Image } from 'lucide-react';
import { Exercise, ExerciseCategory } from '@/types/workout';

interface ExerciseLibraryProps {
  onExerciseSelect: (exercise: Exercise) => void;
  selectedExercises: string[];
}

// Mock data - replace with real API call
const MOCK_EXERCISES: Exercise[] = [
  {
    id: '1',
    name: 'Push-ups',
    description: 'Classic bodyweight exercise for chest, shoulders, and triceps',
    category: 'strength',
    muscleGroups: ['chest', 'shoulders', 'triceps'],
    difficulty: 'beginner',
    equipment: [],
  },
  {
    id: '2',
    name: 'Squats',
    description: 'Fundamental lower body exercise',
    category: 'strength',
    muscleGroups: ['quadriceps', 'glutes', 'hamstrings'],
    difficulty: 'beginner',
    equipment: [],
  },
  {
    id: '3',
    name: 'Running',
    description: 'Cardiovascular endurance exercise',
    category: 'cardio',
    muscleGroups: ['legs', 'core'],
    difficulty: 'intermediate',
    equipment: [],
  },
];

const CATEGORIES: { value: ExerciseCategory; label: string }[] = [
  { value: 'strength', label: 'Force' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'flexibility', label: 'Flexibilité' },
  { value: 'balance', label: 'Équilibre' },
  { value: 'sports_specific', label: 'Sport spécifique' },
  { value: 'rehabilitation', label: 'Rééducation' },
  { value: 'plyometric', label: 'Pliométrie' },
];

const DIFFICULTIES = [
  { value: 'beginner', label: 'Débutant' },
  { value: 'intermediate', label: 'Intermédiaire' },
  { value: 'advanced', label: 'Avancé' },
];

export function ExerciseLibrary({ onExerciseSelect, selectedExercises }: ExerciseLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [muscleGroupFilter, setMuscleGroupFilter] = useState<string>('all');

  const filteredExercises = useMemo(() => {
    return MOCK_EXERCISES.filter((exercise) => {
      const matchesSearch = exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          exercise.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || exercise.category === categoryFilter;
      const matchesDifficulty = difficultyFilter === 'all' || exercise.difficulty === difficultyFilter;
      const matchesMuscleGroup = muscleGroupFilter === 'all' || 
                               exercise.muscleGroups.some(mg => mg.toLowerCase().includes(muscleGroupFilter.toLowerCase()));
      
      return matchesSearch && matchesCategory && matchesDifficulty && matchesMuscleGroup;
    });
  }, [searchQuery, categoryFilter, difficultyFilter, muscleGroupFilter]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-64">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un exercice..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les catégories</SelectItem>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Difficulté" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous niveaux</SelectItem>
            {DIFFICULTIES.map((diff) => (
              <SelectItem key={diff.value} value={diff.value}>{diff.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          placeholder="Groupe musculaire..."
          value={muscleGroupFilter}
          onChange={(e) => setMuscleGroupFilter(e.target.value)}
          className="w-48"
        />
      </div>

      {/* Exercise Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredExercises.map((exercise) => (
          <Card key={exercise.id} className={`cursor-pointer transition-all hover:shadow-md ${
            selectedExercises.includes(exercise.id) ? 'ring-2 ring-primary' : ''
          }`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-base font-semibold">{exercise.name}</CardTitle>
                  <CardDescription className="text-sm mt-1 line-clamp-2">
                    {exercise.description}
                  </CardDescription>
                </div>
                <div className="flex flex-col gap-1 ml-2">
                  {exercise.imageUrl && <Image className="h-4 w-4 text-muted-foreground" />}
                  {exercise.videoUrl && <Play className="h-4 w-4 text-muted-foreground" />}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex flex-wrap gap-1">
                  {exercise.muscleGroups.slice(0, 3).map((muscle) => (
                    <Badge key={muscle} variant="secondary" className="text-xs">
                      {muscle}
                    </Badge>
                  ))}
                  {exercise.muscleGroups.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{exercise.muscleGroups.length - 3}
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <Badge className={`text-xs ${getDifficultyColor(exercise.difficulty)}`}>
                    {DIFFICULTIES.find(d => d.value === exercise.difficulty)?.label}
                  </Badge>
                  
                  <Button
                    size="sm"
                    variant={selectedExercises.includes(exercise.id) ? "default" : "outline"}
                    onClick={() => onExerciseSelect(exercise)}
                    className="h-8"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {selectedExercises.includes(exercise.id) ? 'Ajouté' : 'Ajouter'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredExercises.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Aucun exercice trouvé avec ces critères</p>
        </div>
      )}
    </div>
  );
}