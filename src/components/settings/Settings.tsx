import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Settings as SettingsIcon, Download, Upload, Trash2, Image } from 'lucide-react';
import { toast } from 'sonner';
import { ThemePicker } from '@/components/themes/ThemePicker';

interface SettingsProps {
  activities: any[];
  statuses: any[];
  onClearData: () => void;
}

export const Settings = ({ activities, statuses, onClearData }: SettingsProps) => {
  const [autoSave, setAutoSave] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [compactView, setCompactView] = useState(false);
  const [appTitle, setAppTitle] = useState(() => localStorage.getItem('appTitle') || 'Agenda Empresarial');
  const [appSubtitle, setAppSubtitle] = useState(() => localStorage.getItem('appSubtitle') || 'Controle de Demandas');
  const [logo, setLogo] = useState<string>('');

  const updateFavicon = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      
      // Remove existing favicon links
      const existingFavicons = document.querySelectorAll('link[rel*="icon"]');
      existingFavicons.forEach(link => link.remove());
      
      // Add new favicon
      const link = document.createElement('link');
      link.rel = 'icon';
      link.type = file.type;
      link.href = result;
      document.head.appendChild(link);
      
      // Save to localStorage for persistence
      localStorage.setItem('customFavicon', result);
      
      toast.success('Favicon atualizado com sucesso!');
    };
    reader.readAsDataURL(file);
  };

  const updateLogo = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setLogo(result);
      
      // Store logo globally
      const logoEvent = new CustomEvent('logoUpdated', { 
        detail: { logo: result } 
      });
      window.dispatchEvent(logoEvent);
      
      toast.success('Logo atualizado com sucesso!');
    };
    reader.readAsDataURL(file);
  };

  const updateAppBranding = () => {
    localStorage.setItem('appTitle', appTitle);
    localStorage.setItem('appSubtitle', appSubtitle);
    
    // Trigger a custom event to update the sidebar
    window.dispatchEvent(new CustomEvent('brandingUpdated', { 
      detail: { title: appTitle, subtitle: appSubtitle } 
    }));
    
    toast.success('Informações da marca atualizadas!');
  };

  const exportAllData = () => {
    const brandingData = {
      appTitle: localStorage.getItem('appTitle') || 'Agenda Empresarial',
      appSubtitle: localStorage.getItem('appSubtitle') || 'Controle de Demandas',
      customFavicon: localStorage.getItem('customFavicon') || null,
      activities,
      statuses,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };

    const blob = new Blob([JSON.stringify(brandingData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `agenda_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success('Backup exportado com sucesso! (Dados de atividades são salvos no banco de dados e exportados via "Importar/Exportar")');
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        if (data.activities || data.statuses) {
          toast.info('Para importar atividades, use a seção "Importar/Exportar" no menu lateral. Este backup contém apenas configurações de marca.');
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
    if (confirm('Tem certeza que deseja limpar as configurações de marca? As atividades são gerenciadas pelo banco de dados.')) {
      localStorage.removeItem('appTitle');
      localStorage.removeItem('appSubtitle');
      localStorage.removeItem('customFavicon');
      toast.success('Configurações de marca removidas. Recarregue a página para aplicar.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <ThemePicker />
      <Card className="shadow-medium">
        <CardHeader className="bg-gradient-secondary">
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            Personalização da Marca
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div>
            <Label htmlFor="app-title">Nome da Aplicação</Label>
            <Input
              id="app-title"
              type="text"
              value={appTitle}
              onChange={(e) => setAppTitle(e.target.value)}
              className="mt-2"
              placeholder="Nome da aplicação"
            />
          </div>

          <div>
            <Label htmlFor="app-subtitle">Subtítulo</Label>
            <Input
              id="app-subtitle"
              type="text"
              value={appSubtitle}
              onChange={(e) => setAppSubtitle(e.target.value)}
              className="mt-2"
              placeholder="Subtítulo da aplicação"
            />
          </div>

          <div>
            <Label htmlFor="logo-upload">Logo da Aplicação (PNG/JPG/SVG)</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Logo que aparecerá na barra lateral
            </p>
            <input
              id="logo-upload"
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/svg+xml"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) updateLogo(file);
              }}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            {logo && (
              <div className="mt-2">
                <img src={logo} alt="Logo preview" className="h-16 w-auto border rounded" />
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="favicon-upload">Favicon (PNG/JPG)</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Altere o ícone que aparece na aba do navegador
            </p>
            <input
              id="favicon-upload"
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) updateFavicon(file);
              }}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Importante: Lovable não suporta arquivos .ico. Use PNG/JPG.
            </p>
          </div>

          <Button onClick={updateAppBranding} className="w-full">
            Salvar Alterações da Marca
          </Button>
        </CardContent>
      </Card>

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