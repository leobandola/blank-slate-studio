import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Calendar, Filter, Clock, Layers } from 'lucide-react';
import { Activity } from '@/types/activity';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, parseISO, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DateViewProps {
  activities: Activity[];
  onFilter: (filteredActivities: Activity[]) => void;
}

type ViewPeriod = 'day' | 'week' | 'month' | 'year';

export function DateView({ activities, onFilter }: DateViewProps) {
  const [viewPeriod, setViewPeriod] = useState<ViewPeriod>('day');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const getFilteredActivities = useMemo(() => {
    const referenceDate = parseISO(selectedDate);
    
    return activities.filter(activity => {
      if (!activity.data) return false;
      
      try {
        const activityDate = parseISO(activity.data);
        
        switch (viewPeriod) {
          case 'day':
            return format(activityDate, 'yyyy-MM-dd') === selectedDate;
          
          case 'week':
            const weekStart = startOfWeek(referenceDate, { weekStartsOn: 1 }); // Segunda-feira
            const weekEnd = endOfWeek(referenceDate, { weekStartsOn: 1 });
            return isWithinInterval(activityDate, { start: weekStart, end: weekEnd });
          
          case 'month':
            const monthStart = startOfMonth(referenceDate);
            const monthEnd = endOfMonth(referenceDate);
            return isWithinInterval(activityDate, { start: monthStart, end: monthEnd });
          
          case 'year':
            const yearStart = startOfYear(referenceDate);
            const yearEnd = endOfYear(referenceDate);
            return isWithinInterval(activityDate, { start: yearStart, end: yearEnd });
          
          default:
            return true;
        }
      } catch (error) {
        console.error('Error parsing date:', activity.data, error);
        return false;
      }
    });
  }, [activities, viewPeriod, selectedDate]);

  // Group activities by date for better visualization
  const groupedActivities = useMemo(() => {
    const groups: Record<string, Activity[]> = {};
    
    getFilteredActivities.forEach(activity => {
      if (!activity.data) return;
      
      try {
        const activityDate = parseISO(activity.data);
        const dateKey = format(activityDate, 'yyyy-MM-dd');
        
        if (!groups[dateKey]) {
          groups[dateKey] = [];
        }
        groups[dateKey].push(activity);
      } catch (error) {
        console.error('Error grouping activity by date:', activity.data, error);
      }
    });
    
    // Sort dates
    const sortedDates = Object.keys(groups).sort();
    const sortedGroups: Record<string, Activity[]> = {};
    sortedDates.forEach(date => {
      sortedGroups[date] = groups[date];
    });
    
    return sortedGroups;
  }, [getFilteredActivities]);

  const handleApplyFilter = () => {
    onFilter(getFilteredActivities);
  };

  const getDateLabel = () => {
    const referenceDate = parseISO(selectedDate);
    
    switch (viewPeriod) {
      case 'day':
        return format(referenceDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
      case 'week':
        const weekStart = startOfWeek(referenceDate, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(referenceDate, { weekStartsOn: 1 });
        return `${format(weekStart, "dd/MM", { locale: ptBR })} - ${format(weekEnd, "dd/MM/yyyy", { locale: ptBR })}`;
      case 'month':
        return format(referenceDate, "MMMM 'de' yyyy", { locale: ptBR });
      case 'year':
        return format(referenceDate, "yyyy", { locale: ptBR });
      default:
        return '';
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Visualização por Período
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <Label htmlFor="view-period">Período</Label>
            <Select value={viewPeriod} onValueChange={(value: ViewPeriod) => setViewPeriod(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Dia
                  </div>
                </SelectItem>
                <SelectItem value="week">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Semana
                  </div>
                </SelectItem>
                <SelectItem value="month">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4" />
                    Mês
                  </div>
                </SelectItem>
                <SelectItem value="year">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Ano
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="selected-date">Data de Referência</Label>
            <input
              id="selected-date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="flex items-end">
            <Button onClick={handleApplyFilter} className="w-full">
              <Filter className="h-4 w-4 mr-2" />
              Aplicar Filtro
            </Button>
          </div>
        </div>

        <div className="text-sm text-muted-foreground mb-4">
          <strong>Período selecionado:</strong> {getDateLabel()}
          <br />
          <strong>Total de atividades:</strong> {getFilteredActivities.length}
        </div>

        {Object.keys(groupedActivities).length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">Atividades por Data:</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {Object.entries(groupedActivities).map(([date, dayActivities]) => (
                <div key={date} className="flex justify-between items-center p-2 bg-muted/50 rounded-lg">
                  <span className="font-medium">
                    {format(parseISO(date), "dd/MM/yyyy", { locale: ptBR })}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {dayActivities.length} atividade{dayActivities.length !== 1 ? 's' : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}