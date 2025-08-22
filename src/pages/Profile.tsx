import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Profile = () => {
  const { profile } = useAuthContext();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | ''>('');

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name);
      setLastName(profile.last_name);
      setAvatarUrl(profile.avatar_url || '');
      setTheme((profile as any).theme || '');
    }
  }, [profile]);

  const save = async () => {
    if (!profile?.id) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').update({
      first_name: firstName,
      last_name: lastName,
      avatar_url: avatarUrl || null,
      theme: theme || null,
    }).eq('id', profile.id);
    setSaving(false);
    if (error) {
      toast({ title: 'Erreur', description: "Impossible d'enregistrer", variant: 'destructive' });
      return;
    }
    toast({ title: 'Profil mis à jour' });
  };

  return (
    <div className="container mx-auto p-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Mon profil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Prénom</Label>
              <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Nom</Label>
              <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Avatar URL</Label>
            <Input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://..." />
          </div>
          <div className="space-y-2">
            <Label>Thème</Label>
            <Select value={theme} onValueChange={(v: 'light' | 'dark') => setTheme(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Système" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Clair</SelectItem>
                <SelectItem value="dark">Sombre</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end">
            <Button onClick={save} disabled={saving}>{saving ? 'Enregistrement...' : 'Enregistrer'}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;


