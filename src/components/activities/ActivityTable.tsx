import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Activity, ACTIVITY_COLUMNS } from '@/types/activity';
import { Edit, Trash2, Plus, FileSpreadsheet, Copy } from 'lucide-react';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ActivityTableProps {
  activities: Activity[];
  statuses: Array<{ id: string; name: string; color: string }>;
  onUpdateActivity: (id: string, updates: Partial<Activity>) => void;
  onDeleteActivity: (id: string) => void;
  onAddActivity: () => void;
  getStatusColor: (statusName: string) => string;
}

export const ActivityTable = ({
  activities,
  statuses,
  onUpdateActivity,
  onDeleteActivity,
  onAddActivity,
  getStatusColor,
}: ActivityTableProps) => {
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState('');

  const startEdit = (id: string, field: string, currentValue: string) => {
    setEditingCell({ id, field });
    setEditValue(currentValue);
  };

  const saveEdit = () => {
    if (editingCell) {
      onUpdateActivity(editingCell.id, { [editingCell.field]: editValue });
      setEditingCell(null);
      setEditValue('');
    }
  };

  const cancelEdit = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const exportFilteredActivities = () => {
    if (activities.length === 0) {
      toast.error('Nenhuma atividade para exportar');
      return;
    }

    // Create worksheet data with styling
    const worksheetData = [
      ['DATA', 'HORA', 'OBRA', 'SITE', 'OTS / OSI', 'DESIGNAÇÃO', 'EQUIPE CONFIGURAÇÃO', 'CIDADE', 'EMPRESA', 'EQUIPE', 'ATIVIDADE', 'OBSERVAÇÃO', 'STATUS'],
      ...activities.map(activity => [
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

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
    // Style the header row
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    for (let col = 0; col <= range.e.c; col++) {
      const headerCell = XLSX.utils.encode_cell({ c: col, r: 0 });
      if (!worksheet[headerCell]) continue;
      worksheet[headerCell].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: "CCCCCC" } },
        border: {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" }
        }
      };
    }
    
    // Style data rows with status colors and alternating row colors
    for (let row = 1; row <= range.e.r; row++) {
      const activity = activities[row - 1];
      const isEvenRow = row % 2 === 0;
      
      for (let col = 0; col <= range.e.c; col++) {
        const cellRef = XLSX.utils.encode_cell({ c: col, r: row });
        if (!worksheet[cellRef]) continue;
        
        let fillColor = isEvenRow ? "F9F9F9" : "FFFFFF";
        let fontColor = "000000";
        
        // Apply status color for status column (last column)
        if (col === range.e.c && activity?.status) {
          const statusColor = getStatusColor(activity.status);
          fillColor = statusColor.replace('#', '');
          // Use white text for darker backgrounds
          const rgb = parseInt(fillColor, 16);
          const r = (rgb >> 16) & 255;
          const g = (rgb >> 8) & 255;
          const b = rgb & 255;
          const brightness = (r * 299 + g * 587 + b * 114) / 1000;
          fontColor = brightness > 128 ? "000000" : "FFFFFF";
        }
        
        worksheet[cellRef].s = {
          fill: { fgColor: { rgb: fillColor } },
          font: { color: { rgb: fontColor } },
          border: {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" }
          }
        };
      }
    }

    // Set column widths
    const columnWidths = [
      { wch: 12 }, // DATA
      { wch: 8 },  // HORA
      { wch: 15 }, // OBRA
      { wch: 12 }, // SITE
      { wch: 12 }, // OTS/OSI
      { wch: 20 }, // DESIGNAÇÃO
      { wch: 18 }, // EQUIPE CONFIGURAÇÃO
      { wch: 15 }, // CIDADE
      { wch: 15 }, // EMPRESA
      { wch: 12 }, // EQUIPE
      { wch: 25 }, // ATIVIDADE
      { wch: 30 }, // OBSERVAÇÃO
      { wch: 15 }  // STATUS
    ];
    worksheet['!cols'] = columnWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Atividades Filtradas');

    // Generate filename with current date
    const today = new Date().toISOString().split('T')[0];
    const filename = `atividades_filtradas_${today}.xlsx`;
    
    XLSX.writeFile(workbook, filename);
    toast.success(`${activities.length} atividades exportadas para ${filename}`);
  };

  const copyWithColors = async () => {
    if (activities.length === 0) {
      toast.error('Nenhuma atividade para copiar');
      return;
    }

    // Create HTML table with inline styles for colors
    const headers = ['DATA', 'HORA', 'OBRA', 'SITE', 'OTS / OSI', 'DESIGNAÇÃO', 'EQUIPE CONFIGURAÇÃO', 'CIDADE', 'EMPRESA', 'EQUIPE', 'ATIVIDADE', 'OBSERVAÇÃO', 'STATUS'];
    
    let htmlTable = '<table border="1" cellpadding="4" cellspacing="0" style="border-collapse: collapse; font-family: Arial, sans-serif;">';
    
    // Header row
    htmlTable += '<tr style="background-color: #CCCCCC; font-weight: bold;">';
    headers.forEach(header => {
      htmlTable += `<td style="border: 1px solid #000; padding: 4px;">${header}</td>`;
    });
    htmlTable += '</tr>';
    
    // Data rows
    activities.forEach((activity, index) => {
      const isEvenRow = index % 2 === 0;
      const rowBgColor = isEvenRow ? '#F9F9F9' : '#FFFFFF';
      
      htmlTable += `<tr style="background-color: ${rowBgColor};">`;
      
      const values = [
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
      ];
      
      values.forEach((value, colIndex) => {
        let cellStyle = 'border: 1px solid #000; padding: 4px;';
        
        // Apply status color for status column (last column)
        if (colIndex === values.length - 1 && activity.status) {
          const statusColor = getStatusColor(activity.status);
          const rgb = parseInt(statusColor.replace('#', ''), 16);
          const r = (rgb >> 16) & 255;
          const g = (rgb >> 8) & 255;
          const b = rgb & 255;
          const brightness = (r * 299 + g * 587 + b * 114) / 1000;
          const textColor = brightness > 128 ? '#000000' : '#FFFFFF';
          
          cellStyle += ` background-color: ${statusColor}; color: ${textColor};`;
        }
        
        htmlTable += `<td style="${cellStyle}">${value || ''}</td>`;
      });
      
      htmlTable += '</tr>';
    });
    
    htmlTable += '</table>';

    try {
      // Create clipboard item with HTML format
      const clipboardItem = new ClipboardItem({
        'text/html': new Blob([htmlTable], { type: 'text/html' }),
        'text/plain': new Blob([
          headers.join('\t') + '\n' + 
          activities.map(activity => [
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
          ].join('\t')).join('\n')
        ], { type: 'text/plain' })
      });

      await navigator.clipboard.write([clipboardItem]);
      toast.success(`${activities.length} atividades copiadas com formatação`);
    } catch (error) {
      // Fallback to text-only copy
      const textData = headers.join('\t') + '\n' + 
        activities.map(activity => [
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
        ].join('\t')).join('\n');
      
      await navigator.clipboard.writeText(textData);
      toast.warning('Dados copiados sem formatação (seu navegador não suporta cópia com formatação)');
    }
  };

  return (
    <Card className="w-full overflow-hidden shadow-medium">
      <div className="p-4 border-b bg-gradient-secondary">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Lista de Atividades</h2>
          <div className="flex gap-2">
            <Button onClick={copyWithColors} size="sm" variant="outline">
              <Copy className="h-4 w-4" />
              Copiar com Cores
            </Button>
            <Button onClick={exportFilteredActivities} size="sm" variant="outline">
              <FileSpreadsheet className="h-4 w-4" />
              Exportar Excel
            </Button>
            <Button onClick={onAddActivity} size="sm" variant="hero">
              <Plus className="h-4 w-4" />
              Nova Atividade
            </Button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              {ACTIVITY_COLUMNS.map((column) => (
                <th
                  key={column.key}
                  className="text-left p-3 font-medium text-sm"
                  style={{ minWidth: column.width }}
                >
                  {column.label}
                </th>
              ))}
              <th className="text-left p-3 font-medium text-sm w-24">AÇÕES</th>
            </tr>
          </thead>
          <tbody>
            {activities.length === 0 ? (
              <tr>
                <td
                  colSpan={ACTIVITY_COLUMNS.length + 1}
                  className="text-center p-8 text-muted-foreground"
                >
                  Nenhuma atividade cadastrada. Clique em "Nova Atividade" para começar.
                </td>
              </tr>
            ) : (
              activities.map((activity) => {
                const statusColor = getStatusColor(activity.status);
                return (
                  <tr
                    key={activity.id}
                    className="border-b hover:bg-muted/30 transition-colors"
                    style={{
                      backgroundColor: activity.status ? `${statusColor}20` : undefined,
                    }}
                  >
                    {ACTIVITY_COLUMNS.map((column) => (
                      <td key={column.key} className="p-3">
                        {editingCell?.id === activity.id && editingCell?.field === column.key ? (
                          <div className="flex gap-1">
                            {column.key === 'status' ? (
                              <Select value={editValue} onValueChange={setEditValue}>
                                <SelectTrigger className="h-8">
                                  <SelectValue />
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
                            ) : (
                              <Input
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') saveEdit();
                                  if (e.key === 'Escape') cancelEdit();
                                }}
                                className="h-8"
                                autoFocus
                              />
                            )}
                            <Button
                              size="sm"
                              variant="success"
                              onClick={saveEdit}
                              className="h-8 px-2"
                            >
                              ✓
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={cancelEdit}
                              className="h-8 px-2"
                            >
                              ✗
                            </Button>
                          </div>
                        ) : (
                          <div
                            className="cursor-pointer hover:bg-accent/50 rounded px-2 py-1 min-h-[24px] flex items-center"
                            onClick={() => startEdit(activity.id!, column.key, activity[column.key as keyof Activity] as string || '')}
                          >
                            {column.key === 'status' && activity.status ? (
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: statusColor }}
                                />
                                {activity.status}
                              </div>
                            ) : (
                              activity[column.key as keyof Activity] || ''
                            )}
                          </div>
                        )}
                      </td>
                    ))}
                    <td className="p-3">
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onDeleteActivity(activity.id!)}
                          className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};