import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthContext } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type AddAthleteDialogProps = {
  onAdded?: () => void;
  trigger?: React.ReactNode;
};

const AddAthleteDialog = ({ onAdded, trigger }: AddAthleteDialogProps) => {
  const { profile } = useAuthContext();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id || !email) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase.rpc('link_athlete_by_email', { athlete_email: email.trim().toLowerCase() });
      if (error) {
        const message = error.message?.toLowerCase() || '';
        if (message.includes('not found')) {
          toast({ title: "Athlète introuvable", description: "Aucun profil avec cet email. Demandez-lui de s'inscrire puis réessayez.", variant: "destructive" });
        } else if (message.includes('only coaches')) {
          toast({ title: "Action non autorisée", description: "Seuls les coachs peuvent ajouter des athlètes.", variant: "destructive" });
        } else if (message.includes('not an athlete')) {
          toast({ title: "Rôle invalide", description: "Le profil trouvé n'est pas un athlète.", variant: "destructive" });
        } else {
          toast({ title: "Erreur", description: "Impossible d'ajouter l'athlète", variant: "destructive" });
        }
        return;
      }

      toast({ title: "Athlète ajouté", description: `L'athlète a été ajouté à votre équipe.` });
      setOpen(false);
      setEmail("");
      onAdded?.();
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
        {trigger ?? <Button>Ajouter un athlète</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter un athlète</DialogTitle>
          <DialogDescription>
            Renseignez l'email de l'athlète déjà inscrit afin de l'ajouter à votre équipe.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email de l'athlète</Label>
            <Input id="email" type="email" placeholder="athlete@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Ajout...' : 'Ajouter'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddAthleteDialog;


