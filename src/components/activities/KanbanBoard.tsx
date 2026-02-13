import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity } from '@/types/activity';
import { Columns3 } from 'lucide-react';

interface KanbanBoardProps {
  activities: Activity[];
  statuses: Array<{ id: string; name: string; color: string }>;
  onUpdateActivity: (id: string, updates: Partial<Activity>) => void;
  getStatusColor: (statusName: string) => string;
}

export const KanbanBoard = ({ activities, statuses, onUpdateActivity, getStatusColor }: KanbanBoardProps) => {
  const columns = useMemo(() => {
    const cols: Record<string, Activity[]> = {};
    
    // Initialize columns for all statuses
    statuses.forEach(s => {
      cols[s.name] = [];
    });
    
    // Add "Sem Status" column
    cols['Sem Status'] = [];

    // Distribute activities
    activities.forEach(activity => {
      const status = activity.status || 'Sem Status';
      if (!cols[status]) {
        cols[status] = [];
      }
      cols[status].push(activity);
    });

    return cols;
  }, [activities, statuses]);

  const moveActivity = (activityId: string, newStatus: string) => {
    onUpdateActivity(activityId, { status: newStatus });
  };

  return (
    <div className="h-full flex flex-col animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Columns3 className="h-5 w-5" />
        <h2 className="text-lg font-semibold">Kanban Board</h2>
        <Badge variant="secondary">{activities.length} atividades</Badge>
      </div>

      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-4 min-h-[500px] pb-4" style={{ minWidth: `${Object.keys(columns).length * 300}px` }}>
          {Object.entries(columns).map(([statusName, columnActivities]) => {
            const color = getStatusColor(statusName);
            return (
              <div
                key={statusName}
                className="flex-1 min-w-[280px] max-w-[320px] flex flex-col rounded-xl bg-muted/30 border"
              >
                {/* Column Header */}
                <div
                  className="p-3 rounded-t-xl flex items-center justify-between"
                  style={{ backgroundColor: `${color}20`, borderBottom: `3px solid ${color}` }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                    <span className="font-semibold text-sm">{statusName}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {columnActivities.length}
                  </Badge>
                </div>

                {/* Cards */}
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                  {columnActivities.length === 0 ? (
                    <p className="text-center text-muted-foreground text-xs py-8">
                      Nenhuma atividade
                    </p>
                  ) : (
                    columnActivities.map((activity) => (
                      <Card
                        key={activity.id}
                        className="shadow-soft hover-scale cursor-default animate-scale-in"
                      >
                        <CardContent className="p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">{activity.data}</span>
                            <Badge variant="outline" className="text-xs">{activity.hora}</Badge>
                          </div>
                          
                          <p className="font-medium text-sm truncate" title={activity.atividade}>
                            {activity.atividade || 'Sem descrição'}
                          </p>
                          
                          {activity.obra && (
                            <p className="text-xs text-muted-foreground truncate">
                              🏗️ {activity.obra}
                            </p>
                          )}
                          
                          {activity.equipe && (
                            <p className="text-xs text-muted-foreground truncate">
                              👥 {activity.equipe}
                            </p>
                          )}

                          {activity.cidade && (
                            <p className="text-xs text-muted-foreground truncate">
                              📍 {activity.cidade}
                            </p>
                          )}

                          {/* Move to status */}
                          <Select
                            value={activity.status}
                            onValueChange={(value) => moveActivity(activity.id!, value)}
                          >
                            <SelectTrigger className="h-7 text-xs">
                              <SelectValue placeholder="Mover para..." />
                            </SelectTrigger>
                            <SelectContent>
                              {statuses.map((s) => (
                                <SelectItem key={s.id} value={s.name}>
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                                    {s.name}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};