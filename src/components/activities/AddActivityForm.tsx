import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from '@/types/activity';
import { Plus, Calendar } from 'lucide-react';

interface AddActivityFormProps {
  statuses: Array<{ id: string; name: string; color: string }>;
  onAddActivity: (activity: Omit<Activity, 'id'>) => void;
}

export const AddActivityForm = ({ statuses, onAddActivity }: AddActivityFormProps) => {
  const [formData, setFormData] = useState<Omit<Activity, 'id'>>({
    data: new Date().toISOString().split('T')[0],
    hora: '',
    obra: '',
    site: '',
    otsOsi: '',
    designacao: '',
    equipeConfiguracao: '',
    cidade: '',
    empresa: '',
    equipe: '',
    atividade: '',
    observacao: '',
    status: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddActivity(formData);
    setFormData({
      data: new Date().toISOString().split('T')[0],
      hora: '',
      obra: '',
      site: '',
      otsOsi: '',
      designacao: '',
      equipeConfiguracao: '',
      cidade: '',
      empresa: '',
      equipe: '',
      atividade: '',
      observacao: '',
      status: '',
    });
  };

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="shadow-medium">
      <CardHeader className="bg-gradient-secondary">
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Nova Atividade
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="data">Data</Label>
              <Input
                id="data"
                type="date"
                value={formData.data}
                onChange={(e) => updateField('data', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="hora">Hora</Label>
              <Select value={formData.hora} onValueChange={(value) => updateField('hora', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MANHÃ">MANHÃ</SelectItem>
                  <SelectItem value="TARDE">TARDE</SelectItem>
                  <SelectItem value="NOITE">NOITE</SelectItem>
                  <SelectItem value="MADRUGADA">MADRUGADA</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="obra">Obra</Label>
              <Input
                id="obra"
                value={formData.obra}
                onChange={(e) => updateField('obra', e.target.value)}
                placeholder="Digite a obra"
              />
            </div>

            <div>
              <Label htmlFor="site">Site</Label>
              <Input
                id="site"
                value={formData.site}
                onChange={(e) => updateField('site', e.target.value)}
                placeholder="Digite o site"
              />
            </div>

            <div>
              <Label htmlFor="otsOsi">OTS / OSI</Label>
              <Input
                id="otsOsi"
                value={formData.otsOsi}
                onChange={(e) => updateField('otsOsi', e.target.value)}
                placeholder="Digite OTS/OSI"
              />
            </div>

            <div>
              <Label htmlFor="designacao">Designação</Label>
              <Input
                id="designacao"
                value={formData.designacao}
                onChange={(e) => updateField('designacao', e.target.value)}
                placeholder="Digite a designação"
              />
            </div>

            <div>
              <Label htmlFor="equipeConfiguracao">Equipe Configuração</Label>
              <Input
                id="equipeConfiguracao"
                value={formData.equipeConfiguracao}
                onChange={(e) => updateField('equipeConfiguracao', e.target.value)}
                placeholder="Digite a equipe de configuração"
              />
            </div>

            <div>
              <Label htmlFor="cidade">Cidade</Label>
              <Input
                id="cidade"
                value={formData.cidade}
                onChange={(e) => updateField('cidade', e.target.value)}
                placeholder="Digite a cidade"
              />
            </div>

            <div>
              <Label htmlFor="empresa">Empresa</Label>
              <Input
                id="empresa"
                value={formData.empresa}
                onChange={(e) => updateField('empresa', e.target.value)}
                placeholder="Digite a empresa"
              />
            </div>

            <div>
              <Label htmlFor="equipe">Equipe</Label>
              <Input
                id="equipe"
                value={formData.equipe}
                onChange={(e) => updateField('equipe', e.target.value)}
                placeholder="Digite a equipe"
              />
            </div>

            <div>
              <Label htmlFor="atividade">Atividade</Label>
              <Input
                id="atividade"
                value={formData.atividade}
                onChange={(e) => updateField('atividade', e.target.value)}
                placeholder="Digite a atividade"
              />
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => updateField('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status.id} value={status.name}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: status.color }}
                        />
                        {status.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="observacao">Observação</Label>
            <Textarea
              id="observacao"
              value={formData.observacao}
              onChange={(e) => updateField('observacao', e.target.value)}
              placeholder="Digite observações sobre a atividade"
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" variant="hero" className="flex-1">
              <Plus className="h-4 w-4" />
              Adicionar Atividade
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};