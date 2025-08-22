import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { Calendar, User, Edit, Trash2, Plus, Filter } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import CreateProgramDialog from './CreateProgramDialog';

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

type ProgramsManagerProps = { reloadKey?: number };

const ProgramsManager = ({ reloadKey = 0 }: ProgramsManagerProps) => {
  const { profile } = useAuthContext();
  const [programs, setPrograms] = useState<WorkoutProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [athleteFilter, setAthleteFilter] = useState<string>('all');
  const [athleteOptions, setAthleteOptions] = useState<{ id: string; label: string }[]>([]);

  useEffect(() => {
    fetchPrograms();
    fetchAthletes();
  }, [profile, reloadKey]);

  const fetchPrograms = async () => {
    if (!profile?.id) return;

    try {
      const { data, error } = await supabase.rpc('list_coach_programs');

      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger les programmes",
          variant: "destructive",
        });
        return;
      }

      const mapped = (data || []).map((row: any) => ({
        id: row.id,
        title: row.title,
        description: row.description,
        scheduled_date: row.scheduled_date,
        created_at: row.created_at,
        athlete: { first_name: row.athlete_first_name, last_name: row.athlete_last_name, id: row.athlete_id },
      }));
      setPrograms(mapped);
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

  const fetchAthletes = async () => {
    if (!profile?.id) return;
    const { data } = await supabase.rpc('list_coach_athletes');
    setAthleteOptions((data || []).map((a: any) => ({ id: a.id, label: `${a.first_name} ${a.last_name}` })));
  };

  const deleteProgram = async (id: string) => {
    if (!confirm('Supprimer ce programme ? Cette action est irréversible.')) return;
    const { error } = await supabase.from('workout_programs').delete().eq('id', id);
    if (error) {
      toast({ title: 'Erreur', description: "Suppression impossible", variant: 'destructive' });
      return;
    }
    toast({ title: 'Programme supprimé' });
    fetchPrograms();
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

  const filtered = programs.filter((p) => {
    const matchesSearch = search ? p.title.toLowerCase().includes(search.toLowerCase()) : true;
    const matchesAthlete = athleteFilter === 'all' ? true : (p as any).athlete.id === athleteFilter;
    const today = new Date().toISOString().split('T')[0];
    const isToday = p.scheduled_date === today;
    const isScheduled = !!p.scheduled_date;
    const matchesDate = dateFilter === 'all' ? true : dateFilter === 'today' ? isToday : isScheduled;
    // statusFilter: only 'draft' or 'scheduled'
    const matchesStatus = statusFilter === 'all' ? true : statusFilter === 'draft' ? !isScheduled : isScheduled;
    return matchesSearch && matchesAthlete && matchesDate && matchesStatus;
  });

  if (filtered.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Aucun programme</h3>
          <p className="text-muted-foreground text-center mb-4">
            Vous n'avez pas encore créé de programmes d'entraînement.
          </p>
          <CreateProgramDialog onCreated={fetchPrograms} trigger={<Button><Plus className="h-4 w-4 mr-2" />Créer un programme</Button>} />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1">
          <input className="w-full px-3 py-2 border rounded-md bg-background" placeholder="Rechercher un programme" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="px-3 py-2 border rounded-md bg-background" value={athleteFilter} onChange={(e) => setAthleteFilter(e.target.value)}>
          <option value="all">Tous les athlètes</option>
          {athleteOptions.map((a) => (
            <option key={a.id} value={a.id}>{a.label}</option>
          ))}
        </select>
        <select className="px-3 py-2 border rounded-md bg-background" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
          <option value="all">Toutes les dates</option>
          <option value="today">Aujourd'hui</option>
          <option value="scheduled">Programmés</option>
        </select>
        <select className="px-3 py-2 border rounded-md bg-background" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">Tous les statuts</option>
          <option value="draft">Brouillon</option>
          <option value="scheduled">Programmé</option>
        </select>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {filtered.map((program) => (
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
              <Button size="sm" variant="outline" onClick={() => deleteProgram(program.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      </div>
    </>
  );
};

export default ProgramsManager;