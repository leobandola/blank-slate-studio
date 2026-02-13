import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { Activity } from '@/types/activity';
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, format, isSameMonth, isToday,
  addMonths, subMonths, isSameDay,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CalendarViewProps {
  activities: Activity[];
  getStatusColor: (status: string) => string;
  onSelectActivity?: (activity: Activity) => void;
}

export const CalendarView = ({ activities, getStatusColor, onSelectActivity }: CalendarViewProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentMonth]);

  const activityMap = useMemo(() => {
    const map: Record<string, Activity[]> = {};
    activities.forEach(a => {
      if (!map[a.data]) map[a.data] = [];
      map[a.data].push(a);
    });
    return map;
  }, [activities]);

  const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  return (
    <div className="space-y-4 animate-fade-in">
      <Card className="shadow-medium">
        <CardHeader className="bg-gradient-secondary">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Calendário
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-[140px] text-center capitalize">
                {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
              </span>
              <Button variant="outline" size="sm" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(new Date())}>
                Hoje
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          {/* Week header */}
          <div className="grid grid-cols-7 mb-1">
            {weekDays.map(day => (
              <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
            {calendarDays.map((day, idx) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const dayActivities = activityMap[dateStr] || [];
              const inMonth = isSameMonth(day, currentMonth);
              const today = isToday(day);

              return (
                <div
                  key={idx}
                  className={`min-h-[80px] p-1 bg-card transition-colors ${
                    !inMonth ? 'opacity-30' : ''
                  } ${today ? 'ring-2 ring-primary ring-inset' : ''}`}
                >
                  <div className={`text-xs font-medium mb-1 ${today ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-0.5">
                    {dayActivities.slice(0, 3).map((activity, aIdx) => (
                      <Popover key={aIdx}>
                        <PopoverTrigger asChild>
                          <button
                            className="w-full text-left text-[10px] px-1 py-0.5 rounded truncate hover:opacity-80 transition-opacity"
                            style={{
                              backgroundColor: `${getStatusColor(activity.status)}20`,
                              color: getStatusColor(activity.status),
                              borderLeft: `2px solid ${getStatusColor(activity.status)}`,
                            }}
                          >
                            {activity.atividade || activity.obra}
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 p-3" side="right">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-sm">{activity.atividade}</h4>
                              <Badge
                                variant="outline"
                                className="text-[10px]"
                                style={{ borderColor: getStatusColor(activity.status), color: getStatusColor(activity.status) }}
                              >
                                {activity.status}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground space-y-1">
                              <p><strong>Obra:</strong> {activity.obra}</p>
                              <p><strong>Site:</strong> {activity.site}</p>
                              <p><strong>Equipe:</strong> {activity.equipe}</p>
                              <p><strong>Hora:</strong> {activity.hora}</p>
                              {activity.prazo && <p><strong>Prazo:</strong> {activity.prazo}</p>}
                              {activity.observacao && <p><strong>Obs:</strong> {activity.observacao}</p>}
                            </div>
                            {onSelectActivity && (
                              <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => onSelectActivity(activity)}>
                                Ver Detalhes
                              </Button>
                            )}
                          </div>
                        </PopoverContent>
                      </Popover>
                    ))}
                    {dayActivities.length > 3 && (
                      <p className="text-[10px] text-muted-foreground text-center">
                        +{dayActivities.length - 3} mais
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-3 px-2 text-xs text-muted-foreground">
            <span>Total no mês: <strong className="text-foreground">
              {activities.filter(a => {
                const d = new Date(a.data);
                return isSameMonth(d, currentMonth);
              }).length}
            </strong></span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
