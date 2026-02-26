import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Activity } from '@/types/activity';
import { OsiActivity } from '@/types/osiActivity';
import { Settings2, TrendingUp, BarChart3, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { format, subDays, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ConfigTeamDashboardProps {
  activities: Activity[];
  osiActivities: OsiActivity[];
  statuses: Array<{ id: string; name: string; color: string }>;
  getStatusColor: (statusName: string) => string;
}

export const ConfigTeamDashboard = ({ activities, osiActivities, statuses, getStatusColor }: ConfigTeamDashboardProps) => {
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [period, setPeriod] = useState<'7' | '14' | '30'>('14');

  const teams = useMemo(() => {
    const teamSet = new Set<string>();
    activities.forEach(a => { if (a.equipeConfiguracao) teamSet.add(a.equipeConfiguracao); });
    return Array.from(teamSet).sort();
  }, [activities]);

  const filteredActivities = useMemo(() => {
    const cutoff = subDays(startOfDay(new Date()), Number(period));
    let filtered = activities.filter(a => new Date(a.data) >= cutoff);
    if (selectedTeam !== 'all') {
      filtered = filtered.filter(a => a.equipeConfiguracao === selectedTeam);
    }
    return filtered;
  }, [activities, selectedTeam, period]);

  const teamComparison = useMemo(() => {
    const cutoff = subDays(startOfDay(new Date()), Number(period));
    const periodActivities = activities.filter(a => new Date(a.data) >= cutoff);

    return teams.map(team => {
      const teamActs = periodActivities.filter(a => a.equipeConfiguracao === team);
      const completed = teamActs.filter(a => a.status === 'CONCLUÍDO').length;
      const pending = teamActs.filter(a => a.status === 'PENDENTE').length;
      const total = teamActs.length;
      const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
      return { name: team, total, completed, pending, rate };
    }).sort((a, b) => b.total - a.total).slice(0, 10);
  }, [activities, teams, period]);

  const radarData = useMemo(() => {
    if (teamComparison.length === 0) return [];
    const maxTotal = Math.max(...teamComparison.map(t => t.total), 1);
    return teamComparison.slice(0, 6).map(t => ({
      team: t.name.length > 12 ? t.name.slice(0, 12) + '...' : t.name,
      produtividade: Math.round((t.total / maxTotal) * 100),
      conclusao: t.rate,
    }));
  }, [teamComparison]);

  const teamTrend = useMemo(() => {
    const days = [];
    for (let i = Number(period) - 1; i >= 0; i--) {
      const date = subDays(startOfDay(new Date()), i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayData: Record<string, any> = { date: format(date, 'dd/MM', { locale: ptBR }) };
      const topTeams = teamComparison.slice(0, 4);
      topTeams.forEach(t => {
        dayData[t.name] = filteredActivities.filter(a => a.data === dateStr && a.equipeConfiguracao === t.name).length;
      });
      days.push(dayData);
    }
    return days;
  }, [filteredActivities, teamComparison, period]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <Select value={selectedTeam} onValueChange={setSelectedTeam}>
          <SelectTrigger className="w-[240px]">
            <SelectValue placeholder="Todas as equipes de configuração" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as equipes de configuração</SelectItem>
            {teams.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={period} onValueChange={(v: '7' | '14' | '30') => setPeriod(v)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Últimos 7 dias</SelectItem>
            <SelectItem value="14">Últimos 14 dias</SelectItem>
            <SelectItem value="30">Últimos 30 dias</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10"><Settings2 className="h-5 w-5 text-primary" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Equipes Config. Ativas</p>
                <p className="text-2xl font-bold">{teams.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-accent/50"><BarChart3 className="h-5 w-5 text-accent-foreground" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Total no Período</p>
                <p className="text-2xl font-bold">{filteredActivities.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-status-ativo/10"><Target className="h-5 w-5 text-status-ativo" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Taxa Conclusão</p>
                <p className="text-2xl font-bold">
                  {filteredActivities.length > 0
                    ? Math.round((filteredActivities.filter(a => a.status === 'CONCLUÍDO').length / filteredActivities.length) * 100)
                    : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-destructive/10"><TrendingUp className="h-5 w-5 text-destructive" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Média/Dia</p>
                <p className="text-2xl font-bold">
                  {Number(period) > 0 ? Math.round(filteredActivities.length / Number(period)) : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Comparativo por Equipe de Configuração
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={teamComparison} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis type="number" fontSize={12} />
                <YAxis type="category" dataKey="name" fontSize={11} width={100} />
                <Tooltip />
                <Bar dataKey="completed" fill="hsl(142, 76%, 36%)" name="Concluídas" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="pending" fill="hsl(45, 93%, 47%)" name="Pendentes" stackId="a" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-5 w-5" />
              Desempenho das Equipes de Configuração
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="team" fontSize={11} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} fontSize={10} />
                <Radar name="Produtividade" dataKey="produtividade" stroke="hsl(262, 83%, 58%)" fill="hsl(262, 83%, 58%)" fillOpacity={0.3} />
                <Radar name="Conclusão %" dataKey="conclusao" stroke="hsl(142, 76%, 36%)" fill="hsl(142, 76%, 36%)" fillOpacity={0.3} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Ranking Table */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Ranking de Equipes de Configuração
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">#</th>
                  <th className="text-left p-2">Equipe Configuração</th>
                  <th className="text-center p-2">Total</th>
                  <th className="text-center p-2">Concluídas</th>
                  <th className="text-center p-2">Pendentes</th>
                  <th className="text-center p-2">Taxa</th>
                </tr>
              </thead>
              <tbody>
                {teamComparison.map((team, i) => (
                  <tr key={team.name} className="border-b hover:bg-muted/30">
                    <td className="p-2 font-bold text-muted-foreground">{i + 1}</td>
                    <td className="p-2 font-medium">{team.name}</td>
                    <td className="p-2 text-center">{team.total}</td>
                    <td className="p-2 text-center text-status-ativo font-semibold">{team.completed}</td>
                    <td className="p-2 text-center text-status-pendente font-semibold">{team.pending}</td>
                    <td className="p-2 text-center">
                      <Badge variant={team.rate >= 70 ? 'default' : team.rate >= 40 ? 'secondary' : 'destructive'}>
                        {team.rate}%
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
