import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Camera, Save } from 'lucide-react';
import { toast } from 'sonner';

interface Profile {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  phone: string | null;
  cargo: string | null;
}

export const UserProfile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [cargo, setCargo] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) { setLoading(false); return; }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (!error && data) {
      setProfile(data as Profile);
      setName(data.name || '');
      setPhone((data as any).phone || '');
      setCargo((data as any).cargo || '');
      setAvatarUrl(data.avatar_url || '');
    }
    setLoading(false);
  };

  const uploadAvatar = async (file: globalThis.File) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const filePath = `${session.user.id}/avatar.${file.name.split('.').pop()}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast.error('Erro ao enviar avatar');
      return;
    }

    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    const newUrl = `${urlData.publicUrl}?t=${Date.now()}`;
    setAvatarUrl(newUrl);

    await supabase
      .from('profiles')
      .update({ avatar_url: newUrl })
      .eq('id', session.user.id);

    toast.success('Avatar atualizado!');
  };

  const saveProfile = async () => {
    if (!profile) return;
    setSaving(true);

    const { error } = await supabase
      .from('profiles')
      .update({ 
        name, 
        avatar_url: avatarUrl,
        phone,
        cargo,
      } as any)
      .eq('id', profile.id);

    if (error) {
      toast.error('Erro ao salvar perfil');
    } else {
      toast.success('Perfil atualizado!');
      // Audit log
      await supabase.from('audit_log').insert({
        user_id: profile.id,
        action: 'profile_updated',
        entity_type: 'profile',
        entity_id: profile.id,
        details: { name, cargo },
      });
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8 text-muted-foreground">Carregando perfil...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <Card className="shadow-medium">
        <CardHeader className="bg-gradient-secondary">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Meu Perfil
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-4 mb-6">
            <div className="relative group">
              <Avatar className="h-24 w-24 border-4 border-background shadow-medium">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                  {(name || profile?.email || 'U').substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute bottom-0 right-0 p-1.5 rounded-full bg-primary text-primary-foreground shadow-md hover:scale-110 transition-transform"
              >
                <Camera className="h-4 w-4" />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadAvatar(file);
                }}
              />
            </div>
            <p className="text-sm text-muted-foreground">{profile?.email}</p>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nome</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome completo" />
            </div>
            <div>
              <Label htmlFor="cargo">Cargo</Label>
              <Input id="cargo" value={cargo} onChange={(e) => setCargo(e.target.value)} placeholder="Ex: Analista de TI" />
            </div>
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(00) 00000-0000" />
            </div>

            <Button onClick={saveProfile} disabled={saving} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Salvando...' : 'Salvar Perfil'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
