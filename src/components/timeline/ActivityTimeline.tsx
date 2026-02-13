import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity as ActivityIcon, MessageSquare, FileText, User, Settings, Clock, Plus, Edit, Trash2 } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TimelineEntry {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: any;
  created_at: string;
  user_name?: string;
}

const ACTION_CONFIG: Record<string, { icon: any; color: string; label: string }> = {
  activity_created: { icon: Plus, color: 'bg-status-ativo/10 text-status-ativo', label: 'Atividade criada' },
  activity_updated: { icon: Edit, color: 'bg-primary/10 text-primary', label: 'Atividade atualizada' },
  activity_deleted: { icon: Trash2, color: 'bg-destructive/10 text-destructive', label: 'Atividade removida' },
  comment_added: { icon: MessageSquare, color: 'bg-status-pendente/10 text-status-pendente', label: 'Comentário' },
  attachment_added: { icon: FileText, color: 'bg-accent text-accent-foreground', label: 'Anexo' },
  profile_updated: { icon: User, color: 'bg-secondary text-secondary-foreground', label: 'Perfil' },
  status_created: { icon: Settings, color: 'bg-status-ativo/10 text-status-ativo', label: 'Status criado' },
  status_updated: { icon: Settings, color: 'bg-primary/10 text-primary', label: 'Status atualizado' },
  status_deleted: { icon: Settings, color: 'bg-destructive/10 text-destructive', label: 'Status removido' },
};

export const ActivityTimeline = () => {
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTimeline();
  }, []);

  const loadTimeline = async () => {
    const { data, error } = await supabase
      .from('audit_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) { console.error(error); setLoading(false); return; }

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
      };
    });

    setEntries(enriched);
    setLoading(false);
  };

  return (
    <Card className="shadow-medium animate-fade-in">
      <CardHeader className="bg-gradient-secondary">
        <CardTitle className="flex items-center gap-2 text-base">
          <Clock className="h-5 w-5" />
          Timeline de Atividades
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Carregando...</div>
        ) : entries.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">Nenhuma atividade recente</div>
        ) : (
          <ScrollArea className="h-[500px]">
            <div className="relative p-4">
              {/* Vertical line */}
              <div className="absolute left-8 top-0 bottom-0 w-px bg-border" />

              <div className="space-y-4">
                {entries.map((entry, index) => {
                  const config = ACTION_CONFIG[entry.action] || {
                    icon: ActivityIcon,
                    color: 'bg-muted text-muted-foreground',
                    label: entry.action,
                  };
                  const Icon = config.icon;

                  return (
                    <div
                      key={entry.id}
                      className="relative flex gap-4 animate-fade-in"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      {/* Icon dot */}
                      <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full ${config.color} ring-4 ring-background`}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 pb-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium">{entry.user_name}</span>
                          <Badge variant="outline" className="text-[10px]">
                            {config.label}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground ml-auto">
                            {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true, locale: ptBR })}
                          </span>
                        </div>
                        {entry.details && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {typeof entry.details === 'object'
                              ? Object.entries(entry.details)
                                  .filter(([k]) => k !== 'id')
                                  .map(([k, v]) => `${k}: ${v}`)
                                  .join(' • ')
                              : String(entry.details)}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
