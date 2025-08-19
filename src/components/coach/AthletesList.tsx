import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { User, MessageCircle, TrendingUp } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Athlete {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url?: string;
  created_at: string;
}

const AthletesList = () => {
  const { profile } = useAuthContext();
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAthletes();
  }, [profile]);

  const fetchAthletes = async () => {
    if (!profile?.id) return;

    try {
      const { data, error } = await supabase
        .from('coach_athlete_relationships')
        .select(`
          athlete:profiles!coach_athlete_relationships_athlete_id_fkey (
            id,
            first_name,
            last_name,
            email,
            avatar_url,
            created_at
          )
        `)
        .eq('coach_id', profile.id);

      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger la liste des athlètes",
          variant: "destructive",
        });
        return;
      }

      const athletesList = data?.map(item => item.athlete).filter(Boolean) || [];
      setAthletes(athletesList as Athlete[]);
    } catch (error) {
      console.error('Error fetching athletes:', error);
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
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-muted rounded-full" />
                <div className="space-y-2">
                  <div className="w-24 h-4 bg-muted rounded" />
                  <div className="w-32 h-3 bg-muted rounded" />
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  if (athletes.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <User className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Aucun athlète</h3>
          <p className="text-muted-foreground text-center mb-4">
            Vous n'avez pas encore d'athlètes dans votre équipe.
          </p>
          <Button>Ajouter un athlète</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {athletes.map((athlete) => (
        <Card key={athlete.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={athlete.avatar_url} />
                <AvatarFallback>
                  {athlete.first_name[0]}{athlete.last_name[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="text-base">
                  {athlete.first_name} {athlete.last_name}
                </CardTitle>
                <CardDescription className="text-sm">
                  {athlete.email}
                </CardDescription>
              </div>
              <Badge variant="secondary">Actif</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex-1">
                <MessageCircle className="h-4 w-4 mr-2" />
                Message
              </Button>
              <Button size="sm" className="flex-1">
                <TrendingUp className="h-4 w-4 mr-2" />
                Progrès
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AthletesList;