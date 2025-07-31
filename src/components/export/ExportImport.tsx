import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity } from '@/types/activity';
import { Download, Upload, FileSpreadsheet, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

interface ExportImportProps {
  activities: Activity[];
  onImportActivities: (activities: Activity[]) => void;
}

export const ExportImport = ({ activities, onImportActivities }: ExportImportProps) => {
  const [exportPeriod, setExportPeriod] = useState<'day' | 'week' | 'month'>('day');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const getFilteredActivities = () => {
    const date = new Date(selectedDate);
    
    switch (exportPeriod) {
      case 'day':
        return activities.filter(activity => activity.data === selectedDate);
      
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        return activities.filter(activity => {
          const activityDate = new Date(activity.data);
          return activityDate >= weekStart && activityDate <= weekEnd;
        });
      
      case 'month':
        return activities.filter(activity => {
          const activityDate = new Date(activity.data);
          return activityDate.getFullYear() === date.getFullYear() &&
                 activityDate.getMonth() === date.getMonth();
        });
      
      default:
        return activities;
    }
  };

  const exportToExcel = () => {
    const filteredActivities = getFilteredActivities();
    
    if (filteredActivities.length === 0) {
      toast.error('Nenhuma atividade encontrada para o período selecionado');
      return;
    }

    // Group activities by month for multiple sheets
    const groupedActivities = filteredActivities.reduce((acc, activity) => {
      const date = new Date(activity.data);
      const monthKey = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      
      if (!acc[monthKey]) {
        acc[monthKey] = [];
      }
      acc[monthKey].push(activity);
      return acc;
    }, {} as Record<string, Activity[]>);

    const workbook = XLSX.utils.book_new();

    Object.entries(groupedActivities).forEach(([monthName, monthActivities]) => {
      const worksheetData = [
        ['DATA', 'HORA', 'OBRA', 'SITE', 'OTS / OSI', 'DESIGNAÇÃO', 'EQUIPE CONFIGURAÇÃO', 'CIDADE', 'EMPRESA', 'EQUIPE', 'ATIVIDADE', 'OBSERVAÇÃO', 'STATUS'],
        ...monthActivities.map(activity => [
          activity.data,
          activity.hora,
          activity.obra,
          activity.site,
          activity.otsOsi,
          activity.designacao,
          activity.equipeConfiguracao,
          activity.cidade,
          activity.empresa,
          activity.equipe,
          activity.atividade,
          activity.observacao,
          activity.status
        ])
      ];

      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
      XLSX.utils.book_append_sheet(workbook, worksheet, monthName);
    });

    XLSX.writeFile(workbook, `atividades_${exportPeriod}_${selectedDate}.xlsx`);

    toast.success(`Arquivo exportado com ${filteredActivities.length} atividades`);
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        let importedActivities: Activity[] = [];

        if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
          // Handle Excel files
          const workbook = XLSX.read(data, { type: 'binary' });
          
          // Process all sheets
          workbook.SheetNames.forEach(sheetName => {
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
            
            // Skip header row
            for (let i = 1; i < jsonData.length; i++) {
              const row = jsonData[i];
              if (row && row.length >= 13) {
                const activity: Activity = {
                  id: Date.now().toString() + Math.random(),
                  data: row[0] || '',
                  hora: row[1] || '',
                  obra: row[2] || '',
                  site: row[3] || '',
                  otsOsi: row[4] || '',
                  designacao: row[5] || '',
                  equipeConfiguracao: row[6] || '',
                  cidade: row[7] || '',
                  empresa: row[8] || '',
                  equipe: row[9] || '',
                  atividade: row[10] || '',
                  observacao: row[11] || '',
                  status: row[12] || '',
                };
                importedActivities.push(activity);
              }
            }
          });
        } else {
          // Handle CSV files
          const content = e.target?.result as string;
          const lines = content.split('\n');
          
          for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            const values = line.split(',');
            if (values.length >= 13) {
              const activity: Activity = {
                id: Date.now().toString() + i,
                data: values[0],
                hora: values[1],
                obra: values[2],
                site: values[3],
                otsOsi: values[4],
                designacao: values[5],
                equipeConfiguracao: values[6],
                cidade: values[7],
                empresa: values[8],
                equipe: values[9],
                atividade: values[10],
                observacao: values[11].replace(/"/g, ''),
                status: values[12],
              };
              importedActivities.push(activity);
            }
          }
        }

        onImportActivities(importedActivities);
        toast.success(`${importedActivities.length} atividades importadas com sucesso`);
        
        // Clear input
        event.target.value = '';
      } catch (error) {
        toast.error('Erro ao importar arquivo. Verifique o formato.');
        console.error('Import error:', error);
      }
    };

    if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      reader.readAsBinaryString(file);
    } else {
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-medium">
        <CardHeader className="bg-gradient-secondary">
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Exportar Atividades
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="period">Período de Exportação</Label>
              <Select value={exportPeriod} onValueChange={(value: any) => setExportPeriod(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Por Dia</SelectItem>
                  <SelectItem value="week">Por Semana</SelectItem>
                  <SelectItem value="month">Por Mês</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="date">Data de Referência</Label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              {getFilteredActivities().length} atividades serão exportadas
            </span>
          </div>

          <Button onClick={exportToExcel} variant="hero" className="w-full">
            <FileSpreadsheet className="h-4 w-4" />
            Exportar Excel
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-medium">
        <CardHeader className="bg-gradient-secondary">
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Importar Atividades
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div>
            <Label htmlFor="import-file">Selecionar Arquivo Excel/CSV</Label>
            <input
              id="import-file"
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileImport}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2">Formato esperado do arquivo:</h4>
            <p className="text-sm text-muted-foreground">
              O arquivo Excel/CSV deve conter as colunas na seguinte ordem:<br />
              DATA, HORA, OBRA, SITE, OTS / OSI, DESIGNAÇÃO, EQUIPE CONFIGURAÇÃO, 
              CIDADE, EMPRESA, EQUIPE, ATIVIDADE, OBSERVAÇÃO, STATUS<br />
              <strong>Arquivos Excel podem ter múltiplas abas (uma por mês)</strong>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};