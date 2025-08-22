import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { Calendar, User, Play, CheckCircle, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AthleteProgram } from '@/types/supabase';

interface WorkoutProgram {
  id: string;
  title: string;
  description: string;
  instructions: string;
  scheduled_date: string;
  created_at: string;
  coach_first_name?: string;
  coach_last_name?: string;
  session?: {
    id: string;
    completed: boolean;
    completed_at: string;
  };
}

const WorkoutPrograms = () => {
  const { profile } = useAuthContext();
  const [programs, setPrograms] = useState<WorkoutProgram[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrograms();
  }, [profile]);

  const fetchPrograms = async () => {
    if (!profile?.id) return;

    try {
      const { data, error } = await (supabase as any).rpc('list_my_programs');

      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger vos programmes",
          variant: "destructive",
        });
        return;
      }

      const formattedPrograms: WorkoutProgram[] = (data || []).map((row: any) => ({
        id: row.id,
        title: row.title,
        description: row.description,
        instructions: row.instructions,
        scheduled_date: row.scheduled_date,
        created_at: row.created_at,
        coach_first_name: row.coach_first_name,
        coach_last_name: row.coach_last_name,
        session: row.session_id ? {
          id: row.session_id,
          completed: !!row.session_completed,
          completed_at: row.session_completed_at,
        } : undefined,
      }));

      setPrograms(formattedPrograms);
    } catch (error) {
      console.error('Error fetching programs:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du chargement",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsCompleted = async (programId: string) => {
    if (!profile?.id) return;

    try {
      // First, create or get the workout session
      let sessionId;
      const { data: existingSession } = await supabase
        .from('workout_sessions')
        .select('id')
        .eq('workout_program_id', programId)
        .eq('athlete_id', profile.id)
        .maybeSingle();

      if (existingSession) {
        sessionId = existingSession.id;
      } else {
        const { data: newSession, error: sessionError } = await supabase
          .from('workout_sessions')
          .insert({
            workout_program_id: programId,
            athlete_id: profile.id,
            completed: true,
            completed_at: new Date().toISOString(),
          })
          .select('id')
          .single();

        if (sessionError) {
          throw sessionError;
        }
        sessionId = newSession.id;
      }

      // Update session to completed if it wasn't already
      if (existingSession) {
        const { error: updateError } = await supabase
          .from('workout_sessions')
          .update({
            completed: true,
            completed_at: new Date().toISOString(),
          })
          .eq('id', sessionId);

        if (updateError) {
          throw updateError;
        }
      }

      toast({
        title: "Entraînement terminé !",
        description: "Félicitations pour avoir terminé votre séance",
      });

      // Refresh the programs list
      fetchPrograms();
    } catch (error) {
      console.error('Error marking workout as completed:', error);
      toast({
        title: "Erreur",
        description: "Impossible de marquer l'entraînement comme terminé",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="w-3/4 h-4 bg-muted rounded mb-2" />
              <div className="w-1/2 h-3 bg-muted rounded" />
            </CardHeader>
            <CardContent>
              <div className="w-full h-20 bg-muted rounded mb-4" />
              <div className="w-24 h-8 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (programs.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Aucun programme</h3>
          <p className="text-muted-foreground text-center">
            Votre coach ne vous a pas encore assigné de programme d'entraînement.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {programs.map((program) => {
        const isCompleted = program.session?.completed;
        const isScheduledToday = program.scheduled_date === new Date().toISOString().split('T')[0];
        
        return (
          <Card key={program.id} className={`hover:shadow-md transition-shadow ${isCompleted ? 'bg-muted/30' : ''}`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-base mb-1 flex items-center gap-2">
                    {program.title}
                    {isCompleted && <CheckCircle className="h-4 w-4 text-green-600" />}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <User className="h-3 w-3" />
                    Coach: {program.coach_first_name || '—'} {program.coach_last_name || ''}
                  </CardDescription>
                </div>
                <div className="flex flex-col gap-2">
                  {isCompleted ? (
                    <Badge variant="secondary">Terminé</Badge>
                  ) : isScheduledToday ? (
                    <Badge>Aujourd'hui</Badge>
                  ) : (
                    <Badge variant="outline">À faire</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                {program.description || 'Aucune description'}
              </p>
              
              {program.instructions && (
                <div className="mb-4 p-3 bg-muted/50 rounded-md">
                  <p className="text-sm font-medium mb-1">Instructions :</p>
                  <p className="text-sm text-muted-foreground">
                    {program.instructions}
                  </p>
                </div>
              )}

              <div className="space-y-2 mb-4">
                {program.scheduled_date && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    Programmé pour {new Date(program.scheduled_date).toLocaleDateString('fr-FR')}
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  Créé {formatDistanceToNow(new Date(program.created_at), { 
                    addSuffix: true,
                    locale: fr 
                  })}
                </div>
                {isCompleted && program.session?.completed_at && (
                  <div className="text-xs text-green-600">
                    ✓ Terminé {formatDistanceToNow(new Date(program.session.completed_at), { 
                      addSuffix: true,
                      locale: fr 
                    })}
                  </div>
                )}
              </div>

              {!isCompleted ? (
                <Button 
                  className="w-full" 
                  onClick={() => markAsCompleted(program.id)}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Marquer comme terminé
                </Button>
              ) : (
                <Button variant="outline" className="w-full" disabled>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Entraînement terminé
                </Button>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default WorkoutPrograms;