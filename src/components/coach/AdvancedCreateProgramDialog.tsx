import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import { AdvancedWorkoutCreator } from '../workout/AdvancedWorkoutCreator';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { useErrorHandler } from '@/hooks/useError';

interface AdvancedCreateProgramDialogProps {
  onCreated?: () => void;
  trigger?: React.ReactNode;
  athletes: Array<{ id: string; name: string; }>;
}

export function AdvancedCreateProgramDialog({ 
  onCreated, 
  trigger, 
  athletes 
}: AdvancedCreateProgramDialogProps) {
  const [open, setOpen] = useState(false);
  const { profile } = useAuthContext();
  const { handleError, handleSuccess } = useErrorHandler();

  const handleSave = async (programData: any) => {
    if (!profile?.id) return;

    try {
      // Save comprehensive program info to Supabase
      const { data, error } = await supabase
        .from('workout_programs')
        .insert({
          coach_id: profile.id,
          athlete_id: programData.athleteId || null,
          title: programData.title || 'Programme sans titre',
          description: programData.description || null,
          instructions: JSON.stringify({
            objectives: programData.objectives || [],
            programType: programData.programType,
            phase: programData.phase,
            difficulty: programData.difficulty,
            location: programData.location,
            timeOfDay: programData.timeOfDay,
            frequency: programData.frequency,
            coachingCues: programData.coachingCues || [],
            safetyNotes: programData.contraindications || [],
          }),
          scheduled_date: programData.scheduledDate ? new Date(programData.scheduledDate).toISOString().split('T')[0] : null,
          // Store detailed program structure in media_urls as JSON
          media_urls: programData.blocks ? [JSON.stringify({
            blocks: programData.blocks,
            equipment: programData.equipment,
            hrZones: programData.hrZones,
            trackMetrics: programData.trackMetrics,
            nutritionPlan: {
              preWorkout: programData.preWorkoutNutrition,
              postWorkout: programData.postWorkoutNutrition,
              hydrationReminders: programData.hydrationReminders,
            },
            advanced: {
              autoProgression: programData.autoProgression,
              deloadWeek: programData.deloadWeek,
              periodization: programData.periodization,
              testingProtocol: programData.testingProtocol,
            },
            tags: programData.tags,
            version: 1,
          })] : null,
        })
        .select()
        .single();

      if (error) {
        handleError(error, 'Création du programme avancé');
        return;
      }

      handleSuccess('Programme avancé créé avec succès ! Toutes les données détaillées ont été sauvegardées.');
      setOpen(false);
      onCreated?.();
    } catch (error) {
      handleError(error, 'Sauvegarde du programme avancé');
    }
  };

  const handlePreview = (program: any) => {
    // For now, just log the program. In a real app, you'd show a comprehensive preview modal
    console.log('Programme avancé - Aperçu:', program);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Créateur Avancé
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-[98vw] max-h-[98vh] overflow-hidden p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>Créateur de Programme Ultra-Avancé</DialogTitle>
          <DialogDescription>
            Interface complète avec tous les paramètres possibles pour créer des programmes d'entraînement professionnels
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto">
          <AdvancedWorkoutCreator
            onSave={handleSave}
            onPreview={handlePreview}
            athletes={athletes}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}