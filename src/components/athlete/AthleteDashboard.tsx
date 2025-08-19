import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthContext } from '@/contexts/AuthContext';
import { Dumbbell, Calendar, BarChart3, LogOut, Activity } from 'lucide-react';
import WorkoutPrograms from './WorkoutPrograms';
import FitnessTracking from './FitnessTracking';
import AthleteStats from './AthleteStats';

const AthleteDashboard = () => {
  const { profile, signOut } = useAuthContext();
  const [activeTab, setActiveTab] = useState('programs');

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg">
              <Dumbbell className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">FitCoach</h1>
              <p className="text-sm text-muted-foreground">
                Bienvenue, {profile?.first_name} {profile?.last_name}
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Déconnexion
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="programs" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Mes Programmes
            </TabsTrigger>
            <TabsTrigger value="tracking" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Suivi Forme
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Mes Statistiques
            </TabsTrigger>
          </TabsList>

          <TabsContent value="programs" className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Mes Programmes</h2>
              <p className="text-muted-foreground">
                Consultez et réalisez vos programmes d'entraînement
              </p>
            </div>
            <WorkoutPrograms />
          </TabsContent>

          <TabsContent value="tracking" className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Suivi de Forme</h2>
              <p className="text-muted-foreground">
                Enregistrez votre état avant et après l'entraînement
              </p>
            </div>
            <FitnessTracking />
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Mes Statistiques</h2>
              <p className="text-muted-foreground">
                Analysez votre progression et vos performances
              </p>
            </div>
            <AthleteStats />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AthleteDashboard;