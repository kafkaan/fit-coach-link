import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { Calendar, User, Edit, Trash2, Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface WorkoutProgram {
  id: string;
  title: string;
  description: string;
  scheduled_date: string;
  created_at: string;
  athlete: {
    first_name: string;
    last_name: string;
  };
}

const ProgramsManager = () => {
  const { profile } = useAuthContext();
  const [programs, setPrograms] = useState<WorkoutProgram[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrograms();
  }, [profile]);

  const fetchPrograms = async () => {
    if (!profile?.id) return;

    try {
      const { data, error } = await supabase
        .from('workout_programs')
        .select(`
          id,
          title,
          description,
          scheduled_date,
          created_at,
          athlete:profiles!workout_programs_athlete_id_fkey (
            first_name,
            last_name
          )
        `)
        .eq('coach_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger les programmes",
          variant: "destructive",
        });
        return;
      }

      setPrograms(data || []);
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

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="w-3/4 h-4 bg-muted rounded mb-2" />
              <div className="w-1/2 h-3 bg-muted rounded" />
            </CardHeader>
            <CardContent>
              <div className="w-full h-16 bg-muted rounded mb-4" />
              <div className="flex gap-2">
                <div className="w-16 h-8 bg-muted rounded" />
                <div className="w-16 h-8 bg-muted rounded" />
              </div>
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
          <p className="text-muted-foreground text-center mb-4">
            Vous n'avez pas encore créé de programmes d'entraînement.
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Créer un programme
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {programs.map((program) => (
        <Card key={program.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-base mb-1">{program.title}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <User className="h-3 w-3" />
                  {program.athlete.first_name} {program.athlete.last_name}
                </CardDescription>
              </div>
              <Badge variant="outline">
                {program.scheduled_date ? 'Programmé' : 'Brouillon'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
              {program.description || 'Aucune description'}
            </p>
            
            <div className="space-y-2 mb-4">
              {program.scheduled_date && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  Prévu pour {new Date(program.scheduled_date).toLocaleDateString('fr-FR')}
                </div>
              )}
              <div className="text-xs text-muted-foreground">
                Créé {formatDistanceToNow(new Date(program.created_at), { 
                  addSuffix: true,
                  locale: fr 
                })}
              </div>
            </div>

            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex-1">
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </Button>
              <Button size="sm" variant="outline">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ProgramsManager;