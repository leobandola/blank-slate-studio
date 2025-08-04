import React, { useState } from 'react';
import { OsiActivity } from '@/types/osiActivity';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface AddOsiActivityFormProps {
  onAddActivity: (activity: Omit<OsiActivity, 'id'>) => void;
}

export const AddOsiActivityForm: React.FC<AddOsiActivityFormProps> = ({ onAddActivity }) => {
  const [formData, setFormData] = useState<Omit<OsiActivity, 'id'>>({
    data: '',
    obra: '',
    atividade: '',
    osi: '',
    ativacao: '',
    equipe_campo: '',
    equipe_configuracao: '',
    obs: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.data || !formData.obra || !formData.atividade || !formData.osi || !formData.ativacao) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    onAddActivity(formData);
    
    // Reset form
    setFormData({
      data: '',
      obra: '',
      atividade: '',
      osi: '',
      ativacao: '',
      equipe_campo: '',
      equipe_configuracao: '',
      obs: ''
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Adicionar Nova Atividade OSI</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label htmlFor="data" className="block text-sm font-medium mb-2">
                Data *
              </label>
              <Input
                type="date"
                id="data"
                name="data"
                value={formData.data}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label htmlFor="obra" className="block text-sm font-medium mb-2">
                Obra *
              </label>
              <Input
                type="text"
                id="obra"
                name="obra"
                value={formData.obra}
                onChange={handleChange}
                placeholder="Ex: 82707"
                required
              />
            </div>

            <div>
              <label htmlFor="osi" className="block text-sm font-medium mb-2">
                OSI *
              </label>
              <Input
                type="text"
                id="osi"
                name="osi"
                value={formData.osi}
                onChange={handleChange}
                placeholder="Ex: OSI154/2025"
                required
              />
            </div>

            <div>
              <label htmlFor="ativacao" className="block text-sm font-medium mb-2">
                Ativação *
              </label>
              <Input
                type="text"
                id="ativacao"
                name="ativacao"
                value={formData.ativacao}
                onChange={handleChange}
                placeholder="Ex: 29/07/2025 A 31/07/2025 08:00 AS 18:00HRS"
                required
              />
            </div>

            <div>
              <label htmlFor="equipe_campo" className="block text-sm font-medium mb-2">
                Equipe de Campo
              </label>
              <Input
                type="text"
                id="equipe_campo"
                name="equipe_campo"
                value={formData.equipe_campo}
                onChange={handleChange}
                placeholder="Ex: MARCELO MELGAÇO / CELIMAR"
              />
            </div>

            <div>
              <label htmlFor="equipe_configuracao" className="block text-sm font-medium mb-2">
                Equipe de Configuração
              </label>
              <Input
                type="text"
                id="equipe_configuracao"
                name="equipe_configuracao"
                value={formData.equipe_configuracao}
                onChange={handleChange}
                placeholder="Ex: JOSE AUGUSTO / DIEGO AMARAL"
              />
            </div>
          </div>

          <div>
            <label htmlFor="atividade" className="block text-sm font-medium mb-2">
              Atividade *
            </label>
            <Textarea
              id="atividade"
              name="atividade"
              value={formData.atividade}
              onChange={handleChange}
              placeholder="Descreva a atividade detalhadamente..."
              rows={3}
              required
            />
          </div>

          <div>
            <label htmlFor="obs" className="block text-sm font-medium mb-2">
              Observações
            </label>
            <Textarea
              id="obs"
              name="obs"
              value={formData.obs}
              onChange={handleChange}
              placeholder="Observações adicionais..."
              rows={2}
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" className="px-8">
              Adicionar Atividade OSI
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};