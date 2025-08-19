import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { Users, Target, TrendingUp, Activity } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface StatsData {
  totalAthletes: number;
  totalPrograms: number;
  completionRate: number;
  activeThisWeek: number;
}

const CoachStats = () => {
  const { profile } = useAuthContext();
  const [stats, setStats] = useState<StatsData>({
    totalAthletes: 0,
    totalPrograms: 0,
    completionRate: 0,
    activeThisWeek: 0,
  });
  const [loading, setLoading] = useState(true);

  // Données mockées pour les graphiques
  const weeklyData = [
    { name: 'Lun', completed: 12, assigned: 15 },
    { name: 'Mar', completed: 10, assigned: 12 },
    { name: 'Mer', completed: 8, assigned: 10 },
    { name: 'Jeu', completed: 15, assigned: 18 },
    { name: 'Ven', completed: 14, assigned: 16 },
    { name: 'Sam', completed: 6, assigned: 8 },
    { name: 'Dim', completed: 4, assigned: 5 },
  ];

  const fitnessData = [
    { name: 'Jan', motivation: 7.2, energy: 6.8, fatigue: 4.1 },
    { name: 'Fev', motivation: 7.5, energy: 7.1, fatigue: 3.9 },
    { name: 'Mar', motivation: 8.1, energy: 7.8, fatigue: 3.2 },
    { name: 'Avr', motivation: 7.9, energy: 7.5, fatigue: 3.5 },
    { name: 'Mai', motivation: 8.3, energy: 8.0, fatigue: 2.8 },
    { name: 'Jun', motivation: 8.5, energy: 8.2, fatigue: 2.5 },
  ];

  useEffect(() => {
    fetchStats();
  }, [profile]);

  const fetchStats = async () => {
    if (!profile?.id) return;

    try {
      // Fetch athletes count
      const { count: athletesCount } = await supabase
        .from('coach_athlete_relationships')
        .select('*', { count: 'exact' })
        .eq('coach_id', profile.id);

      // Fetch programs count
      const { count: programsCount } = await supabase
        .from('workout_programs')
        .select('*', { count: 'exact' })
        .eq('coach_id', profile.id);

      // Fetch completion rate (simplified calculation)
      const { data: sessions } = await supabase
        .from('workout_sessions')
        .select('completed')
        .in('workout_program_id', 
          await supabase
            .from('workout_programs')
            .select('id')
            .eq('coach_id', profile.id)
            .then(res => res.data?.map(p => p.id) || [])
        );

      const completedSessions = sessions?.filter(s => s.completed).length || 0;
      const totalSessions = sessions?.length || 0;
      const completionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

      setStats({
        totalAthletes: athletesCount || 0,
        totalPrograms: programsCount || 0,
        completionRate: Math.round(completionRate),
        activeThisWeek: Math.floor((athletesCount || 0) * 0.7), // Mock calculation
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les statistiques",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="w-24 h-4 bg-muted rounded" />
                <div className="w-4 h-4 bg-muted rounded" />
              </CardHeader>
              <CardContent>
                <div className="w-16 h-8 bg-muted rounded mb-2" />
                <div className="w-32 h-3 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Athlètes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAthletes}</div>
            <p className="text-xs text-muted-foreground">
              +2 depuis le mois dernier
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Programmes Créés</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPrograms}</div>
            <p className="text-xs text-muted-foreground">
              +12% depuis le mois dernier
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de Réalisation</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completionRate}%</div>
            <p className="text-xs text-muted-foreground">
              +5% depuis la semaine dernière
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actifs cette semaine</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeThisWeek}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.activeThisWeek / (stats.totalAthletes || 1)) * 100)}% du total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Entraînements de la semaine</CardTitle>
            <CardDescription>
              Comparaison assignés vs réalisés
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="assigned" fill="hsl(var(--muted))" name="Assignés" />
                <Bar dataKey="completed" fill="hsl(var(--primary))" name="Réalisés" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Évolution de la forme</CardTitle>
            <CardDescription>
              Moyennes des athlètes sur 6 mois
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={fitnessData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="motivation" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  name="Motivation"
                />
                <Line 
                  type="monotone" 
                  dataKey="energy" 
                  stroke="hsl(var(--secondary-foreground))" 
                  strokeWidth={2}
                  name="Énergie"
                />
                <Line 
                  type="monotone" 
                  dataKey="fatigue" 
                  stroke="hsl(var(--destructive))" 
                  strokeWidth={2}
                  name="Fatigue"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CoachStats;