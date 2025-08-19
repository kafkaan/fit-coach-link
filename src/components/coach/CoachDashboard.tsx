import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthContext } from '@/contexts/AuthContext';
import { Dumbbell, Users, BarChart3, LogOut, Plus } from 'lucide-react';
import AthletesList from './AthletesList';
import ProgramsManager from './ProgramsManager';
import CoachStats from './CoachStats';

const CoachDashboard = () => {
  const { profile, signOut } = useAuthContext();
  const [activeTab, setActiveTab] = useState('athletes');

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
            <TabsTrigger value="athletes" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Mes Athlètes
            </TabsTrigger>
            <TabsTrigger value="programs" className="flex items-center gap-2">
              <Dumbbell className="h-4 w-4" />
              Programmes
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Statistiques
            </TabsTrigger>
          </TabsList>

          <TabsContent value="athletes" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-foreground">Mes Athlètes</h2>
                <p className="text-muted-foreground">
                  Gérez vos athlètes et suivez leurs progrès
                </p>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un athlète
              </Button>
            </div>
            <AthletesList />
          </TabsContent>

          <TabsContent value="programs" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-foreground">Programmes d'Entraînement</h2>
                <p className="text-muted-foreground">
                  Créez et assignez des programmes personnalisés
                </p>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nouveau programme
              </Button>
            </div>
            <ProgramsManager />
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Statistiques</h2>
              <p className="text-muted-foreground">
                Analysez les performances de vos athlètes
              </p>
            </div>
            <CoachStats />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default CoachDashboard;