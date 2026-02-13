import { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity } from '@/types/activity';
import { Columns3, AlertTriangle, Clock, GripVertical } from 'lucide-react';
import { TagDisplay } from '@/components/tags/TagManager';
import { isBefore, startOfDay, addDays } from 'date-fns';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core';
import { useDraggable } from '@dnd-kit/core';

interface KanbanBoardProps {
  activities: Activity[];
  statuses: Array<{ id: string; name: string; color: string }>;
  onUpdateActivity: (id: string, updates: Partial<Activity>) => void;
  getStatusColor: (statusName: string) => string;
}

const DraggableCard = ({ activity, color }: { activity: Activity; color: string }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: activity.id!,
    data: { activity },
  });

  const now = startOfDay(new Date());
  const isOverdue = activity.prazo &&
    activity.status !== 'CONCLUÍDO' && activity.status !== 'CANCELADO' &&
    isBefore(new Date(activity.prazo), now);
  const isDueSoon = activity.prazo &&
    activity.status !== 'CONCLUÍDO' && activity.status !== 'CANCELADO' &&
    !isBefore(new Date(activity.prazo), now) &&
    isBefore(new Date(activity.prazo), addDays(now, 3));

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 50,
  } : undefined;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`shadow-soft hover-scale cursor-grab active:cursor-grabbing animate-scale-in transition-shadow duration-200 ${
        isDragging ? 'opacity-50 shadow-large' : ''
      } ${isOverdue ? 'ring-2 ring-destructive/50' : isDueSoon ? 'ring-1 ring-status-pendente/50' : ''}`}
      {...attributes}
      {...listeners}
    >
      <CardContent className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{activity.data}</span>
          <div className="flex items-center gap-1">
            <Badge variant="outline" className="text-xs">{activity.hora}</Badge>
            <GripVertical className="h-3 w-3 text-muted-foreground/50" />
          </div>
        </div>

        <p className="font-medium text-sm truncate" title={activity.atividade}>
          {activity.atividade || 'Sem descrição'}
        </p>

        {activity.obra && (
          <p className="text-xs text-muted-foreground truncate">🏗️ {activity.obra}</p>
        )}
        {activity.equipe && (
          <p className="text-xs text-muted-foreground truncate">👥 {activity.equipe}</p>
        )}
        {activity.cidade && (
          <p className="text-xs text-muted-foreground truncate">📍 {activity.cidade}</p>
        )}

        {isOverdue && (
          <div className="flex items-center gap-1 text-destructive text-xs animate-pulse">
            <AlertTriangle className="h-3 w-3" />
            <span>Atrasada! Prazo: {activity.prazo}</span>
          </div>
        )}
        {isDueSoon && (
          <div className="flex items-center gap-1 text-status-pendente text-xs">
            <Clock className="h-3 w-3" />
            <span>Prazo: {activity.prazo}</span>
          </div>
        )}

        {activity.tags && activity.tags.length > 0 && (
          <TagDisplay tags={activity.tags} />
        )}
      </CardContent>
    </Card>
  );
};

const DroppableColumn = ({
  statusName,
  color,
  children,
  count,
}: {
  statusName: string;
  color: string;
  children: React.ReactNode;
  count: number;
}) => {
  const { setNodeRef, isOver } = useDroppable({ id: statusName });

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 min-w-[280px] max-w-[320px] flex flex-col rounded-xl border transition-all duration-200 ${
        isOver ? 'bg-primary/5 ring-2 ring-primary/30 scale-[1.01]' : 'bg-muted/30'
      }`}
    >
      <div
        className="p-3 rounded-t-xl flex items-center justify-between"
        style={{ backgroundColor: `${color}20`, borderBottom: `3px solid ${color}` }}
      >
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
          <span className="font-semibold text-sm">{statusName}</span>
        </div>
        <Badge variant="secondary" className="text-xs">{count}</Badge>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2 min-h-[100px]">
        {children}
      </div>
    </div>
  );
};

export const KanbanBoard = ({ activities, statuses, onUpdateActivity, getStatusColor }: KanbanBoardProps) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const columns = useMemo(() => {
    const cols: Record<string, Activity[]> = {};
    statuses.forEach(s => { cols[s.name] = []; });
    cols['Sem Status'] = [];
    activities.forEach(activity => {
      const status = activity.status || 'Sem Status';
      if (!cols[status]) cols[status] = [];
      cols[status].push(activity);
    });
    return cols;
  }, [activities, statuses]);

  const activeActivity = activeId ? activities.find(a => a.id === activeId) : null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const activityId = active.id as string;
    const newStatus = over.id as string;
    const activity = activities.find(a => a.id === activityId);

    if (activity && activity.status !== newStatus) {
      onUpdateActivity(activityId, { status: newStatus });
    }
  };

  return (
    <div className="h-full flex flex-col animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Columns3 className="h-5 w-5" />
        <h2 className="text-lg font-semibold">Kanban Board</h2>
        <Badge variant="secondary">{activities.length} atividades</Badge>
        <span className="text-xs text-muted-foreground ml-2">Arraste os cards para mover</span>
      </div>

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex-1 overflow-x-auto">
          <div className="flex gap-4 min-h-[500px] pb-4" style={{ minWidth: `${Object.keys(columns).length * 300}px` }}>
            {Object.entries(columns).map(([statusName, columnActivities]) => {
              const color = getStatusColor(statusName);
              return (
                <DroppableColumn key={statusName} statusName={statusName} color={color} count={columnActivities.length}>
                  {columnActivities.length === 0 ? (
                    <p className="text-center text-muted-foreground text-xs py-8">
                      Solte aqui
                    </p>
                  ) : (
                    columnActivities.map((activity) => (
                      <DraggableCard key={activity.id} activity={activity} color={color} />
                    ))
                  )}
                </DroppableColumn>
              );
            })}
          </div>
        </div>

        <DragOverlay>
          {activeActivity && (
            <Card className="shadow-large w-[280px] rotate-2 opacity-90">
              <CardContent className="p-3 space-y-2">
                <p className="font-medium text-sm truncate">{activeActivity.atividade || 'Sem descrição'}</p>
                {activeActivity.obra && (
                  <p className="text-xs text-muted-foreground">🏗️ {activeActivity.obra}</p>
                )}
              </CardContent>
            </Card>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
};
