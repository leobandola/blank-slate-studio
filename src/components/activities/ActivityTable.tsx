import { useState } from 'react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Activity, ACTIVITY_COLUMNS } from '@/types/activity';
import { Edit, Trash2, Plus, FileSpreadsheet, Copy, ChevronUp, ChevronDown, CopyPlus } from 'lucide-react';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ActivityTableProps {
  activities: Activity[];
  statuses: Array<{ id: string; name: string; color: string }>;
  onUpdateActivity: (id: string, updates: Partial<Activity>) => void;
  onDeleteActivity: (id: string) => void;
  onAddActivity: () => void;
  onDuplicateActivity?: (activity: Activity) => void;
  getStatusColor: (statusName: string) => string;
}

export const ActivityTable = ({
  activities,
  statuses,
  onUpdateActivity,
  onDeleteActivity,
  onAddActivity,
  onDuplicateActivity,
  getStatusColor,
}: ActivityTableProps) => {
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

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

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedActivities = React.useMemo(() => {
    if (!sortConfig) return activities;

    return [...activities].sort((a, b) => {
      const aValue = a[sortConfig.key as keyof Activity] || '';
      const bValue = b[sortConfig.key as keyof Activity] || '';
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [activities, sortConfig]);

  const exportFilteredActivities = () => {
    if (activities.length === 0) {
      toast.error('Nenhuma atividade para exportar');
      return;
    }

    // Create worksheet data
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
    
    // Define cell styles
    if (!worksheet['!rows']) worksheet['!rows'] = [];
    if (!worksheet['!cols']) worksheet['!cols'] = [];
    
    // Set column widths
    worksheet['!cols'] = [
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

    // Apply styles to all cells
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    
    // Style header row
    for (let col = 0; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ c: col, r: 0 });
      if (!worksheet[cellAddress]) continue;
      worksheet[cellAddress].s = {
        font: { bold: true, color: { rgb: "000000" } },
        fill: { fgColor: { rgb: "D3D3D3" } },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } }
        }
      };
    }
    
    // Style data rows
    for (let row = 1; row <= range.e.r; row++) {
      const activity = activities[row - 1];
      if (!activity) continue;
      
      const statusColor = activity.status ? getStatusColor(activity.status) : '#FFFFFF';
      const statusColorHex = statusColor.replace('#', '');
      
      // Calculate if we need light or dark text based on background
      const rgb = parseInt(statusColorHex, 16);
      const r = (rgb >> 16) & 255;
      const g = (rgb >> 8) & 255;
      const b = rgb & 255;
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      const textColor = brightness > 128 ? "000000" : "FFFFFF";
      
      for (let col = 0; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ c: col, r: row });
        if (!worksheet[cellAddress]) continue;
        
        worksheet[cellAddress].s = {
          font: { color: { rgb: textColor } },
          fill: { fgColor: { rgb: statusColorHex } },
          alignment: { vertical: "center" },
          border: {
            top: { style: "thin", color: { rgb: "000000" } },
            bottom: { style: "thin", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "000000" } },
            right: { style: "thin", color: { rgb: "000000" } }
          }
        };
      }
    }

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
    htmlTable += '<tr style="background-color: #D3D3D3; font-weight: bold; text-align: center;">';
    headers.forEach(header => {
      htmlTable += `<td style="border: 1px solid #000; padding: 4px; background-color: #D3D3D3; font-weight: bold;">${header}</td>`;
    });
    htmlTable += '</tr>';
    
    // Data rows
    activities.forEach((activity) => {
      const statusColor = activity.status ? getStatusColor(activity.status) : '#FFFFFF';
      
      // Calculate text color based on background brightness
      const rgb = parseInt(statusColor.replace('#', ''), 16);
      const r = (rgb >> 16) & 255;
      const g = (rgb >> 8) & 255;
      const b = rgb & 255;
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      const textColor = brightness > 128 ? '#000000' : '#FFFFFF';
      
      htmlTable += `<tr style="background-color: ${statusColor}; color: ${textColor};">`;
      
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
      
      values.forEach((value) => {
        htmlTable += `<td style="border: 1px solid #000; padding: 4px; background-color: ${statusColor}; color: ${textColor};">${value || ''}</td>`;
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
      toast.success(`${activities.length} atividades copiadas com formatação completa`);
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
    <div className="h-full flex flex-col">
      <Card className="flex-1 flex flex-col overflow-hidden shadow-medium">
        <div className="p-4 border-b bg-gradient-secondary flex-shrink-0">
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

        <div className="flex-1 overflow-auto">
          <table className="w-full">
            <thead className="sticky top-0 z-10">
              <tr className="border-b bg-muted/50">
                {ACTIVITY_COLUMNS.map((column) => (
                  <th
                    key={column.key}
                    className="text-left p-3 font-medium text-sm bg-muted/50 cursor-pointer hover:bg-muted/70 transition-colors select-none"
                    style={{ minWidth: column.width }}
                    onClick={() => handleSort(column.key)}
                  >
                    <div className="flex items-center justify-between">
                      <span>{column.label}</span>
                      <div className="flex flex-col">
                        <ChevronUp 
                          className={`h-3 w-3 ${
                            sortConfig?.key === column.key && sortConfig.direction === 'asc' 
                              ? 'text-primary' 
                              : 'text-muted-foreground/50'
                          }`} 
                        />
                        <ChevronDown 
                          className={`h-3 w-3 -mt-1 ${
                            sortConfig?.key === column.key && sortConfig.direction === 'desc' 
                              ? 'text-primary' 
                              : 'text-muted-foreground/50'
                          }`} 
                        />
                      </div>
                    </div>
                  </th>
                ))}
                <th className="text-left p-3 font-medium text-sm w-24 bg-muted/50">AÇÕES</th>
              </tr>
            </thead>
            <tbody>
              {sortedActivities.length === 0 ? (
                <tr>
                  <td
                    colSpan={ACTIVITY_COLUMNS.length + 1}
                    className="text-center p-8 text-muted-foreground"
                  >
                    Nenhuma atividade cadastrada. Clique em "Nova Atividade" para começar.
                  </td>
                </tr>
              ) : (
                sortedActivities.map((activity) => {
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
                          {onDuplicateActivity && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onDuplicateActivity(activity)}
                              className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                              title="Duplicar atividade"
                            >
                              <CopyPlus className="h-4 w-4" />
                            </Button>
                          )}
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
    </div>
  );
};