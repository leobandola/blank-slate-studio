import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { History, Search, User, FileText, MessageSquare, Settings, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AuditEntry {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: any;
  created_at: string;
  user_name?: string;
  user_email?: string;
}

const ACTION_LABELS: Record<string, string> = {
  comment_added: 'Comentário adicionado',
  attachment_added: 'Anexo adicionado',
  profile_updated: 'Perfil atualizado',
  activity_created: 'Atividade criada',
  activity_updated: 'Atividade atualizada',
  activity_deleted: 'Atividade removida',
  status_created: 'Status criado',
  status_updated: 'Status atualizado',
  status_deleted: 'Status removido',
  user_login: 'Login realizado',
};

const ACTION_ICONS: Record<string, any> = {
  comment_added: MessageSquare,
  attachment_added: FileText,
  profile_updated: User,
  activity_created: Activity,
  activity_updated: Activity,
  activity_deleted: Activity,
  status_created: Settings,
  status_updated: Settings,
  status_deleted: Settings,
};

const ACTION_COLORS: Record<string, string> = {
  comment_added: 'bg-primary/10 text-primary',
  attachment_added: 'bg-status-ativo/10 text-status-ativo',
  profile_updated: 'bg-accent text-accent-foreground',
  activity_created: 'bg-status-ativo/10 text-status-ativo',
  activity_updated: 'bg-status-pendente/10 text-status-pendente',
  activity_deleted: 'bg-destructive/10 text-destructive',
};

export const AuditLog = () => {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    const { data, error } = await supabase
      .from('audit_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) { console.error(error); setLoading(false); return; }

    // Enrich with profile data
    const userIds = [...new Set((data || []).map(e => e.user_id))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, name, email')
      .in('id', userIds);

    const enriched = (data || []).map(e => {
      const profile = profiles?.find(p => p.id === e.user_id);
      return {
        ...e,
        user_name: profile?.name || profile?.email?.split('@')[0] || 'Usuário',
        user_email: profile?.email || '',
      };
    });

    setEntries(enriched);
    setLoading(false);
  };

  const filteredEntries = entries.filter(e => {
    if (actionFilter !== 'all' && e.action !== actionFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      return (
        (e.user_name || '').toLowerCase().includes(s) ||
        (ACTION_LABELS[e.action] || e.action).toLowerCase().includes(s) ||
        e.entity_type.toLowerCase().includes(s)
      );
    }
    return true;
  });

  const uniqueActions = [...new Set(entries.map(e => e.action))];

  return (
    <div className="space-y-4 animate-fade-in">
      <Card className="shadow-medium">
        <CardHeader className="bg-gradient-secondary">
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Log de Auditoria
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar no log..."
                className="pl-9"
              />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrar por ação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as ações</SelectItem>
                {uniqueActions.map(action => (
                  <SelectItem key={action} value={action}>
                    {ACTION_LABELS[action] || action}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : filteredEntries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum registro encontrado
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              <div className="space-y-2">
                {filteredEntries.map(entry => {
                  const Icon = ACTION_ICONS[entry.action] || Activity;
                  const colorClass = ACTION_COLORS[entry.action] || 'bg-muted text-muted-foreground';
                  return (
                    <div
                      key={entry.id}
                      className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors animate-fade-in"
                    >
                      <div className={`p-2 rounded-lg ${colorClass}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{entry.user_name}</span>
                          <Badge variant="outline" className="text-[10px]">
                            {ACTION_LABELS[entry.action] || entry.action}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {entry.entity_type}
                          {entry.entity_id && ` • ID: ${entry.entity_id.substring(0, 8)}...`}
                        </p>
                        {entry.details && (
                          <p className="text-xs text-muted-foreground mt-1 truncate">
                            {JSON.stringify(entry.details).substring(0, 100)}
                          </p>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {format(new Date(entry.created_at), "dd/MM/yy HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
