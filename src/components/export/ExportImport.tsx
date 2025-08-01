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
    const files = event.target.files;
    if (!files || files.length === 0) return;

    let allImportedActivities: Activity[] = [];
    let processedFiles = 0;
    const totalFiles = files.length;

    const processFile = (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          let importedActivities: Activity[] = [];

        if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
          // Handle Excel files
          const arrayBuffer = data as ArrayBuffer;
          const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });
          
          // Process all sheets
          workbook.SheetNames.forEach(sheetName => {
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
            
            if (jsonData.length < 2) return; // Skip empty sheets
            
            const headers = jsonData[0] as string[];
            const rows = jsonData.slice(1) as any[][];
            
            rows.forEach(row => {
              if (row.some((cell: any) => cell !== undefined && cell !== '')) {
                const getFieldValue = (fieldNames: string[], raw = false) => {
                  for (const fieldName of fieldNames) {
                    const index = headers.findIndex(h => 
                      h && h.toString().toLowerCase().includes(fieldName.toLowerCase())
                    );
                    if (index >= 0 && row[index] !== undefined && row[index] !== '') {
                      return raw ? row[index] : row[index].toString();
                    }
                  }
                  return '';
                };

                // Convert date format from Excel serial number or "28/7" to "2025-07-28"
                const convertDateFormat = (cellValue: any) => {
                  if (!cellValue) return '';
                  
                  // Check if it's an Excel serial number (number)
                  if (typeof cellValue === 'number') {
                    // Excel date serial number to JavaScript Date
                    // Excel epoch is January 1, 1900 (but Excel treats 1900 as leap year incorrectly)
                    const excelEpoch = new Date(1900, 0, 1);
                    const jsDate = new Date(excelEpoch.getTime() + (cellValue - 2) * 24 * 60 * 60 * 1000);
                    
                    const year = jsDate.getFullYear();
                    const month = String(jsDate.getMonth() + 1).padStart(2, '0');
                    const day = String(jsDate.getDate()).padStart(2, '0');
                    
                    return `${year}-${month}-${day}`;
                  }
                  
                  const dateStr = cellValue.toString();
                  
                  // Handle formats like "28/7", "28/07", "28/7/2025", etc.
                  const parts = dateStr.split('/');
                  if (parts.length >= 2) {
                    const day = parts[0].padStart(2, '0');
                    const month = parts[1].padStart(2, '0');
                    const year = parts[2] || '2025'; // Default to current year if not provided
                    return `${year}-${month}-${day}`;
                  }
                  
                  // Handle ISO format dates
                  if (dateStr.includes('-') && dateStr.length === 10) {
                    return dateStr;
                  }
                  
                  return dateStr; // Return as-is if not in expected format
                };

                const rawData = getFieldValue(['data'], true); // Get raw value for date conversion
                const convertedData = convertDateFormat(rawData);

                const activity: Activity = {
                  data: convertedData,
                  hora: getFieldValue(['hora']),
                  obra: getFieldValue(['obra']),
                  site: getFieldValue(['site']),
                  otsOsi: getFieldValue(['ots', 'osi', 'ots / osi']),
                  designacao: getFieldValue(['designação', 'designacao']),
                  equipeConfiguracao: getFieldValue(['equipe configuração', 'equipe_configuracao']),
                  cidade: getFieldValue(['cidade']),
                  empresa: getFieldValue(['empresa']),
                  equipe: getFieldValue(['equipe']),
                  atividade: getFieldValue(['atividade']),
                  observacao: getFieldValue(['observação', 'observacao']),
                  status: getFieldValue(['status']) || 'PENDENTE',
                };
                importedActivities.push(activity);
              }
            });
          });
        } else {
          // Handle CSV files
          const content = e.target?.result as string;
          const lines = content.split('\n');
          const headers = lines[0] ? lines[0].split(',').map(h => h.trim().replace(/"/g, '')) : [];
          
          for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
            if (values.length >= headers.length && values.some(v => v)) {
              // Convert date format for CSV too
              const convertDateFormat = (cellValue: any) => {
                if (!cellValue) return '';
                
                // For CSV, values are already strings, but apply same logic
                const dateStr = cellValue.toString();
                
                const parts = dateStr.split('/');
                if (parts.length >= 2) {
                  const day = parts[0].padStart(2, '0');
                  const month = parts[1].padStart(2, '0');
                  const year = parts[2] || '2025';
                  return `${year}-${month}-${day}`;
                }
                
                // Handle ISO format dates
                if (dateStr.includes('-') && dateStr.length === 10) {
                  return dateStr;
                }
                
                return dateStr;
              };

              const getFieldValue = (fieldNames: string[]) => {
                for (const fieldName of fieldNames) {
                  const index = headers.findIndex(h => 
                    h && h.toLowerCase().includes(fieldName.toLowerCase())
                  );
                  if (index >= 0 && values[index]) {
                    return values[index];
                  }
                }
                return '';
              };

              const rawData = getFieldValue(['data']);
              const convertedData = convertDateFormat(rawData);

              const activity: Activity = {
                data: convertedData,
                hora: getFieldValue(['hora']),
                obra: getFieldValue(['obra']),
                site: getFieldValue(['site']),
                otsOsi: getFieldValue(['ots', 'osi', 'ots / osi']),
                designacao: getFieldValue(['designação', 'designacao']),
                equipeConfiguracao: getFieldValue(['equipe configuração', 'equipe_configuracao']),
                cidade: getFieldValue(['cidade']),
                empresa: getFieldValue(['empresa']),
                equipe: getFieldValue(['equipe']),
                atividade: getFieldValue(['atividade']),
                observacao: getFieldValue(['observação', 'observacao']),
                status: getFieldValue(['status']) || 'PENDENTE',
              };
              importedActivities.push(activity);
            }
          }
        }

          allImportedActivities.push(...importedActivities);
          processedFiles++;

          if (processedFiles === totalFiles) {
            // All files processed
            onImportActivities(allImportedActivities);
            toast.success(`${allImportedActivities.length} atividades importadas de ${totalFiles} arquivo(s)`);
            
            // Clear input
            event.target.value = '';
          }
        } catch (error) {
          processedFiles++;
          toast.error(`Erro ao importar arquivo ${file.name}. Verifique o formato.`);
          console.error('Import error:', error);
          
          if (processedFiles === totalFiles && allImportedActivities.length > 0) {
            // Some files were successful
            onImportActivities(allImportedActivities);
            toast.success(`${allImportedActivities.length} atividades importadas com sucesso`);
            event.target.value = '';
          }
        }
      };

      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        reader.readAsArrayBuffer(file);
      } else {
        reader.readAsText(file);
      }
    };

    // Process all selected files
    Array.from(files).forEach(processFile);
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
            <Label htmlFor="import-file">Selecionar Arquivos Excel/CSV</Label>
            <input
              id="import-file"
              type="file"
              accept=".csv,.xlsx,.xls"
              multiple
              onChange={handleFileImport}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2">Formato esperado do arquivo:</h4>
            <p className="text-sm text-muted-foreground">
              Os arquivos Excel/CSV devem conter as colunas na seguinte ordem:<br />
              DATA, HORA, OBRA, SITE, OTS / OSI, DESIGNAÇÃO, EQUIPE CONFIGURAÇÃO, 
              CIDADE, EMPRESA, EQUIPE, ATIVIDADE, OBSERVAÇÃO, STATUS<br />
              <strong>Você pode selecionar múltiplos arquivos para importação simultânea</strong><br />
              <strong>Arquivos Excel podem ter múltiplas abas (uma por mês)</strong>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};