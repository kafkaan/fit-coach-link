import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import { WorkoutBuilder } from '../workout/WorkoutBuilder';
import { WorkoutProgram } from '@/types/workout';
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

  const handleSave = async (programData: Partial<WorkoutProgram>) => {
    if (!profile?.id) return;

    try {
      // Save basic program info to Supabase
      const { data, error } = await supabase
        .from('workout_programs')
        .insert({
          coach_id: profile.id,
          athlete_id: programData.athleteId || null,
          title: programData.title || 'Programme sans titre',
          description: programData.description || null,
          instructions: programData.instructions || null,
          scheduled_date: programData.scheduledDate || null,
          // For now, we'll store extended data in media_urls as JSON
          // In a real app, you'd want separate tables for blocks, exercises etc.
          media_urls: programData.blocks ? [JSON.stringify({
            blocks: programData.blocks,
            goals: programData.goals,
            equipment: programData.equipment,
            tags: programData.tags,
            difficulty: programData.difficulty,
          })] : null,
        })
        .select()
        .single();

      if (error) {
        handleError(error, 'Creation du programme');
        return;
      }

      handleSuccess('Programme créé avec succès !');
      setOpen(false);
      onCreated?.();
    } catch (error) {
      handleError(error, 'Sauvegarde du programme');
    }
  };

  const handlePreview = (program: WorkoutProgram) => {
    // For now, just log the program. In a real app, you'd show a preview modal
    console.log('Program preview:', program);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Créer un programme avancé
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Créateur de programme avancé</DialogTitle>
          <DialogDescription>
            Créez un programme d'entraînement complet avec des blocs d'exercices personnalisés
          </DialogDescription>
        </DialogHeader>
        
        <WorkoutBuilder
          onSave={handleSave}
          onPreview={handlePreview}
          athletes={athletes}
        />
      </DialogContent>
    </Dialog>
  );
}