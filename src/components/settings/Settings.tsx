import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings as SettingsIcon, Download, Upload, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface SettingsProps {
  activities: any[];
  statuses: any[];
  onClearData: () => void;
}

export const Settings = ({ activities, statuses, onClearData }: SettingsProps) => {
  const [autoSave, setAutoSave] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [compactView, setCompactView] = useState(false);

  const exportAllData = () => {
    const data = {
      activities,
      statuses,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `agenda_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success('Backup exportado com sucesso!');
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        if (data.activities && data.statuses) {
          localStorage.setItem('activities', JSON.stringify(data.activities));
          localStorage.setItem('statuses', JSON.stringify(data.statuses));
          
          toast.success('Dados importados com sucesso! Recarregue a página.');
        } else {
          toast.error('Formato de arquivo inválido');
        }
      } catch (error) {
        toast.error('Erro ao importar dados');
      }
    };
    reader.readAsText(file);
  };

  const handleClearData = () => {
    if (confirm('Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.')) {
      onClearData();
      toast.success('Todos os dados foram removidos');
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-medium">
        <CardHeader className="bg-gradient-secondary">
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            Configurações Gerais
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="auto-save">Salvamento Automático</Label>
              <p className="text-sm text-muted-foreground">
                Salvar automaticamente as alterações
              </p>
            </div>
            <Switch
              id="auto-save"
              checked={autoSave}
              onCheckedChange={setAutoSave}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notifications">Notificações</Label>
              <p className="text-sm text-muted-foreground">
                Exibir notificações de sistema
              </p>
            </div>
            <Switch
              id="notifications"
              checked={notifications}
              onCheckedChange={setNotifications}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="compact-view">Visualização Compacta</Label>
              <p className="text-sm text-muted-foreground">
                Usar layout mais compacto para a tabela
              </p>
            </div>
            <Switch
              id="compact-view"
              checked={compactView}
              onCheckedChange={setCompactView}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-medium">
        <CardHeader className="bg-gradient-secondary">
          <CardTitle>Backup e Restauração</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div>
            <h4 className="font-medium mb-2">Exportar Backup Completo</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Faça backup de todas as atividades e configurações
            </p>
            <Button onClick={exportAllData} variant="outline" className="w-full">
              <Download className="h-4 w-4" />
              Exportar Backup
            </Button>
          </div>

          <div>
            <h4 className="font-medium mb-2">Importar Backup</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Restaurar dados de um arquivo de backup
            </p>
            <input
              type="file"
              accept=".json"
              onChange={importData}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-medium border-destructive/20">
        <CardHeader className="bg-destructive/5">
          <CardTitle className="text-destructive">Zona de Perigo</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div>
            <h4 className="font-medium mb-2">Limpar Todos os Dados</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Remove permanentemente todas as atividades e configurações.
              Esta ação não pode ser desfeita.
            </p>
            <Button
              onClick={handleClearData}
              variant="destructive"
              className="w-full"
            >
              <Trash2 className="h-4 w-4" />
              Limpar Todos os Dados
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-medium">
        <CardHeader className="bg-gradient-secondary">
          <CardTitle>Informações do Sistema</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Total de Atividades:</span>
              <span className="ml-2">{activities.length}</span>
            </div>
            <div>
              <span className="font-medium">Status Configurados:</span>
              <span className="ml-2">{statuses.length}</span>
            </div>
            <div>
              <span className="font-medium">Versão:</span>
              <span className="ml-2">1.0.0</span>
            </div>
            <div>
              <span className="font-medium">Última Atualização:</span>
              <span className="ml-2">{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};