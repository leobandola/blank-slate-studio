import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileBox, Plus, Trash2, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { Activity, ActivityStatus } from '@/types/activity';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Template {
  id: string;
  name: string;
  description: string | null;
  template_data: Record<string, string>;
}

interface ActivityTemplatesProps {
  statuses: ActivityStatus[];
  onApplyTemplate: (activity: Omit<Activity, 'id'>) => void;
}

export const ActivityTemplates = ({ statuses, onApplyTemplate }: ActivityTemplatesProps) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    obra: '',
    site: '',
    atividade: '',
    equipe: '',
    equipeConfiguracao: '',
    cidade: '',
    empresa: '',
    status: 'PENDENTE',
    otsOsi: '',
    designacao: '',
  });

  useEffect(() => { loadTemplates(); }, []);

  const loadTemplates = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) { setLoading(false); return; }

    const { data, error } = await supabase
      .from('activity_templates' as any)
      .select('*')
      .eq('user_id', session.user.id)
      .order('name');

    if (!error && data) setTemplates(data as any[]);
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!form.name) {
      toast.error('Nome do template é obrigatório');
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
      otsOsi: form.otsOsi,
      designacao: form.designacao,
    };

    const { error } = await supabase
      .from('activity_templates' as any)
      .insert({
        user_id: session.user.id,
        name: form.name,
        description: form.description || null,
        template_data: templateData,
      });

    if (error) {
      toast.error('Erro ao criar template');
    } else {
      toast.success('Template criado!');
      setIsDialogOpen(false);
      setForm({ name: '', description: '', obra: '', site: '', atividade: '', equipe: '', equipeConfiguracao: '', cidade: '', empresa: '', status: 'PENDENTE', otsOsi: '', designacao: '' });
      loadTemplates();
    }
  };

  const applyTemplate = (template: Template) => {
    const d = template.template_data;
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toTimeString().split(' ')[0].substring(0, 5);

    onApplyTemplate({
      data: today,
      hora: now,
      obra: d.obra || '',
      site: d.site || '',
      otsOsi: d.otsOsi || '',
      designacao: d.designacao || '',
      equipeConfiguracao: d.equipeConfiguracao || '',
      cidade: d.cidade || '',
      empresa: d.empresa || '',
      equipe: d.equipe || '',
      atividade: d.atividade || '',
      observacao: '',
      status: d.status || 'PENDENTE',
      tags: [],
      prazo: '',
    });
    toast.success(`Template "${template.name}" aplicado!`);
  };

  const deleteTemplate = async (id: string) => {
    const { error } = await supabase
      .from('activity_templates' as any)
      .delete()
      .eq('id', id);

    if (!error) {
      setTemplates(prev => prev.filter(t => t.id !== id));
      toast.success('Template removido');
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <Card className="shadow-medium">
        <CardHeader className="bg-gradient-secondary">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileBox className="h-5 w-5" />
              Templates de Atividades
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Novo Template
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Novo Template</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Nome do Template *</Label>
                    <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Ex: Manutenção padrão" />
                  </div>
                  <div>
                    <Label>Descrição</Label>
                    <Input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Breve descrição" />
                  </div>

                  <hr />
                  <p className="text-sm font-medium text-muted-foreground">Campos pré-preenchidos</p>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Atividade</Label>
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
                      <Label>OTS/OSI</Label>
                      <Input value={form.otsOsi} onChange={e => setForm(p => ({ ...p, otsOsi: e.target.value }))} />
                    </div>
                    <div>
                      <Label>Designação</Label>
                      <Input value={form.designacao} onChange={e => setForm(p => ({ ...p, designacao: e.target.value }))} />
                    </div>
                    <div>
                      <Label>Equipe Config.</Label>
                      <Input value={form.equipeConfiguracao} onChange={e => setForm(p => ({ ...p, equipeConfiguracao: e.target.value }))} />
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
                    <div>
                      <Label>Status</Label>
                      <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {statuses.map(s => (
                            <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button onClick={handleCreate} className="w-full">Criar Template</Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {loading ? (
            <p className="text-center py-6 text-muted-foreground">Carregando...</p>
          ) : templates.length === 0 ? (
            <p className="text-center py-6 text-muted-foreground">Nenhum template criado</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Atividade</TableHead>
                  <TableHead>Obra</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map(t => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{t.description || '-'}</TableCell>
                    <TableCell>{(t.template_data as any)?.atividade || '-'}</TableCell>
                    <TableCell>{(t.template_data as any)?.obra || '-'}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm" className="gap-1" onClick={() => applyTemplate(t)}>
                          <Copy className="h-3 w-3" />
                          Usar
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteTemplate(t.id)}>
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
