import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Plus, Trash2, ListChecks } from 'lucide-react';
import { toast } from 'sonner';

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  sort_order: number;
}

interface SubtaskChecklistProps {
  activityId: string;
}

export const SubtaskChecklist = ({ activityId }: SubtaskChecklistProps) => {
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubtasks();
  }, [activityId]);

  const loadSubtasks = async () => {
    const { data, error } = await supabase
      .from('subtasks')
      .select('*')
      .eq('activity_id', activityId)
      .order('sort_order', { ascending: true });

    if (!error && data) {
      setSubtasks(data.map(s => ({
        id: s.id,
        title: s.title,
        completed: s.completed,
        sort_order: s.sort_order,
      })));
    }
    setLoading(false);
  };

  const addSubtask = async () => {
    if (!newTitle.trim()) return;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('subtasks')
      .insert({
        activity_id: activityId,
        user_id: user.id,
        title: newTitle.trim(),
        sort_order: subtasks.length,
      })
      .select()
      .single();

    if (!error && data) {
      setSubtasks(prev => [...prev, {
        id: data.id,
        title: data.title,
        completed: data.completed,
        sort_order: data.sort_order,
      }]);
      setNewTitle('');
    } else {
      toast.error('Erro ao adicionar subtarefa');
    }
  };

  const toggleSubtask = async (id: string, completed: boolean) => {
    const { error } = await supabase
      .from('subtasks')
      .update({ completed: !completed })
      .eq('id', id);

    if (!error) {
      setSubtasks(prev =>
        prev.map(s => s.id === id ? { ...s, completed: !completed } : s)
      );
    }
  };

  const deleteSubtask = async (id: string) => {
    const { error } = await supabase
      .from('subtasks')
      .delete()
      .eq('id', id);

    if (!error) {
      setSubtasks(prev => prev.filter(s => s.id !== id));
    }
  };

  const completedCount = subtasks.filter(s => s.completed).length;
  const progress = subtasks.length > 0 ? (completedCount / subtasks.length) * 100 : 0;

  if (loading) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <ListChecks className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">
          Subtarefas ({completedCount}/{subtasks.length})
        </span>
      </div>

      {subtasks.length > 0 && (
        <Progress value={progress} className="h-1.5" />
      )}

      <div className="space-y-1.5">
        {subtasks.map((subtask) => (
          <div
            key={subtask.id}
            className="flex items-center gap-2 group rounded-md px-2 py-1.5 hover:bg-muted/50 transition-colors"
          >
            <Checkbox
              checked={subtask.completed}
              onCheckedChange={() => toggleSubtask(subtask.id, subtask.completed)}
            />
            <span className={`flex-1 text-sm ${subtask.completed ? 'line-through text-muted-foreground' : ''}`}>
              {subtask.title}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => deleteSubtask(subtask.id)}
            >
              <Trash2 className="h-3 w-3 text-destructive" />
            </Button>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Nova subtarefa..."
          className="h-8 text-sm"
          onKeyDown={(e) => e.key === 'Enter' && addSubtask()}
        />
        <Button size="sm" variant="outline" className="h-8 px-2" onClick={addSubtask}>
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};
