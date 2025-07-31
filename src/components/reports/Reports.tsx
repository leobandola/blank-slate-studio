import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity } from '@/types/activity';
import { BarChart3, Calendar, Users, MapPin, Building } from 'lucide-react';

interface ReportsProps {
  activities: Activity[];
  statuses: Array<{ id: string; name: string; color: string }>;
  getStatusColor: (statusName: string) => string;
}

export const Reports = ({ activities, statuses, getStatusColor }: ReportsProps) => {
  const [reportType, setReportType] = useState<'status' | 'equipe' | 'cidade' | 'empresa'>('status');
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');

  const filteredActivities = useMemo(() => {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    return activities.filter(activity => {
      const activityDate = new Date(activity.data);
      return activityDate >= startDate;
    });
  }, [activities, period]);

  const generateReport = () => {
    const counts: Record<string, number> = {};
    
    filteredActivities.forEach(activity => {
      const key = activity[reportType] || 'Não informado';
      counts[key] = (counts[key] || 0) + 1;
    });

    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .map(([label, count]) => ({
        label,
        count,
        percentage: Math.round((count / filteredActivities.length) * 100) || 0,
        color: reportType === 'status' ? getStatusColor(label) : '#3b82f6'
      }));
  };

  const reportData = generateReport();
  const totalActivities = filteredActivities.length;

  const getReportIcon = () => {
    switch (reportType) {
      case 'status': return <BarChart3 className="h-5 w-5" />;
      case 'equipe': return <Users className="h-5 w-5" />;
      case 'cidade': return <MapPin className="h-5 w-5" />;
      case 'empresa': return <Building className="h-5 w-5" />;
    }
  };

  const getReportTitle = () => {
    switch (reportType) {
      case 'status': return 'Relatório por Status';
      case 'equipe': return 'Relatório por Equipe';
      case 'cidade': return 'Relatório por Cidade';
      case 'empresa': return 'Relatório por Empresa';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-medium">
        <CardHeader className="bg-gradient-secondary">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Configurações do Relatório
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Tipo de Relatório</Label>
              <Select value={reportType} onValueChange={(value: any) => setReportType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="status">Por Status</SelectItem>
                  <SelectItem value="equipe">Por Equipe</SelectItem>
                  <SelectItem value="cidade">Por Cidade</SelectItem>
                  <SelectItem value="empresa">Por Empresa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Período</Label>
              <Select value={period} onValueChange={(value: any) => setPeriod(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Última Semana</SelectItem>
                  <SelectItem value="month">Último Mês</SelectItem>
                  <SelectItem value="year">Último Ano</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-medium">
        <CardHeader className="bg-gradient-secondary">
          <CardTitle className="flex items-center gap-2">
            {getReportIcon()}
            {getReportTitle()}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="mb-4 text-center">
            <p className="text-2xl font-bold text-primary">{totalActivities}</p>
            <p className="text-sm text-muted-foreground">Total de atividades no período</p>
          </div>

          {reportData.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma atividade encontrada para o período selecionado
            </p>
          ) : (
            <div className="space-y-4">
              {reportData.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold">{item.count}</span>
                      <span className="text-sm text-muted-foreground ml-2">
                        ({item.percentage}%)
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: item.color
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-medium">
        <CardHeader className="bg-gradient-secondary">
          <CardTitle>Resumo Geral</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <p className="text-lg font-bold text-primary">{activities.length}</p>
              <p className="text-sm text-muted-foreground">Total Geral</p>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <p className="text-lg font-bold text-status-ativo">
                {activities.filter(a => ['ATIVO', 'CONCLUÍDO'].includes(a.status)).length}
              </p>
              <p className="text-sm text-muted-foreground">Ativos/Concluídos</p>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <p className="text-lg font-bold text-status-pendente">
                {activities.filter(a => a.status === 'PENDENTE').length}
              </p>
              <p className="text-sm text-muted-foreground">Pendentes</p>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <p className="text-lg font-bold text-status-inativo">
                {activities.filter(a => ['INATIVO', 'CANCELADO'].includes(a.status)).length}
              </p>
              <p className="text-sm text-muted-foreground">Inativos/Cancelados</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};