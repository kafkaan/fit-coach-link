import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { 
  Plus, 
  GripVertical, 
  Trash2, 
  Clock, 
  Target, 
  Users, 
  Calendar,
  Save,
  Eye,
  Settings
} from 'lucide-react';
import { WorkoutProgram, WorkoutBlock, Exercise, WorkoutGoal } from '@/types/workout';
import { ExerciseLibrary } from './ExerciseLibrary';
import { WorkoutBlockEditor } from './WorkoutBlockEditor';

interface WorkoutBuilderProps {
  program?: WorkoutProgram;
  onSave: (program: Partial<WorkoutProgram>) => Promise<void>;
  onPreview?: (program: WorkoutProgram) => void;
  athletes: Array<{ id: string; name: string; }>;
}

const WORKOUT_GOALS: { value: WorkoutGoal; label: string }[] = [
  { value: 'strength', label: 'Force' },
  { value: 'endurance', label: 'Endurance' },
  { value: 'flexibility', label: 'Flexibilité' },
  { value: 'weight_loss', label: 'Perte de poids' },
  { value: 'muscle_gain', label: 'Prise de masse' },
  { value: 'sports_performance', label: 'Performance sportive' },
  { value: 'rehabilitation', label: 'Rééducation' },
  { value: 'general_fitness', label: 'Forme générale' },
];

