import React from 'react';
import { OsiActivity } from '@/types/osiActivity';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, Download, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

interface OsiExportImportProps {
  onImportActivities: (activities: OsiActivity[]) => void;
  activities: OsiActivity[];
}

export const OsiExportImport: React.FC<OsiExportImportProps> = ({
  onImportActivities,
  activities
}) => {
  const exportTemplate = () => {
    const templateData = [
      {
        'DATA': '2025-07-29',
        'OBRA': '82707',
        'ATIVIDADE': 'Ativar os canais de 10Gbps na rede DWDM Huawei no trecho CTA-MCZ e MCZ-IFA para ampliação das FAC\'s 663 e 664',
        'OSI': 'OSI154/2025',
        'ATIVAÇÃO': '29/07/2025 A 31/07/2025 08:00 AS 18:00HRS',
        'EQUIPE DE CAMPO': 'MARCELO MELGAÇO / CELIMAR',
        'EQUIPE DE CONFIGURAÇÃO': 'JOSE AUGUSTO / DIEGO AMARAL',
        'OBS': ''
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    
    // Set column widths
    ws['!cols'] = [
      { width: 15 }, // DATA
      { width: 15 }, // OBRA
      { width: 40 }, // ATIVIDADE
      { width: 20 }, // OSI
      { width: 25 }, // ATIVAÇÃO
      { width: 25 }, // EQUIPE DE CAMPO
      { width: 25 }, // EQUIPE DE CONFIGURAÇÃO
      { width: 20 }  // OBS
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template OSI');

    XLSX.writeFile(wb, 'template_atividades_osi.xlsx');
    toast.success('Template baixado com sucesso');
  };

  const exportActivities = () => {
    if (activities.length === 0) {
      toast.error('Nenhuma atividade OSI para exportar');
      return;
    }

    try {
      const exportData = activities.map(activity => ({
        'DATA': activity.data,
        'OBRA': activity.obra,
        'ATIVIDADE': activity.atividade,
        'OSI': activity.osi,
        'ATIVAÇÃO': activity.ativacao,
        'EQUIPE DE CAMPO': activity.equipe_campo,
        'EQUIPE DE CONFIGURAÇÃO': activity.equipe_configuracao,
        'OBS': activity.obs
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      
      ws['!cols'] = [
        { width: 15 }, { width: 15 }, { width: 40 }, { width: 20 },
        { width: 25 }, { width: 25 }, { width: 25 }, { width: 20 }
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Atividades OSI');

      const fileName = `atividades_osi_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);

      toast.success('Atividades OSI exportadas com sucesso');
    } catch (error) {
      console.error('Error exporting OSI activities:', error);
      toast.error('Erro ao exportar atividades OSI');
    }
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    let allImportedActivities: OsiActivity[] = [];
    let processedFiles = 0;
    const totalFiles = files.length;

    const processFile = (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          let importedActivities: OsiActivity[] = [];

          if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
            // Handle Excel files
            const workbook = XLSX.read(data, { type: 'array' });
            
            // Process all sheets
            workbook.SheetNames.forEach(sheetName => {
              const worksheet = workbook.Sheets[sheetName];
              const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
              
              if (jsonData.length > 0) {
                const headers = jsonData[0] as string[];
                const dataRows = jsonData.slice(1);
                
                const activities = dataRows
                  .filter((row: any) => row && row.length > 0 && row.some((cell: any) => cell !== null && cell !== undefined && cell !== ''))
                  .map((row: any) => {
                    const activity: any = {};
                    
                    headers.forEach((header, index) => {
                      const normalizedHeader = header?.toString().toLowerCase().trim();
                      const cellValue = row[index]?.toString() || '';
                      
                      switch (normalizedHeader) {
                        case 'data':
                          activity.data = cellValue;
                          break;
                        case 'obra':
                          activity.obra = cellValue;
                          break;
                        case 'atividade':
                          activity.atividade = cellValue;
                          break;
                        case 'osi':
                          activity.osi = cellValue;
                          break;
                        case 'ativação':
                        case 'ativacao':
                          activity.ativacao = cellValue;
                          break;
                        case 'equipe de campo':
                        case 'equipe_campo':
                          activity.equipe_campo = cellValue;
                          break;
                        case 'equipe de configuração':
                        case 'equipe de configuracao':
                        case 'equipe_configuracao':
                          activity.equipe_configuracao = cellValue;
                          break;
                        case 'obs':
                        case 'observação':
                        case 'observacao':
                          activity.obs = cellValue;
                          break;
                      }
                    });
                    
                    return activity;
                  })
                  .filter((activity: any) => 
                    activity.data && activity.obra && activity.atividade && activity.osi
                  );
                
                importedActivities.push(...activities);
              }
            });
          } else {
            // Handle CSV files
            const lines = (data as string).split('\n');
            if (lines.length > 1) {
              const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
              
              const activities = lines.slice(1)
                .filter(line => line.trim())
                .map(line => {
                  const values = line.split(',');
                  const activity: any = {};
                  
                  headers.forEach((header, index) => {
                    const value = values[index]?.trim() || '';
                    
                    switch (header) {
                      case 'data':
                        activity.data = value;
                        break;
                      case 'obra':
                        activity.obra = value;
                        break;
                      case 'atividade':
                        activity.atividade = value;
                        break;
                      case 'osi':
                        activity.osi = value;
                        break;
                      case 'ativação':
                      case 'ativacao':
                        activity.ativacao = value;
                        break;
                      case 'equipe de campo':
                      case 'equipe_campo':
                        activity.equipe_campo = value;
                        break;
                      case 'equipe de configuração':
                      case 'equipe de configuracao':
                      case 'equipe_configuracao':
                        activity.equipe_configuracao = value;
                        break;
                      case 'obs':
                      case 'observação':
                      case 'observacao':
                        activity.obs = value;
                        break;
                    }
                  });
                  
                  return activity;
                })
                .filter((activity: any) => 
                  activity.data && activity.obra && activity.atividade && activity.osi
                );
              
              importedActivities.push(...activities);
            }
          }

          allImportedActivities.push(...importedActivities);
          processedFiles++;

          if (processedFiles === totalFiles) {
            // All files processed
            onImportActivities(allImportedActivities);
            toast.success(`${allImportedActivities.length} atividades OSI importadas de ${totalFiles} arquivo(s)`);
            
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
            toast.success(`${allImportedActivities.length} atividades OSI importadas com sucesso`);
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Export Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Exportar Atividades OSI
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button onClick={exportTemplate} variant="outline" className="gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Baixar Template
            </Button>
            <Button onClick={exportActivities} className="gap-2">
              <Download className="h-4 w-4" />
              Exportar Todas ({activities.length})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Import Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Importar Atividades OSI
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="import-osi-file">Selecionar Arquivos Excel/CSV</Label>
            <input
              id="import-osi-file"
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
              DATA, OBRA, ATIVIDADE, OSI, ATIVAÇÃO, EQUIPE DE CAMPO, EQUIPE DE CONFIGURAÇÃO, OBS<br />
              <strong>Você pode selecionar múltiplos arquivos para importação simultânea</strong><br />
              <strong>Arquivos Excel podem ter múltiplas abas</strong>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};