import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RepeatIcon, Plus, Trash2, PauseCircle, PlayCircle } from 'lucide-react';
import { toast } from 'sonner';
import { ActivityStatus } from '@/types/activity';

interface RecurringActivity {
  id: string;
  name: string;
  template_data: Record<string, string>;
  frequency: string;
  days_of_week: number[];
  day_of_month: number | null;
  start_date: string;
  end_date: string | null;
  last_generated_date: string | null;
  active: boolean;
}

interface RecurringActivitiesProps {
  statuses: ActivityStatus[];
}

const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export const RecurringActivities = ({ statuses }: RecurringActivitiesProps) => {
  const [items, setItems] = useState<RecurringActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    frequency: 'daily',
    days_of_week: [] as number[],
    day_of_month: 1,
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    obra: '',
    site: '',
    atividade: '',
    equipe: '',
    equipeConfiguracao: '',
    cidade: '',
    empresa: '',
    status: 'PENDENTE',
  });

  useEffect(() => { loadItems(); }, []);

  const loadItems = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) { setLoading(false); return; }

    const { data, error } = await supabase
      .from('recurring_activities' as any)
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (!error && data) setItems(data as any[]);
    setLoading(false);
  };

  const toggleDayOfWeek = (day: number) => {
    setForm(prev => ({
      ...prev,
      days_of_week: prev.days_of_week.includes(day)
        ? prev.days_of_week.filter(d => d !== day)
        : [...prev.days_of_week, day].sort(),
    }));
  };

  const handleCreate = async () => {
    if (!form.name || !form.atividade) {
      toast.error('Nome e atividade são obrigatórios');
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const templateData: Record<string, string> = {
      obra: form.obra,
      site: form.site,
      atividade: form.atividade,
      equipe: form.equipe,
      equipeConfiguracao: form.equipeConfiguracao,
      cidade: form.cidade,
      empresa: form.empresa,
      status: form.status,
    };

    const { error } = await supabase
      .from('recurring_activities' as any)
      .insert({
        user_id: session.user.id,
        name: form.name,
        template_data: templateData,
        frequency: form.frequency,
        days_of_week: form.frequency === 'weekly' ? form.days_of_week : [],
        day_of_month: form.frequency === 'monthly' ? form.day_of_month : null,
        start_date: form.start_date,
        end_date: form.end_date || null,
      });

    if (error) {
      toast.error('Erro ao criar atividade recorrente');
    } else {
      toast.success('Atividade recorrente criada!');
      setIsDialogOpen(false);
      setForm({
        name: '', frequency: 'daily', days_of_week: [], day_of_month: 1,
        start_date: new Date().toISOString().split('T')[0], end_date: '',
        obra: '', site: '', atividade: '', equipe: '', equipeConfiguracao: '',
        cidade: '', empresa: '', status: 'PENDENTE',
      });
      loadItems();
    }
  };

  const toggleActive = async (id: string, currentActive: boolean) => {
    const { error } = await supabase
      .from('recurring_activities' as any)
      .update({ active: !currentActive })
      .eq('id', id);

    if (!error) {
      setItems(prev => prev.map(i => i.id === id ? { ...i, active: !currentActive } : i));
      toast.success(!currentActive ? 'Atividade ativada' : 'Atividade pausada');
    }
  };

  const deleteItem = async (id: string) => {
    const { error } = await supabase
      .from('recurring_activities' as any)
      .delete()
      .eq('id', id);

    if (!error) {
      setItems(prev => prev.filter(i => i.id !== id));
      toast.success('Atividade recorrente removida');
    }
  };

  const getFrequencyLabel = (freq: string, days: number[], dayOfMonth: number | null) => {
    switch (freq) {
      case 'daily': return 'Diária';
      case 'weekly': return `Semanal (${days.map(d => DAY_NAMES[d]).join(', ')})`;
      case 'monthly': return `Mensal (dia ${dayOfMonth})`;
      default: return freq;
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <Card className="shadow-medium">
        <CardHeader className="bg-gradient-secondary">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RepeatIcon className="h-5 w-5" />
              Atividades Recorrentes
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nova Recorrente
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Nova Atividade Recorrente</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Nome da Regra</Label>
                    <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Ex: Inspeção semanal" />
                  </div>

                  <div>
                    <Label>Frequência</Label>
                    <Select value={form.frequency} onValueChange={v => setForm(p => ({ ...p, frequency: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Diária</SelectItem>
                        <SelectItem value="weekly">Semanal</SelectItem>
                        <SelectItem value="monthly">Mensal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {form.frequency === 'weekly' && (
                    <div>
                      <Label>Dias da Semana</Label>
                      <div className="flex gap-1 mt-1">
                        {DAY_NAMES.map((day, idx) => (
                          <Button
                            key={idx}
                            variant={form.days_of_week.includes(idx) ? 'default' : 'outline'}
                            size="sm"
                            className="w-10 h-8 text-xs"
                            onClick={() => toggleDayOfWeek(idx)}
                          >
                            {day}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {form.frequency === 'monthly' && (
                    <div>
                      <Label>Dia do Mês</Label>
                      <Input type="number" min={1} max={28} value={form.day_of_month} onChange={e => setForm(p => ({ ...p, day_of_month: parseInt(e.target.value) || 1 }))} />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Data Início</Label>
                      <Input type="date" value={form.start_date} onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))} />
                    </div>
                    <div>
                      <Label>Data Fim (opcional)</Label>
                      <Input type="date" value={form.end_date} onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))} />
                    </div>
                  </div>

                  <hr className="my-2" />
                  <p className="text-sm font-medium text-muted-foreground">Dados da Atividade</p>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Atividade *</Label>
                      <Input value={form.atividade} onChange={e => setForm(p => ({ ...p, atividade: e.target.value }))} />
                    </div>
                    <div>
                      <Label>Obra</Label>
                      <Input value={form.obra} onChange={e => setForm(p => ({ ...p, obra: e.target.value }))} />
                    </div>
                    <div>
                      <Label>Site</Label>
                      <Input value={form.site} onChange={e => setForm(p => ({ ...p, site: e.target.value }))} />
                    </div>
                    <div>
                      <Label>Equipe</Label>
                      <Input value={form.equipe} onChange={e => setForm(p => ({ ...p, equipe: e.target.value }))} />
                    </div>
                    <div>
                      <Label>Cidade</Label>
                      <Input value={form.cidade} onChange={e => setForm(p => ({ ...p, cidade: e.target.value }))} />
                    </div>
                    <div>
                      <Label>Empresa</Label>
                      <Input value={form.empresa} onChange={e => setForm(p => ({ ...p, empresa: e.target.value }))} />
                    </div>
                  </div>

                  <div>
                    <Label>Status Inicial</Label>
                    <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {statuses.map(s => (
                          <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button onClick={handleCreate} className="w-full">Criar Atividade Recorrente</Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {loading ? (
            <p className="text-center py-6 text-muted-foreground">Carregando...</p>
          ) : items.length === 0 ? (
            <p className="text-center py-6 text-muted-foreground">Nenhuma atividade recorrente configurada</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Atividade</TableHead>
                  <TableHead>Frequência</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map(item => (
                  <TableRow key={item.id} className={!item.active ? 'opacity-50' : ''}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{(item.template_data as any)?.atividade || '-'}</TableCell>
                    <TableCell className="text-sm">
                      {getFrequencyLabel(item.frequency, item.days_of_week || [], item.day_of_month)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {item.start_date} {item.end_date ? `→ ${item.end_date}` : '→ ∞'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.active ? 'default' : 'secondary'}>
                        {item.active ? 'Ativa' : 'Pausada'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => toggleActive(item.id, item.active)}>
                          {item.active ? <PauseCircle className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteItem(item.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
