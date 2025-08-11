import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OsiActivity } from '@/types/osiActivity';
import { BarChart3, Calendar, Users, MapPin, Building, User, Wrench, Settings } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface OsiActivityReportsProps {
  activities: OsiActivity[];
  statuses: Array<{ id: string; name: string; color: string }>;
  getStatusColor: (statusName: string) => string;
}

export const OsiActivityReports = ({ activities, statuses, getStatusColor }: OsiActivityReportsProps) => {
  const [reportType, setReportType] = useState<'status' | 'obra' | 'atividade' | 'osi' | 'analista' | 'tecnico'>('status');
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().substr(0, 7));

  const filteredActivities = useMemo(() => {
    return activities.filter(activity => {
      if (!activity.data) return false;
      const activityMonth = activity.data.substr(0, 7);
      return activityMonth === selectedMonth;
    });
  }, [activities, selectedMonth]);

  const generateReport = () => {
    const counts: Record<string, number> = {};
    
    filteredActivities.forEach(activity => {
      let key: string;
      
      switch (reportType) {
        case 'analista':
          key = activity.equipe_configuracao || 'Não informado';
          break;
        case 'tecnico':
          key = activity.equipe_campo || 'Não informado';
          break;
        default:
          key = activity[reportType] || 'Não informado';
      }
      
      counts[key] = (counts[key] || 0) + 1;
    });

    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .map(([label, count]) => ({
        label,
        count,
        percentage: Math.round((count / filteredActivities.length) * 100) || 0,
        color: reportType === 'status' ? getStatusColor(label) : '#10b981'
      }));
  };

  const reportData = generateReport();
  const totalActivities = filteredActivities.length;

  const getReportIcon = () => {
    switch (reportType) {
      case 'status': return <BarChart3 className="h-5 w-5" />;
      case 'obra': return <Building className="h-5 w-5" />;
      case 'atividade': return <Settings className="h-5 w-5" />;
      case 'osi': return <MapPin className="h-5 w-5" />;
      case 'analista': return <User className="h-5 w-5" />;
      case 'tecnico': return <Wrench className="h-5 w-5" />;
    }
  };

  const getReportTitle = () => {
    switch (reportType) {
      case 'status': return 'Relatório por Status';
      case 'obra': return 'Relatório por Obra';
      case 'atividade': return 'Relatório por Atividade';
      case 'osi': return 'Relatório por OSI';
      case 'analista': return 'Relatório por Analista';
      case 'tecnico': return 'Relatório por Técnico de Campo';
    }
  };

  // Generate available months from activities
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    activities.forEach(activity => {
      if (activity.data) {
        const month = activity.data.substr(0, 7);
        months.add(month);
      }
    });
    return Array.from(months).sort().reverse();
  }, [activities]);

  return (
    <div className="space-y-6">
      <Card className="shadow-medium">
        <CardHeader className="bg-gradient-secondary">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Configurações do Relatório - Atividades OSI
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
                  <SelectItem value="obra">Por Obra</SelectItem>
                  <SelectItem value="atividade">Por Atividade</SelectItem>
                  <SelectItem value="osi">Por OSI</SelectItem>
                  <SelectItem value="analista">Por Analista</SelectItem>
                  <SelectItem value="tecnico">Por Técnico de Campo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Mês</Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableMonths.map((month) => (
                    <SelectItem key={month} value={month}>
                      {format(new Date(month + '-01'), "MMMM 'de' yyyy", { locale: ptBR })}
                    </SelectItem>
                  ))}
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
            <p className="text-sm text-muted-foreground">Total de atividades OSI no mês</p>
          </div>

          {reportData.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma atividade OSI encontrada para o mês selecionado
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
    </div>
  );
};