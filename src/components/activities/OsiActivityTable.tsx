import React, { useState } from 'react';
import { OsiActivity, OSI_ACTIVITY_COLUMNS } from '@/types/osiActivity';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Copy, Download, Plus } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

interface OsiActivityTableProps {
  activities: OsiActivity[];
  onUpdateActivity: (id: string, updates: Partial<OsiActivity>) => void;
  onDeleteActivity: (id: string) => void;
  onAddActivity: () => void;
}

export const OsiActivityTable: React.FC<OsiActivityTableProps> = ({
  activities,
  onUpdateActivity,
  onDeleteActivity,
  onAddActivity
}) => {
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
      XLSX.utils.book_append_sheet(wb, ws, 'Atividades OSI');

      const fileName = `atividades_osi_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);

      toast.success('Atividades OSI exportadas com sucesso');
    } catch (error) {
      console.error('Error exporting OSI activities:', error);
      toast.error('Erro ao exportar atividades OSI');
    }
  };

  const copyWithColors = async () => {
    if (activities.length === 0) {
      toast.error('Nenhuma atividade OSI para copiar');
      return;
    }

    try {
      const headers = OSI_ACTIVITY_COLUMNS.map(col => col.label).join('\t');
      const rows = activities.map(activity =>
        OSI_ACTIVITY_COLUMNS.map(col => {
          const value = activity[col.key as keyof OsiActivity] || '';
          return String(value);
        }).join('\t')
      );

      const textContent = [headers, ...rows].join('\n');

      // Create HTML table for rich formatting
      const htmlContent = `
        <table>
          <thead>
            <tr>${OSI_ACTIVITY_COLUMNS.map(col => `<th>${col.label}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${activities.map(activity => `
              <tr>
                ${OSI_ACTIVITY_COLUMNS.map(col => {
                  const value = activity[col.key as keyof OsiActivity] || '';
                  return `<td>${String(value)}</td>`;
                }).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;

      if (navigator.clipboard && window.ClipboardItem) {
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const textBlob = new Blob([textContent], { type: 'text/plain' });
        
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/html': blob,
            'text/plain': textBlob
          })
        ]);
      } else {
        await navigator.clipboard.writeText(textContent);
      }

      toast.success('Tabela copiada para a área de transferência');
    } catch (error) {
      console.error('Error copying table:', error);
      toast.error('Erro ao copiar tabela');
    }
  };

  if (activities.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Atividades OSI</CardTitle>
          <Button onClick={onAddActivity} className="gap-2">
            <Plus className="h-4 w-4" />
            Adicionar OSI
          </Button>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Nenhuma atividade OSI encontrada</p>
            <Button onClick={onAddActivity} variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Adicionar primeira atividade OSI
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Atividades OSI ({activities.length})</CardTitle>
        <div className="flex gap-2">
          <Button onClick={copyWithColors} variant="outline" size="sm" className="gap-2">
            <Copy className="h-4 w-4" />
            Copiar
          </Button>
          <Button onClick={exportFilteredActivities} variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
          <Button onClick={onAddActivity} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Adicionar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[600px] overflow-auto border rounded-lg">
          <Table>
            <TableHeader className="sticky top-0 bg-background border-b z-10">
              <TableRow>
                {OSI_ACTIVITY_COLUMNS.map((column) => (
                  <TableHead 
                    key={column.key} 
                    className="font-semibold text-center border-r last:border-r-0"
                    style={{ minWidth: column.width }}
                  >
                    {column.label}
                  </TableHead>
                ))}
                <TableHead className="w-16 text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities.map((activity) => (
                <TableRow key={activity.id} className="hover:bg-muted/50">
                  {OSI_ACTIVITY_COLUMNS.map((column) => {
                    const value = activity[column.key as keyof OsiActivity] || '';
                    const isEditing = editingCell?.id === activity.id && editingCell?.field === column.key;
                    
                    return (
                      <TableCell 
                        key={column.key} 
                        className="border-r last:border-r-0 p-2"
                        style={{ minWidth: column.width }}
                      >
                        {isEditing ? (
                          <div className="flex flex-col gap-1">
                            {column.key === 'atividade' || column.key === 'obs' ? (
                              <Textarea
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="w-full min-h-[60px]"
                                autoFocus
                              />
                            ) : (
                              <Input
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="w-full"
                                autoFocus
                              />
                            )}
                            <div className="flex gap-1">
                              <Button size="sm" onClick={saveEdit} className="h-6 px-2 text-xs">
                                Salvar
                              </Button>
                              <Button size="sm" variant="outline" onClick={cancelEdit} className="h-6 px-2 text-xs">
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div
                            className="cursor-pointer hover:bg-muted/30 p-1 rounded min-h-[2rem] flex items-start"
                            onClick={() => startEdit(activity.id!, column.key, String(value))}
                          >
                            <span className="break-words text-sm leading-relaxed">
                              {String(value)}
                            </span>
                          </div>
                        )}
                      </TableCell>
                    );
                  })}
                  <TableCell className="w-16 text-center p-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteActivity(activity.id!)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};