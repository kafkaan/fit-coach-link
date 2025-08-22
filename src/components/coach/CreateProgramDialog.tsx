import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type CreateProgramDialogProps = {
  onCreated?: () => void;
  trigger?: React.ReactNode;
};

type AthleteOption = { id: string; label: string };

const CreateProgramDialog = ({ onCreated, trigger }: CreateProgramDialogProps) => {
  const { profile } = useAuthContext();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [scheduledDate, setScheduledDate] = useState<string>("");
  const [athleteId, setAthleteId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [athleteOptions, setAthleteOptions] = useState<AthleteOption[]>([]);

  useEffect(() => {
    if (!open) return;
    if (!profile?.id) return;
    const fetchAthletes = async () => {
      const { data, error } = await supabase.rpc('list_coach_athletes');
      if (error) return;
      const options: AthleteOption[] = (data || []).map((a: any) => ({ id: a.id, label: `${a.first_name} ${a.last_name}` }));
      setAthleteOptions(options);
      if (options.length > 0 && !athleteId) setAthleteId(options[0].id);
    };
    fetchAthletes();
  }, [open, profile?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id || !athleteId || !title) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('workout_programs').insert({
        coach_id: profile.id,
        athlete_id: athleteId,
        title,
        description: description || null,
        instructions: instructions || null,
        scheduled_date: scheduledDate || null,
      });
      if (error) {
        toast({ title: "Erreur", description: "Impossible de créer le programme", variant: "destructive" });
        return;
      }
      toast({ title: "Programme créé", description: "Le programme a été créé avec succès." });
      setOpen(false);
      setTitle("");
      setDescription("");
      setInstructions("");
      setScheduledDate("");
      setAthleteId("");
      onCreated?.();
    } catch (error) {
      console.error(error);
      toast({ title: "Erreur inattendue", description: "Réessayez plus tard", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? <Button>Nouveau programme</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Créer un programme</DialogTitle>
          <DialogDescription>
            Définissez les détails du programme et assignez-le à un athlète.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label> Athlète </Label>
            <Select value={athleteId} onValueChange={setAthleteId}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un athlète" />
              </SelectTrigger>
              <SelectContent>
                {athleteOptions.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground">Aucun athlète. Ajoutez d'abord un athlète.</div>
                ) : (
                  athleteOptions.map((opt) => (
                    <SelectItem key={opt.id} value={opt.id}>{opt.label}</SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Titre</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="instructions">Instructions</Label>
            <Textarea id="instructions" value={instructions} onChange={(e) => setInstructions(e.target.value)} rows={4} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Date programmée (optionnel)</Label>
            <div className="flex items-center gap-2">
              <Input id="date" type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} />
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting || !athleteId}>
              {isSubmitting ? 'Création...' : 'Créer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProgramDialog;


