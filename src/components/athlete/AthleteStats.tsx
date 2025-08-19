import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { Target, TrendingUp, Activity, Calendar } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface AthleteStatsData {
  totalPrograms: number;
  completedPrograms: number;
  completionRate: number;
  averageMotivation: number;
  averageEnergy: number;
  averageFatigue: number;
}

const AthleteStats = () => {
  const { profile } = useAuthContext();
  const [stats, setStats] = useState<AthleteStatsData>({
    totalPrograms: 0,
    completedPrograms: 0,
    completionRate: 0,
    averageMotivation: 0,
    averageEnergy: 0,
    averageFatigue: 0,
  });
  const [loading, setLoading] = useState(true);

  // Données mockées pour les graphiques (en attente des vraies données)
  const weeklyProgressData = [
    { name: 'Sem 1', completed: 4, assigned: 5, motivation: 7.2 },
    { name: 'Sem 2', completed: 3, assigned: 4, motivation: 6.8 },
    { name: 'Sem 3', completed: 5, assigned: 5, motivation: 8.1 },
    { name: 'Sem 4', completed: 2, assigned: 3, motivation: 7.5 },
    { name: 'Sem 5', completed: 4, assigned: 4, motivation: 8.3 },
    { name: 'Sem 6', completed: 3, assigned: 4, motivation: 7.9 },
  ];

  const fitnessEvolutionData = [
    { name: 'Jan', motivation: 6.5, energy: 6.2, fatigue: 5.8 },
    { name: 'Fév', motivation: 7.1, energy: 6.8, fatigue: 5.2 },
    { name: 'Mar', motivation: 7.8, energy: 7.5, fatigue: 4.5 },
    { name: 'Avr', motivation: 8.0, energy: 7.7, fatigue: 4.2 },
    { name: 'Mai', motivation: 8.2, energy: 8.0, fatigue: 3.8 },
    { name: 'Jun', motivation: 8.5, energy: 8.3, fatigue: 3.2 },
  ];

  const workoutTypeData = [
    { name: 'Cardio', value: 35, color: 'hsl(var(--primary))' },
    { name: 'Musculation', value: 40, color: 'hsl(var(--secondary))' },
    { name: 'Flexibilité', value: 15, color: 'hsl(var(--accent))' },
    { name: 'Récupération', value: 10, color: 'hsl(var(--muted))' },
  ];

  useEffect(() => {
    fetchStats();
  }, [profile]);

  const fetchStats = async () => {
    if (!profile?.id) return;

    try {
      // Fetch programs stats
      const { data: programs } = await supabase
        .from('workout_programs')
        .select(`
          id,
          workout_sessions (
            completed
          )
        `)
        .eq('athlete_id', profile.id);

      const totalPrograms = programs?.length || 0;
      const completedPrograms = programs?.filter(p => 
        p.workout_sessions?.some(s => s.completed)
      ).length || 0;
      const completionRate = totalPrograms > 0 ? (completedPrograms / totalPrograms) * 100 : 0;

      // Fetch fitness assessments averages
      const { data: assessments } = await supabase
        .from('fitness_assessments')
        .select('motivation_level, energy_level, fatigue_level')
        .eq('athlete_id', profile.id);

      let averageMotivation = 0;
      let averageEnergy = 0;
      let averageFatigue = 0;

      if (assessments && assessments.length > 0) {
        averageMotivation = assessments.reduce((sum, a) => sum + (a.motivation_level || 0), 0) / assessments.length;
        averageEnergy = assessments.reduce((sum, a) => sum + (a.energy_level || 0), 0) / assessments.length;
        averageFatigue = assessments.reduce((sum, a) => sum + (a.fatigue_level || 0), 0) / assessments.length;
      }

      setStats({
        totalPrograms,
        completedPrograms,
        completionRate: Math.round(completionRate),
        averageMotivation: Math.round(averageMotivation * 10) / 10,
        averageEnergy: Math.round(averageEnergy * 10) / 10,
        averageFatigue: Math.round(averageFatigue * 10) / 10,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger vos statistiques",
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
            <CardTitle className="text-sm font-medium">Programmes Reçus</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPrograms}</div>
            <p className="text-xs text-muted-foreground">
              Total depuis le début
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de Réalisation</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.completedPrograms} sur {stats.totalPrograms} programmes
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Motivation Moyenne</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageMotivation}/10</div>
            <p className="text-xs text-muted-foreground">
              Basé sur vos évaluations
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Énergie Moyenne</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageEnergy}/10</div>
            <p className="text-xs text-muted-foreground">
              Niveau d'énergie moyen
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Progression Hebdomadaire</CardTitle>
            <CardDescription>
              Programmes réalisés et niveau de motivation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyProgressData}>
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
            <CardTitle>Évolution de la Forme</CardTitle>
            <CardDescription>
              Progression sur les 6 derniers mois
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={fitnessEvolutionData}>
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

      {/* Additional Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Répartition des Entraînements</CardTitle>
            <CardDescription>
              Types d'exercices pratiqués
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={workoutTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {workoutTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Résumé Mensuel</CardTitle>
            <CardDescription>
              Votre performance ce mois-ci
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm font-medium">Entraînements terminés</span>
              <span className="text-lg font-bold text-primary">{stats.completedPrograms}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm font-medium">Taux de régularité</span>
              <span className="text-lg font-bold text-green-600">{stats.completionRate}%</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm font-medium">Motivation moyenne</span>
              <span className="text-lg font-bold text-blue-600">{stats.averageMotivation}/10</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm font-medium">Niveau de fatigue</span>
              <span className="text-lg font-bold text-orange-600">{stats.averageFatigue}/10</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AthleteStats;