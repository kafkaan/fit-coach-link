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

  const [weeklyData, setWeeklyData] = useState<{ name: string; completed: number; assigned: number }[]>([]);
  const [fitnessData, setFitnessData] = useState<{ name: string; motivation: number; energy: number; fatigue: number }[]>([]);

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
        activeThisWeek: 0,
      });

      // Weekly activity (RPC)
      const { data: weekly, error: weeklyError } = await (supabase as any).rpc('coach_weekly_activity');
      if (!weeklyError) {
        const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
        setWeeklyData((weekly || []).map((row: any) => ({
          name: days[new Date(row.day_date).getDay()],
          assigned: row.assigned_count,
          completed: row.completed_count,
        })));
      }

      // Active this week (RPC)
      const { data: activeWeek, error: activeError } = await (supabase as any).rpc('coach_active_this_week');
      if (!activeError && typeof activeWeek === 'number') {
        setStats(s => ({ ...s, activeThisWeek: activeWeek }));
      }

      // Fitness trends (RPC)
      const { data: trends, error: trendsError } = await (supabase as any).rpc('coach_fitness_trends');
      if (!trendsError) {
        setFitnessData((trends || []).map((t: any) => ({
          name: t.month_label,
          motivation: Number(t.motivation_avg) || 0,
          energy: Number(t.energy_avg) || 0,
          fatigue: Number(t.fatigue_avg) || 0,
        })));
      }
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