export function WorkoutBuilder({ program, onSave, onPreview, athletes }: WorkoutBuilderProps) {
  const [activeTab, setActiveTab] = useState('details');
  const [workoutData, setWorkoutData] = useState<Partial<WorkoutProgram>>({
    title: program?.title || '',
    description: program?.description || '',
    instructions: program?.instructions || '',
    difficulty: program?.difficulty || 'intermediate',
    goals: program?.goals || [],
    equipment: program?.equipment || [],
    tags: program?.tags || [],
    blocks: program?.blocks || [],
    athleteId: program?.athleteId,
    scheduledDate: program?.scheduledDate,
    ...program,
  });
  
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [currentBlock, setCurrentBlock] = useState<WorkoutBlock | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (field: keyof WorkoutProgram, value: any) => {
    setWorkoutData(prev => ({ ...prev, [field]: value }));
  };

  const handleGoalToggle = (goal: WorkoutGoal) => {
    const currentGoals = workoutData.goals || [];
    const newGoals = currentGoals.includes(goal)
      ? currentGoals.filter(g => g !== goal)
      : [...currentGoals, goal];
    handleInputChange('goals', newGoals);
  };

  const handleEquipmentAdd = (equipment: string) => {
    if (equipment && !workoutData.equipment?.includes(equipment)) {
      handleInputChange('equipment', [...(workoutData.equipment || []), equipment]);
    }
  };

  const handleEquipmentRemove = (equipment: string) => {
    handleInputChange('equipment', workoutData.equipment?.filter(e => e !== equipment) || []);
  };

  const addWorkoutBlock = (type: WorkoutBlock['type']) => {
    const newBlock: WorkoutBlock = {
      id: `block-${Date.now()}`,
      title: `Nouveau bloc ${type}`,
      type,
      exercises: [],
      order: (workoutData.blocks?.length || 0) + 1,
    };
    
    handleInputChange('blocks', [...(workoutData.blocks || []), newBlock]);
    setCurrentBlock(newBlock);
    setActiveTab('blocks');
  };

  const updateWorkoutBlock = (blockId: string, updatedBlock: Partial<WorkoutBlock>) => {
    const blocks = workoutData.blocks?.map(block =>
      block.id === blockId ? { ...block, ...updatedBlock } : block
    ) || [];
    handleInputChange('blocks', blocks);
  };

  const deleteWorkoutBlock = (blockId: string) => {
    const blocks = workoutData.blocks?.filter(block => block.id !== blockId) || [];
    handleInputChange('blocks', blocks);
    if (currentBlock?.id === blockId) {
      setCurrentBlock(null);
    }
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const blocks = Array.from(workoutData.blocks || []);
    const [reorderedBlock] = blocks.splice(result.source.index, 1);
    blocks.splice(result.destination.index, 0, reorderedBlock);

    // Update order property
    const reorderedBlocks = blocks.map((block, index) => ({
      ...block,
      order: index + 1,
    }));

    handleInputChange('blocks', reorderedBlocks);
  };

  const handleExerciseSelect = (exercise: Exercise) => {
    if (selectedExercises.includes(exercise.id)) {
      setSelectedExercises(prev => prev.filter(id => id !== exercise.id));
    } else {
      setSelectedExercises(prev => [...prev, exercise.id]);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(workoutData);
    } finally {
      setIsSaving(false);
    }
  };

  const estimatedDuration = workoutData.blocks?.reduce((total, block) => {
    return total + (block.duration || 0);
  }, 0) || 0;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {program ? 'Modifier le programme' : 'Nouveau programme'}
          </h1>
          <p className="text-muted-foreground mt-1">
            Créez un programme d'entraînement personnalisé pour vos athlètes
          </p>
        </div>
        
        <div className="flex gap-2">
          {workoutData.blocks && workoutData.blocks.length > 0 && (
            <Button variant="outline" onClick={() => onPreview?.(workoutData as WorkoutProgram)}>
              <Eye className="h-4 w-4 mr-2" />
              Aperçu
            </Button>
          )}
          <Button onClick={handleSave} disabled={isSaving || !workoutData.title}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-4 w-fit">
          <TabsTrigger value="details" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Détails
          </TabsTrigger>
          <TabsTrigger value="blocks" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Blocs d'exercices
          </TabsTrigger>
          <TabsTrigger value="exercises" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Bibliothèque
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Planification
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informations générales</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Titre du programme *</Label>
                    <Input
                      id="title"
                      value={workoutData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Ex: Entraînement force haut du corps"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={workoutData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Décrivez l'objectif et le contenu du programme..."
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="instructions">Instructions spéciales</Label>
                    <Textarea
                      id="instructions"
                      value={workoutData.instructions}
                      onChange={(e) => handleInputChange('instructions', e.target.value)}
                      placeholder="Consignes particulières, échauffement, récupération..."
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Objectifs d'entraînement</CardTitle>
                  <CardDescription>
                    Sélectionnez les objectifs principaux de ce programme
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {WORKOUT_GOALS.map((goal) => (
                      <Badge
                        key={goal.value}
                        variant={workoutData.goals?.includes(goal.value) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => handleGoalToggle(goal.value)}
                      >
                        {goal.label}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Paramètres</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Niveau de difficulté</Label>
                    <Select
                      value={workoutData.difficulty}
                      onValueChange={(value) => handleInputChange('difficulty', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Débutant</SelectItem>
                        <SelectItem value="intermediate">Intermédiaire</SelectItem>
                        <SelectItem value="advanced">Avancé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Durée estimée: {estimatedDuration || 0} min</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Target className="h-4 w-4" />
                    <span>Blocs: {workoutData.blocks?.length || 0}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Équipement requis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ajouter équipement..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleEquipmentAdd(e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {workoutData.equipment?.map((item, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {item}
                        <button
                          onClick={() => handleEquipmentRemove(item)}
                          className="ml-1 hover:text-destructive"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="blocks" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Blocs d'exercices</h2>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => addWorkoutBlock('warmup')}>
                <Plus className="h-4 w-4 mr-2" />
                Échauffement
              </Button>
              <Button variant="outline" onClick={() => addWorkoutBlock('main')}>
                <Plus className="h-4 w-4 mr-2" />
                Principal
              </Button>
              <Button variant="outline" onClick={() => addWorkoutBlock('cooldown')}>
                <Plus className="h-4 w-4 mr-2" />
                Récupération
              </Button>
            </div>
          </div>

          {workoutData.blocks && workoutData.blocks.length > 0 ? (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="workout-blocks">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                    {workoutData.blocks.map((block, index) => (
                      <Draggable key={block.id} draggableId={block.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`${snapshot.isDragging ? 'opacity-75' : ''}`}
                          >
                            <WorkoutBlockEditor
                              block={block}
                              onUpdate={(updatedBlock) => updateWorkoutBlock(block.id, updatedBlock)}
                              onDelete={() => deleteWorkoutBlock(block.id)}
                              dragHandleProps={provided.dragHandleProps}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Target className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucun bloc d'exercices</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Commencez par ajouter des blocs d'exercices pour structurer votre programme
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="exercises">
          <ExerciseLibrary
            onExerciseSelect={handleExerciseSelect}
            selectedExercises={selectedExercises}
          />
        </TabsContent>

        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Planification et attribution</CardTitle>
              <CardDescription>
                Attribuez le programme à un athlète et planifiez une date
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Athlète (optionnel)</Label>
                  <Select
                    value={workoutData.athleteId || ''}
                    onValueChange={(value) => handleInputChange('athleteId', value || undefined)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un athlète" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Aucun athlète spécifique</SelectItem>
                      {athletes.map((athlete) => (
                        <SelectItem key={athlete.id} value={athlete.id}>
                          {athlete.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="scheduledDate">Date programmée (optionnel)</Label>
                  <Input
                    id="scheduledDate"
                    type="date"
                    value={workoutData.scheduledDate || ''}
                    onChange={(e) => handleInputChange('scheduledDate', e.target.value || undefined)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}