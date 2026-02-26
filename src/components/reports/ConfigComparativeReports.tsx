import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Activity } from '@/types/activity';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { GitCompareArrows, TrendingUp, Calendar } from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ConfigComparativeReportsProps {
  activities: Activity[];
  statuses: Array<{ id: string; name: string; color: string }>;
  getStatusColor: (statusName: string) => string;
}

export const ConfigComparativeReports = ({ activities, statuses, getStatusColor }: ConfigComparativeReportsProps) => {
  const [compareBy, setCompareBy] = useState<'equipeConfiguracao' | 'status' | 'cidade'>('equipeConfiguracao');
  const [months, setMonths] = useState<'3' | '6' | '12'>('6');

  const getFieldValue = (a: Activity, field: typeof compareBy) => {
    switch (field) {
      case 'equipeConfiguracao': return a.equipeConfiguracao;
      case 'status': return a.status;
      case 'cidade': return a.cidade;
    }
  };

  const topCategories = useMemo(() => {
    const counts: Record<string, number> = {};
    activities.forEach(a => {
      const key = getFieldValue(a, compareBy);
      if (key) counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts).sort(([, a], [, b]) => b - a).slice(0, 5).map(([k]) => k);
  }, [activities, compareBy]);

  const monthlyTrend = useMemo(() => {
    const start = startOfMonth(subMonths(new Date(), Number(months) - 1));
    const end = endOfMonth(new Date());
    const monthList = eachMonthOfInterval({ start, end });

    return monthList.map(month => {
      const monthStr = format(month, 'yyyy-MM');
      const label = format(month, 'MMM/yy', { locale: ptBR });
      const row: Record<string, any> = { month: label };

      topCategories.forEach(cat => {
        row[cat] = activities.filter(a => {
          const actMonth = a.data?.substring(0, 7);
          const val = getFieldValue(a, compareBy);
          return actMonth === monthStr && val === cat;
        }).length;
      });

      return row;
    });
  }, [activities, compareBy, months, topCategories]);

  const periodComparison = useMemo(() => {
    const now = new Date();
    const thisMonth = format(now, 'yyyy-MM');
    const lastMonth = format(subMonths(now, 1), 'yyyy-MM');

    const categories = new Set<string>();
    activities.forEach(a => {
      const key = getFieldValue(a, compareBy);
      if (key) categories.add(key);
    });

    return Array.from(categories).map(cat => {
      const thisCount = activities.filter(a => {
        const val = getFieldValue(a, compareBy);
        return a.data?.substring(0, 7) === thisMonth && val === cat;
      }).length;
      const lastCount = activities.filter(a => {
        const val = getFieldValue(a, compareBy);
        return a.data?.substring(0, 7) === lastMonth && val === cat;
      }).length;

      return { name: cat, mesAtual: thisCount, mesAnterior: lastCount };
    }).filter(d => d.mesAtual > 0 || d.mesAnterior > 0)
      .sort((a, b) => (b.mesAtual + b.mesAnterior) - (a.mesAtual + a.mesAnterior))
      .slice(0, 10);
  }, [activities, compareBy]);

  const completionEvolution = useMemo(() => {
    const start = startOfMonth(subMonths(new Date(), Number(months) - 1));
    const end = endOfMonth(new Date());
    const monthList = eachMonthOfInterval({ start, end });

    return monthList.map(month => {
      const monthStr = format(month, 'yyyy-MM');
      const monthActs = activities.filter(a => a.data?.substring(0, 7) === monthStr);
      const completed = monthActs.filter(a => a.status === 'CONCLUÍDO').length;
      const total = monthActs.length;
      return {
        month: format(month, 'MMM/yy', { locale: ptBR }),
        total,
        concluidas: completed,
        taxa: total > 0 ? Math.round((completed / total) * 100) : 0,
      };
    });
  }, [activities, months]);

  const COLORS = ['hsl(262, 83%, 58%)', 'hsl(142, 76%, 36%)', 'hsl(45, 93%, 47%)', 'hsl(0, 84%, 60%)', 'hsl(220, 70%, 50%)'];

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <GitCompareArrows className="h-5 w-5" />
            Comparativos - Equipes de Configuração
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Comparar por</Label>
              <Select value={compareBy} onValueChange={(v: typeof compareBy) => setCompareBy(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="equipeConfiguracao">Equipe Configuração</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="cidade">Cidade</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Período</Label>
              <Select value={months} onValueChange={(v: '3' | '6' | '12') => setMonths(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">Últimos 3 meses</SelectItem>
                  <SelectItem value="6">Últimos 6 meses</SelectItem>
                  <SelectItem value="12">Último ano</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Tendência Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Legend />
                {topCategories.map((cat, i) => (
                  <Line key={cat} type="monotone" dataKey={cat} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={{ r: 3 }} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Mês Atual vs Anterior
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={periodComparison} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis type="number" fontSize={12} />
                <YAxis type="category" dataKey="name" fontSize={11} width={100} />
                <Tooltip />
                <Legend />
                <Bar dataKey="mesAtual" fill="hsl(262, 83%, 58%)" name="Mês Atual" radius={[0, 4, 4, 0]} />
                <Bar dataKey="mesAnterior" fill="hsl(262, 83%, 58%, 0.4)" name="Mês Anterior" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Evolução da Taxa de Conclusão
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={completionEvolution}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="month" fontSize={12} />
              <YAxis fontSize={12} domain={[0, 100]} unit="%" />
              <Tooltip formatter={(value: number, name: string) => name === 'taxa' ? `${value}%` : value} />
              <Legend />
              <Line type="monotone" dataKey="taxa" stroke="hsl(262, 83%, 58%)" strokeWidth={3} name="Taxa de Conclusão %" dot={{ r: 4 }} />
              <Line type="monotone" dataKey="total" stroke="hsl(220, 70%, 50%)" strokeWidth={2} name="Total" dot={{ r: 3 }} />
              <Line type="monotone" dataKey="concluidas" stroke="hsl(45, 93%, 47%)" strokeWidth={2} name="Concluídas" dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
