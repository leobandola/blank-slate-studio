import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Target, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Activity } from '@/types/activity';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, format } from 'date-fns';

interface Goal {
  id: string;
  name: string;
  target_count: number;
  period: string;
  metric: string;
  start_date: string;
  end_date: string | null;
  active: boolean;
}

interface GoalsManagerProps {
  activities: Activity[];
}

const METRIC_LABELS: Record<string, string> = {
  activities_completed: 'Atividades Concluídas',
  activities_created: 'Atividades Criadas',
  activities_total: 'Total de Atividades',
};

const PERIOD_LABELS: Record<string, string> = {
  weekly: 'Semanal',
  monthly: 'Mensal',
  custom: 'Personalizado',
};

export const GoalsManager = ({ activities }: GoalsManagerProps) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    target_count: 10,
    period: 'monthly',
    metric: 'activities_completed',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
  });

  useEffect(() => { loadGoals(); }, []);

  const loadGoals = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) { setLoading(false); return; }

    const { data, error } = await supabase
      .from('goals' as any)
      .select('*')
      .eq('user_id', session.user.id)
      .eq('active', true)
      .order('created_at', { ascending: false });

    if (!error && data) setGoals(data as any[]);
    setLoading(false);
  };

  const calculateProgress = (goal: Goal): number => {
    const now = new Date();
    let periodStart: Date;
    let periodEnd: Date;

    switch (goal.period) {
      case 'weekly':
        periodStart = startOfWeek(now, { weekStartsOn: 1 });
        periodEnd = endOfWeek(now, { weekStartsOn: 1 });
        break;
      case 'monthly':
        periodStart = startOfMonth(now);
        periodEnd = endOfMonth(now);
        break;
      default:
        periodStart = new Date(goal.start_date);
        periodEnd = goal.end_date ? new Date(goal.end_date) : now;
    }

    const startStr = format(periodStart, 'yyyy-MM-dd');
    const endStr = format(periodEnd, 'yyyy-MM-dd');

    const filtered = activities.filter(a => {
      if (a.data < startStr || a.data > endStr) return false;
      switch (goal.metric) {
        case 'activities_completed': return a.status === 'CONCLUÍDO';
        case 'activities_created': return true;
        case 'activities_total': return true;
        default: return true;
      }
    });

    return filtered.length;
  };

  const handleCreate = async () => {
    if (!form.name || !form.target_count) {
      toast.error('Nome e meta são obrigatórios');
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const { error } = await supabase
      .from('goals' as any)
      .insert({
        user_id: session.user.id,
        name: form.name,
        target_count: form.target_count,
        period: form.period,
        metric: form.metric,
        start_date: form.start_date,
        end_date: form.end_date || null,
      });

    if (error) {
      toast.error('Erro ao criar meta');
    } else {
      toast.success('Meta criada!');
      setIsDialogOpen(false);
      setForm({ name: '', target_count: 10, period: 'monthly', metric: 'activities_completed', start_date: new Date().toISOString().split('T')[0], end_date: '' });
      loadGoals();
    }
  };

  const deleteGoal = async (id: string) => {
    const { error } = await supabase
      .from('goals' as any)
      .update({ active: false })
      .eq('id', id);

    if (!error) {
      setGoals(prev => prev.filter(g => g.id !== id));
      toast.success('Meta removida');
    }
  };

  return (
    <Card className="shadow-medium">
      <CardHeader className="bg-gradient-secondary">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Metas de Produtividade
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Nova Meta
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Meta</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Nome da Meta</Label>
                  <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Ex: 50 atividades concluídas no mês" />
                </div>
                <div>
                  <Label>Quantidade Alvo</Label>
                  <Input type="number" min={1} value={form.target_count} onChange={e => setForm(p => ({ ...p, target_count: parseInt(e.target.value) || 0 }))} />
                </div>
                <div>
                  <Label>Período</Label>
                  <Select value={form.period} onValueChange={v => setForm(p => ({ ...p, period: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="monthly">Mensal</SelectItem>
                      <SelectItem value="custom">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Métrica</Label>
                  <Select value={form.metric} onValueChange={v => setForm(p => ({ ...p, metric: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="activities_completed">Atividades Concluídas</SelectItem>
                      <SelectItem value="activities_created">Atividades Criadas</SelectItem>
                      <SelectItem value="activities_total">Total de Atividades</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {form.period === 'custom' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Início</Label>
                      <Input type="date" value={form.start_date} onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))} />
                    </div>
                    <div>
                      <Label>Fim</Label>
                      <Input type="date" value={form.end_date} onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))} />
                    </div>
                  </div>
                )}
                <Button onClick={handleCreate} className="w-full">Criar Meta</Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {loading ? (
          <p className="text-center py-4 text-muted-foreground">Carregando...</p>
        ) : goals.length === 0 ? (
          <p className="text-center py-4 text-muted-foreground">Nenhuma meta configurada</p>
        ) : (
          <div className="space-y-4">
            {goals.map(goal => {
              const current = calculateProgress(goal);
              const percentage = Math.min(Math.round((current / goal.target_count) * 100), 100);
              const isComplete = current >= goal.target_count;

              return (
                <div key={goal.id} className="p-4 rounded-lg border bg-card hover:bg-muted/20 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-sm">{goal.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {METRIC_LABELS[goal.metric]} • {PERIOD_LABELS[goal.period]}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-lg font-bold ${isComplete ? 'text-status-ativo' : 'text-primary'}`}>
                        {current}/{goal.target_count}
                      </span>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => deleteGoal(goal.id)}>
                        <Trash2 className="h-3 w-3 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                  <Progress
                    value={percentage}
                    className={`h-2 ${isComplete ? '[&>div]:bg-status-ativo' : ''}`}
                  />
                  <p className="text-[10px] text-muted-foreground mt-1 text-right">{percentage}%</p>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
