import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuthContext } from '@/contexts/AuthContext';
import { Dumbbell, Users } from 'lucide-react';

const Auth = () => {
  const { user, signUp, signIn, resetPassword } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<'coach' | 'athlete'>('athlete');
  
  // Reset password state
  const [resetEmail, setResetEmail] = useState('');

  // Redirect if already authenticated
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !firstName || !lastName) return;
    
    setIsLoading(true);
    await signUp(email, password, firstName, lastName, role);
    setIsLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setIsLoading(true);
    await signIn(email, password);
    setIsLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    
    setIsLoading(true);
    await resetPassword(resetEmail);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary rounded-full">
              <Dumbbell className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">FitCoach</h1>
          <p className="text-muted-foreground mt-2">Plateforme de suivi sportif</p>
        </div>

        <Tabs defaultValue="signin" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Connexion</TabsTrigger>
            <TabsTrigger value="signup">Inscription</TabsTrigger>
          </TabsList>
          
          <TabsContent value="signin">
            <Card>
              <CardHeader>
                <CardTitle>Se connecter</CardTitle>
                <CardDescription>
                  Connectez-vous à votre compte pour accéder à vos programmes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="votre@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Mot de passe</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Connexion...' : 'Se connecter'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>Créer un compte</CardTitle>
                <CardDescription>
                  Rejoignez FitCoach en tant qu'athlète ou coach
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first-name">Prénom</Label>
                      <Input
                        id="first-name"
                        placeholder="Prénom"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last-name">Nom</Label>
                      <Input
                        id="last-name"
                        placeholder="Nom"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="role">Rôle</Label>
                    <Select value={role} onValueChange={(value: 'coach' | 'athlete') => setRole(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="athlete">
                          <div className="flex items-center gap-2">
                            <Dumbbell className="h-4 w-4" />
                            Athlète
                          </div>
                        </SelectItem>
                        <SelectItem value="coach">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Coach
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="votre@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Mot de passe</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Au moins 6 caractères"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Création...' : 'Créer mon compte'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-sm">Mot de passe oublié ?</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="votre@email.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" variant="outline" className="w-full" disabled={isLoading}>
                {isLoading ? 'Envoi...' : 'Réinitialiser le mot de passe'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;