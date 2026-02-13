import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Activity } from '@/types/activity';
import { OsiActivity } from '@/types/osiActivity';
import { CalendarDays, CheckCircle2, Clock, AlertTriangle, TrendingUp, Users, Zap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { format, subDays, startOfDay, isBefore, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DashboardProps {
  activities: Activity[];
  osiActivities: OsiActivity[];
  statuses: Array<{ id: string; name: string; color: string }>;
  getStatusColor: (statusName: string) => string;
}

export const Dashboard = ({ activities, osiActivities, statuses, getStatusColor }: DashboardProps) => {
  const today = new Date().toISOString().split('T')[0];

  const todayActivities = useMemo(() =>
    activities.filter(a => a.data === today), [activities, today]);

  const pendingActivities = useMemo(() =>
    activities.filter(a => a.status === 'PENDENTE'), [activities]);

  const completedActivities = useMemo(() =>
    activities.filter(a => a.status === 'CONCLUÍDO'), [activities]);

  const todayOsi = useMemo(() =>
    osiActivities.filter(a => a.data === today), [osiActivities, today]);

  const overdueActivities = useMemo(() =>
    activities.filter(a => {
      if (!a.prazo || a.status === 'CONCLUÍDO' || a.status === 'CANCELADO') return false;
      return isBefore(new Date(a.prazo), startOfDay(new Date()));
    }), [activities]);

  const dueSoonActivities = useMemo(() =>
    activities.filter(a => {
      if (!a.prazo || a.status === 'CONCLUÍDO' || a.status === 'CANCELADO') return false;
      const prazoDate = new Date(a.prazo);
      const now = startOfDay(new Date());
      return !isBefore(prazoDate, now) && isBefore(prazoDate, addDays(now, 3));
    }), [activities]);

  const completionRate = useMemo(() =>
    activities.length > 0 ? Math.round((completedActivities.length / activities.length) * 100) : 0,
    [activities, completedActivities]);

  const statusChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    activities.forEach(a => {
      const key = a.status || 'Sem status';
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({
      name, value, color: getStatusColor(name),
    }));
  }, [activities, getStatusColor]);

  const trendData = useMemo(() => {
    const days = [];
    for (let i = 13; i >= 0; i--) {
      const date = subDays(startOfDay(new Date()), i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const count = activities.filter(a => a.data === dateStr).length;
      const osiCount = osiActivities.filter(a => a.data === dateStr).length;
      days.push({
        date: format(date, 'dd/MM', { locale: ptBR }),
        atividades: count,
        osi: osiCount,
      });
    }
    return days;
  }, [activities, osiActivities]);

  const teamData = useMemo(() => {
    const counts: Record<string, number> = {};
    activities.forEach(a => {
      const key = a.equipe || 'Não informado';
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([name, value]) => ({ name, value }));
  }, [activities]);

  const kpiCards = [
    { title: 'Atividades Hoje', value: todayActivities.length, icon: CalendarDays, color: 'text-primary', bgColor: 'bg-primary/10' },
    { title: 'Pendentes', value: pendingActivities.length, icon: Clock, color: 'text-status-pendente', bgColor: 'bg-status-pendente/10' },
    { title: 'Atrasadas', value: overdueActivities.length, icon: AlertTriangle, color: 'text-destructive', bgColor: 'bg-destructive/10', pulse: overdueActivities.length > 0 },
    { title: 'Concluídas', value: completedActivities.length, icon: CheckCircle2, color: 'text-status-ativo', bgColor: 'bg-status-ativo/10' },
    { title: 'Prazo Próximo', value: dueSoonActivities.length, icon: Clock, color: 'text-status-pendente', bgColor: 'bg-status-pendente/10' },
    { title: 'OSI Hoje', value: todayOsi.length, icon: Zap, color: 'text-accent-foreground', bgColor: 'bg-accent/50' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPI Cards with sparkline-like mini progress */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiCards.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card 
              key={index} 
              className={`shadow-soft hover-scale overflow-hidden animate-fade-in relative ${
                (kpi as any).pulse ? 'ring-2 ring-destructive/50' : ''
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{kpi.title}</p>
                    <p className={`text-3xl font-bold mt-1 ${kpi.color}`}>{kpi.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${kpi.bgColor}`}>
                    <Icon className={`h-6 w-6 ${kpi.color}`} />
                  </div>
                </div>
                {/* Mini progress bar */}
                <div className="mt-3">
                  <Progress
                    value={activities.length > 0 ? (kpi.value / activities.length) * 100 : 0}
                    className="h-1"
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Completion Rate Banner */}
      <Card className="shadow-soft overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Taxa de Conclusão Geral</span>
            <span className="text-2xl font-bold text-status-ativo">{completionRate}%</span>
          </div>
          <Progress value={completionRate} className="h-3" />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>{completedActivities.length} concluídas</span>
            <span>{activities.length} total</span>
          </div>
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Trend */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-5 w-5" />
              Tendência (últimos 14 dias)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorAtiv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(220, 70%, 50%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(220, 70%, 50%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorOsi" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none',
                    boxShadow: '0 10px 30px -10px rgba(0,0,0,0.2)',
                  }}
                />
                <Area type="monotone" dataKey="atividades" stroke="hsl(220, 70%, 50%)" strokeWidth={2} fillOpacity={1} fill="url(#colorAtiv)" name="Atividades" animationDuration={1500} />
                <Area type="monotone" dataKey="osi" stroke="hsl(142, 76%, 36%)" strokeWidth={2} fillOpacity={1} fill="url(#colorOsi)" name="OSI" animationDuration={1500} animationBegin={300} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle2 className="h-5 w-5" />
              Distribuição por Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <ResponsiveContainer width="60%" height={250}>
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                    animationDuration={1200}
                    animationBegin={200}
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: 'none',
                      boxShadow: '0 10px 30px -10px rgba(0,0,0,0.2)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="w-[40%] space-y-2">
                {statusChartData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="truncate">{item.name}</span>
                    <span className="font-bold ml-auto">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Distribution with animated bars */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-5 w-5" />
            Atividades por Equipe
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={teamData} layout="vertical">
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="hsl(220, 70%, 50%)" />
                  <stop offset="100%" stopColor="hsl(240, 80%, 60%)" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis type="number" fontSize={12} />
              <YAxis type="category" dataKey="name" fontSize={12} width={120} />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: 'none',
                  boxShadow: '0 10px 30px -10px rgba(0,0,0,0.2)',
                }}
              />
              <Bar dataKey="value" fill="url(#barGradient)" radius={[0, 6, 6, 0]} name="Atividades" animationDuration={1500} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="shadow-soft hover-scale">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-primary">{activities.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Total Atividades</p>
          </CardContent>
        </Card>
        <Card className="shadow-soft hover-scale">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-primary">{osiActivities.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Total OSI</p>
          </CardContent>
        </Card>
        <Card className="shadow-soft hover-scale">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-status-ativo">{completionRate}%</p>
            <p className="text-xs text-muted-foreground mt-1">Taxa Conclusão</p>
          </CardContent>
        </Card>
        <Card className="shadow-soft hover-scale">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-status-pendente">
              {activities.length > 0 ? Math.round((pendingActivities.length / activities.length) * 100) : 0}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">Taxa Pendência</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
