import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  GripVertical, 
  Trash2, 
  Clock, 
  Plus, 
  Edit3,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { WorkoutBlock, Exercise } from '@/types/workout';

interface WorkoutBlockEditorProps {
  block: WorkoutBlock;
  onUpdate: (updatedBlock: Partial<WorkoutBlock>) => void;
  onDelete: () => void;
  dragHandleProps?: any;
}

const BLOCK_TYPES = [
  { value: 'warmup', label: 'Échauffement', color: 'bg-green-100 text-green-800' },
  { value: 'main', label: 'Principal', color: 'bg-blue-100 text-blue-800' },
  { value: 'cooldown', label: 'Récupération', color: 'bg-purple-100 text-purple-800' },
  { value: 'strength', label: 'Force', color: 'bg-red-100 text-red-800' },
  { value: 'cardio', label: 'Cardio', color: 'bg-orange-100 text-orange-800' },
  { value: 'flexibility', label: 'Flexibilité', color: 'bg-indigo-100 text-indigo-800' },
];

export function WorkoutBlockEditor({ 
  block, 
  onUpdate, 
  onDelete, 
  dragHandleProps 
}: WorkoutBlockEditorProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const blockType = BLOCK_TYPES.find(type => type.value === block.type);

  const handleFieldUpdate = (field: keyof WorkoutBlock, value: any) => {
    onUpdate({ [field]: value });
  };

  const addExercise = () => {
    const newExercise: Exercise = {
      id: `exercise-${Date.now()}`,
      name: 'Nouvel exercice',
      category: 'strength',
      muscleGroups: [],
      difficulty: 'intermediate',
    };
    
    handleFieldUpdate('exercises', [...block.exercises, newExercise]);
  };

  const updateExercise = (exerciseId: string, updatedExercise: Partial<Exercise>) => {
    const exercises = block.exercises.map(exercise =>
      exercise.id === exerciseId ? { ...exercise, ...updatedExercise } : exercise
    );
    handleFieldUpdate('exercises', exercises);
  };

  const removeExercise = (exerciseId: string) => {
    const exercises = block.exercises.filter(exercise => exercise.id !== exerciseId);
    handleFieldUpdate('exercises', exercises);
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div {...dragHandleProps} className="cursor-grab active:cursor-grabbing">
              <GripVertical className="h-5 w-5 text-muted-foreground" />
            </div>
            
            <div className="flex items-center gap-2">
              <Badge className={blockType?.color}>
                {blockType?.label}
              </Badge>
              
              {isEditing ? (
                <Input
                  value={block.title}
                  onChange={(e) => handleFieldUpdate('title', e.target.value)}
                  onBlur={() => setIsEditing(false)}
                  onKeyPress={(e) => e.key === 'Enter' && setIsEditing(false)}
                  className="h-8 w-48"
                  autoFocus
                />
              ) : (
                <CardTitle 
                  className="text-lg cursor-pointer hover:text-primary"
                  onClick={() => setIsEditing(true)}
                >
                  {block.title}
                </CardTitle>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {block.duration && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {block.duration} min
              </div>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 
                <ChevronUp className="h-4 w-4" /> : 
                <ChevronDown className="h-4 w-4" />
              }
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Type de bloc</Label>
              <Select
                value={block.type}
                onValueChange={(value) => handleFieldUpdate('type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BLOCK_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor={`duration-${block.id}`}>Durée (min)</Label>
              <Input
                id={`duration-${block.id}`}
                type="number"
                value={block.duration || ''}
                onChange={(e) => handleFieldUpdate('duration', parseInt(e.target.value) || undefined)}
                placeholder="0"
              />
            </div>
            
            <div className="flex items-end">
              <Button
                variant="outline"
                size="sm"
                onClick={addExercise}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter exercice
              </Button>
            </div>
          </div>

          {block.instructions && (
            <div>
              <Label htmlFor={`instructions-${block.id}`}>Instructions</Label>
              <Textarea
                id={`instructions-${block.id}`}
                value={block.instructions}
                onChange={(e) => handleFieldUpdate('instructions', e.target.value)}
                placeholder="Instructions spécifiques pour ce bloc..."
                rows={2}
              />
            </div>
          )}

          {/* Exercises List */}
          {block.exercises.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Exercices ({block.exercises.length})</h4>
              <div className="space-y-2">
                {block.exercises.map((exercise, index) => (
                  <div
                    key={exercise.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-6 h-6 bg-primary/10 text-primary text-sm font-medium rounded">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{exercise.name}</div>
                        {exercise.description && (
                          <div className="text-sm text-muted-foreground">
                            {exercise.description}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const name = prompt('Nom de l\'exercice:', exercise.name);
                          if (name) updateExercise(exercise.id, { name });
                        }}
                      >
                        <Edit3 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeExercise(exercise.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {block.exercises.length === 0 && (
            <div className="text-center py-6 border-2 border-dashed rounded-md">
              <p className="text-muted-foreground">
                Aucun exercice dans ce bloc
              </p>
              <Button
                variant="ghost"
                onClick={addExercise}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter le premier exercice
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}