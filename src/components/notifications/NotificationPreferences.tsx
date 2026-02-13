import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Bell, Mail, Clock, RefreshCw, UserPlus } from 'lucide-react';

export const NotificationPreferences = () => {
  const [prefs, setPrefs] = useState({
    email_enabled: true,
    email_deadlines: true,
    email_status_changes: true,
    email_new_assignments: true,
    email_daily_summary: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchPrefs = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (data) {
        setPrefs({
          email_enabled: data.email_enabled,
          email_deadlines: data.email_deadlines,
          email_status_changes: data.email_status_changes,
          email_new_assignments: data.email_new_assignments,
          email_daily_summary: data.email_daily_summary,
        });
      } else if (error?.code === 'PGRST116') {
        // No preferences yet, create them
        await supabase.from('notification_preferences').insert({
          user_id: session.user.id,
        });
      }
      setLoading(false);
    };
    fetchPrefs();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const { error } = await supabase
      .from('notification_preferences')
      .update({
        ...prefs,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', session.user.id);

    if (error) {
      toast.error('Erro ao salvar preferências');
    } else {
      toast.success('Preferências salvas!');
    }
    setSaving(false);
  };

  if (loading) return <div className="text-center p-4 text-muted-foreground">Carregando...</div>;

  const options = [
    { key: 'email_deadlines' as const, label: 'Prazos vencendo', desc: 'Receba alertas quando atividades estiverem próximas do prazo', icon: Clock },
    { key: 'email_status_changes' as const, label: 'Mudanças de status', desc: 'Notificação quando o status de uma atividade mudar', icon: RefreshCw },
    { key: 'email_new_assignments' as const, label: 'Novas atribuições', desc: 'Quando uma nova atividade for atribuída a você', icon: UserPlus },
    { key: 'email_daily_summary' as const, label: 'Resumo diário', desc: 'Receba um resumo das atividades do dia por email', icon: Mail },
  ];

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Bell className="h-5 w-5" />
          Preferências de Notificação
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-primary" />
            <div>
              <Label className="font-semibold">Notificações por Email</Label>
              <p className="text-sm text-muted-foreground">Ativar/desativar todas as notificações por email</p>
            </div>
          </div>
          <Switch
            checked={prefs.email_enabled}
            onCheckedChange={(v) => setPrefs(p => ({ ...p, email_enabled: v }))}
          />
        </div>

        <div className={`space-y-4 transition-opacity ${!prefs.email_enabled ? 'opacity-50 pointer-events-none' : ''}`}>
          {options.map(({ key, label, desc, icon: Icon }) => (
            <div key={key} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <Label>{label}</Label>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              </div>
              <Switch
                checked={prefs[key]}
                onCheckedChange={(v) => setPrefs(p => ({ ...p, [key]: v }))}
              />
            </div>
          ))}
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? 'Salvando...' : 'Salvar Preferências'}
        </Button>
      </CardContent>
    </Card>
  );
};
