import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Activity, ACTIVITY_COLUMNS } from '@/types/activity';
import { Edit, Trash2, Plus } from 'lucide-react';
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

  return (
    <Card className="w-full overflow-hidden shadow-medium">
      <div className="p-4 border-b bg-gradient-secondary">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Lista de Atividades</h2>
          <Button onClick={onAddActivity} size="sm" variant="hero">
            <Plus className="h-4 w-4" />
            Nova Atividade
          </Button>
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
                      backgroundColor: activity.status ? `${statusColor}10` : undefined,
                      borderLeft: activity.status ? `4px solid ${statusColor}` : undefined,
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