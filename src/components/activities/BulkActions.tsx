import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, CheckSquare, X } from 'lucide-react';
import { toast } from 'sonner';

interface BulkActionsProps {
  selectedCount: number;
  statuses: Array<{ id: string; name: string; color: string }>;
  onBulkStatusChange: (status: string) => void;
  onBulkDelete: () => void;
  onClearSelection: () => void;
}

export const BulkActions = ({
  selectedCount,
  statuses,
  onBulkStatusChange,
  onBulkDelete,
  onClearSelection,
}: BulkActionsProps) => {
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg animate-fade-in">
      <div className="flex items-center gap-2">
        <CheckSquare className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">{selectedCount} selecionadas</span>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <Select onValueChange={onBulkStatusChange}>
          <SelectTrigger className="w-[180px] h-8">
            <SelectValue placeholder="Alterar status..." />
          </SelectTrigger>
          <SelectContent>
            {statuses.map((status) => (
              <SelectItem key={status.id} value={status.name}>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: status.color }} />
                  {status.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          size="sm"
          variant="destructive"
          onClick={onBulkDelete}
          className="h-8"
        >
          <Trash2 className="h-3 w-3" />
          Excluir
        </Button>

        <Button
          size="sm"
          variant="ghost"
          onClick={onClearSelection}
          className="h-8"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};
