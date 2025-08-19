import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { Activity, Heart, Zap, Battery, MessageSquare } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface FitnessAssessment {
  id: string;
  assessment_type: 'pre_workout' | 'post_workout';
  fatigue_level: number;
  pain_level: number;
  motivation_level: number;
  energy_level: number;
  notes: string;
  created_at: string;
  workout_session: {
    workout_program: {
      title: string;
    };
  };
}

interface WorkoutSession {
  id: string;
  workout_program: {
    id: string;
    title: string;
  };
}

const FitnessTracking = () => {
  const { profile } = useAuthContext();
  const [assessments, setAssessments] = useState<FitnessAssessment[]>([]);
  const [workoutSessions, setWorkoutSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [selectedSession, setSelectedSession] = useState<string>('');
  const [assessmentType, setAssessmentType] = useState<'pre_workout' | 'post_workout'>('pre_workout');
  const [fatigueLevel, setFatigueLevel] = useState([5]);
  const [painLevel, setPainLevel] = useState([1]);
  const [motivationLevel, setMotivationLevel] = useState([7]);
  const [energyLevel, setEnergyLevel] = useState([6]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchData();
  }, [profile]);

  const fetchData = async () => {
    if (!profile?.id) return;

    try {
      // Fetch recent workout sessions
      const { data: sessions } = await supabase
        .from('workout_sessions')
        .select(`
          id,
          workout_program:workout_programs (
            id,
            title
          )
        `)
        .eq('athlete_id', profile.id)
        .eq('completed', true)
        .order('completed_at', { ascending: false })
        .limit(10);

      setWorkoutSessions(sessions || []);

      // Fetch recent assessments
      const { data: assessmentsData } = await supabase
        .from('fitness_assessments')
        .select(`
          id,
          assessment_type,
          fatigue_level,
          pain_level,
          motivation_level,
          energy_level,
          notes,
          created_at,
          workout_session:workout_sessions (
            workout_program:workout_programs (
              title
            )
          )
        `)
        .eq('athlete_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(20);

      setAssessments((assessmentsData || []) as FitnessAssessment[]);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSession || !profile?.id) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('fitness_assessments')
        .insert({
          workout_session_id: selectedSession,
          athlete_id: profile.id,
          assessment_type: assessmentType,
          fatigue_level: fatigueLevel[0],
          pain_level: painLevel[0],
          motivation_level: motivationLevel[0],
          energy_level: energyLevel[0],
          notes,
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Évaluation enregistrée",
        description: "Votre état de forme a été enregistré avec succès",
      });

      // Reset form
      setSelectedSession('');
      setNotes('');
      setFatigueLevel([5]);
      setPainLevel([1]);
      setMotivationLevel([7]);
      setEnergyLevel([6]);

      // Refresh data
      fetchData();
    } catch (error) {
      console.error('Error saving assessment:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer votre évaluation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getScaleColor = (value: number, reverse = false) => {
    if (reverse) {
      return value <= 3 ? 'text-green-600' : value <= 6 ? 'text-yellow-600' : 'text-red-600';
    }
    return value <= 3 ? 'text-red-600' : value <= 6 ? 'text-yellow-600' : 'text-green-600';
  };

  const getScaleLabel = (value: number, type: string) => {
    if (type === 'fatigue' || type === 'pain') {
      if (value <= 3) return 'Faible';
      if (value <= 6) return 'Modéré';
      return 'Élevé';
    } else {
      if (value <= 3) return 'Faible';
      if (value <= 6) return 'Moyen';
      return 'Élevé';
    }
  };

  return (
    <div className="space-y-6">
      {/* Assessment Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Nouvelle Évaluation
          </CardTitle>
          <CardDescription>
            Enregistrez votre état de forme avant ou après l'entraînement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="session">Séance d'entraînement</Label>
                <Select value={selectedSession} onValueChange={setSelectedSession}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une séance" />
                  </SelectTrigger>
                  <SelectContent>
                    {workoutSessions.map((session) => (
                      <SelectItem key={session.id} value={session.id}>
                        {session.workout_program.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type d'évaluation</Label>
                <Select value={assessmentType} onValueChange={(value: 'pre_workout' | 'post_workout') => setAssessmentType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pre_workout">Avant l'entraînement</SelectItem>
                    <SelectItem value="post_workout">Après l'entraînement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <Battery className="h-4 w-4" />
                    Niveau de Fatigue: {fatigueLevel[0]}/10
                  </Label>
                  <Slider
                    value={fatigueLevel}
                    onValueChange={setFatigueLevel}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <p className={`text-sm ${getScaleColor(fatigueLevel[0], true)}`}>
                    {getScaleLabel(fatigueLevel[0], 'fatigue')}
                  </p>
                </div>

                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    Niveau de Douleur: {painLevel[0]}/10
                  </Label>
                  <Slider
                    value={painLevel}
                    onValueChange={setPainLevel}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <p className={`text-sm ${getScaleColor(painLevel[0], true)}`}>
                    {getScaleLabel(painLevel[0], 'pain')}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Niveau de Motivation: {motivationLevel[0]}/10
                  </Label>
                  <Slider
                    value={motivationLevel}
                    onValueChange={setMotivationLevel}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <p className={`text-sm ${getScaleColor(motivationLevel[0])}`}>
                    {getScaleLabel(motivationLevel[0], 'motivation')}
                  </p>
                </div>

                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Niveau d'Énergie: {energyLevel[0]}/10
                  </Label>
                  <Slider
                    value={energyLevel}
                    onValueChange={setEnergyLevel}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <p className={`text-sm ${getScaleColor(energyLevel[0])}`}>
                    {getScaleLabel(energyLevel[0], 'energy')}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Notes (optionnel)
              </Label>
              <Textarea
                id="notes"
                placeholder="Commentaires sur votre état, ressenti, douleurs particulières..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            <Button type="submit" disabled={loading || !selectedSession} className="w-full">
              {loading ? 'Enregistrement...' : 'Enregistrer l\'évaluation'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Recent Assessments */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des Évaluations</CardTitle>
          <CardDescription>
            Vos dernières évaluations de forme
          </CardDescription>
        </CardHeader>
        <CardContent>
          {assessments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Aucune évaluation enregistrée
            </p>
          ) : (
            <div className="space-y-4">
              {assessments.map((assessment) => (
                <div key={assessment.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">
                      {assessment.workout_session.workout_program.title}
                    </h4>
                    <div className="flex gap-2">
                      <Badge variant={assessment.assessment_type === 'pre_workout' ? 'outline' : 'secondary'}>
                        {assessment.assessment_type === 'pre_workout' ? 'Avant' : 'Après'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(assessment.created_at), { 
                          addSuffix: true,
                          locale: fr 
                        })}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-medium">Fatigue</div>
                      <div className={getScaleColor(assessment.fatigue_level, true)}>
                        {assessment.fatigue_level}/10
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">Douleur</div>
                      <div className={getScaleColor(assessment.pain_level, true)}>
                        {assessment.pain_level}/10
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">Motivation</div>
                      <div className={getScaleColor(assessment.motivation_level)}>
                        {assessment.motivation_level}/10
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">Énergie</div>
                      <div className={getScaleColor(assessment.energy_level)}>
                        {assessment.energy_level}/10
                      </div>
                    </div>
                  </div>

                  {assessment.notes && (
                    <div className="text-sm text-muted-foreground">
                      <strong>Notes:</strong> {assessment.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FitnessTracking;