import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

type Program = {
  id: string;
  title: string;
  scheduled_date: string | null;
  created_at: string;
  completed: boolean;
  completed_at: string | null;
};

const AthleteProgress = () => {
  const { id } = useParams();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from('workout_programs')
          .select(`
            id,
            title,
            scheduled_date,
            created_at,
            workout_sessions ( id, completed, completed_at )
          `)
          .eq('athlete_id', id)
          .order('created_at', { ascending: false });

        if (error) {
          toast({ title: 'Erreur', description: "Impossible de charger les progrès", variant: 'destructive' });
          return;
        }

        const formatted = (data || []).map((p: any) => ({
          id: p.id,
          title: p.title,
          scheduled_date: p.scheduled_date,
          created_at: p.created_at,
          completed: p.workout_sessions?.[0]?.completed ?? false,
          completed_at: p.workout_sessions?.[0]?.completed_at ?? null,
        }));
        setPrograms(formatted);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return <div className="p-6">Chargement...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Progrès de l'athlète</h1>
        <Button asChild variant="outline">
          <Link to="/">Retour</Link>
        </Button>
      </div>

      {programs.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Aucun programme pour cet athlète.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {programs.map((p) => (
            <Card key={p.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{p.title}</span>
                  <Badge variant={p.completed ? 'default' : 'outline'}>
                    {p.completed ? 'Terminé' : 'En cours'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground space-y-1">
                  {p.scheduled_date && <div>Prévu: {new Date(p.scheduled_date).toLocaleDateString('fr-FR')}</div>}
                  <div>Créé: {new Date(p.created_at).toLocaleDateString('fr-FR')}</div>
                  {p.completed_at && <div>Terminé: {new Date(p.completed_at).toLocaleDateString('fr-FR')}</div>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AthleteProgress;


