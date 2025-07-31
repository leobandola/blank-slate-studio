import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ActivityStatus } from '@/types/activity';
import { Plus, Edit, Trash2, Palette } from 'lucide-react';

interface StatusManagerProps {
  statuses: ActivityStatus[];
  onAddStatus: (status: Omit<ActivityStatus, 'id'>) => void;
  onUpdateStatus: (id: string, updates: Partial<ActivityStatus>) => void;
  onDeleteStatus: (id: string) => void;
}

export const StatusManager = ({ statuses, onAddStatus, onUpdateStatus, onDeleteStatus }: StatusManagerProps) => {
  const [newStatus, setNewStatus] = useState({ name: '', color: '#3b82f6' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ name: '', color: '' });

  const handleAddStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (newStatus.name.trim()) {
      onAddStatus(newStatus);
      setNewStatus({ name: '', color: '#3b82f6' });
    }
  };

  const startEdit = (status: ActivityStatus) => {
    setEditingId(status.id);
    setEditData({ name: status.name, color: status.color });
  };

  const saveEdit = () => {
    if (editingId && editData.name.trim()) {
      onUpdateStatus(editingId, editData);
      setEditingId(null);
      setEditData({ name: '', color: '' });
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({ name: '', color: '' });
  };

  const PRESET_COLORS = [
    '#16a34a', '#dc2626', '#eab308', '#3b82f6', '#8b5cf6',
    '#f97316', '#06b6d4', '#84cc16', '#ec4899', '#64748b'
  ];

  return (
    <div className="space-y-6">
      <Card className="shadow-medium">
        <CardHeader className="bg-gradient-secondary">
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Adicionar Novo Status
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleAddStatus} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="statusName">Nome do Status</Label>
                <Input
                  id="statusName"
                  value={newStatus.name}
                  onChange={(e) => setNewStatus({ ...newStatus, name: e.target.value })}
                  placeholder="Digite o nome do status"
                  required
                />
              </div>
              <div>
                <Label htmlFor="statusColor">Cor</Label>
                <div className="flex gap-2">
                  <Input
                    id="statusColor"
                    type="color"
                    value={newStatus.color}
                    onChange={(e) => setNewStatus({ ...newStatus, color: e.target.value })}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={newStatus.color}
                    onChange={(e) => setNewStatus({ ...newStatus, color: e.target.value })}
                    placeholder="#ffffff"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <Label>Cores Predefinidas</Label>
              <div className="flex gap-2 mt-2 flex-wrap">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className="w-8 h-8 rounded border-2 border-gray-200 hover:border-gray-400 transition-colors"
                    style={{ backgroundColor: color }}
                    onClick={() => setNewStatus({ ...newStatus, color })}
                  />
                ))}
              </div>
            </div>

            <Button type="submit" variant="hero">
              <Plus className="h-4 w-4" />
              Adicionar Status
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="shadow-medium">
        <CardHeader className="bg-gradient-secondary">
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Status Existentes
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            {statuses.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Nenhum status cadastrado. Adicione um status acima.
              </p>
            ) : (
              statuses.map((status) => (
                <div
                  key={status.id}
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/30 transition-colors"
                  style={{
                    borderLeft: `4px solid ${status.color}`,
                    backgroundColor: `${status.color}08`,
                  }}
                >
                  {editingId === status.id ? (
                    <>
                      <div
                        className="w-6 h-6 rounded-full border"
                        style={{ backgroundColor: editData.color }}
                      />
                      <Input
                        value={editData.name}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        className="flex-1"
                      />
                      <Input
                        type="color"
                        value={editData.color}
                        onChange={(e) => setEditData({ ...editData, color: e.target.value })}
                        className="w-12 h-8 p-1"
                      />
                      <Button size="sm" variant="success" onClick={saveEdit}>
                        ✓
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelEdit}>
                        ✗
                      </Button>
                    </>
                  ) : (
                    <>
                      <div
                        className="w-6 h-6 rounded-full"
                        style={{ backgroundColor: status.color }}
                      />
                      <span className="flex-1 font-medium">{status.name}</span>
                      <span className="text-sm text-muted-foreground">{status.color}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => startEdit(status)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDeleteStatus(status.id)}
                        className="hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};