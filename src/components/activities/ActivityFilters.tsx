import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Filter, X } from 'lucide-react';
import { Activity, ActivityStatus } from '@/types/activity';

interface ActivityFiltersProps {
  activities: Activity[];
  statuses: ActivityStatus[];
  onFilter: (filteredActivities: Activity[]) => void;
}

interface FilterState {
  data: string;
  hora: string;
  obra: string;
  site: string;
  otsOsi: string;
  designacao: string;
  equipeConfiguracao: string;
  cidade: string;
  empresa: string;
  equipe: string;
  atividade: string;
  observacao: string;
  status: string;
}

export function ActivityFilters({ activities, statuses, onFilter }: ActivityFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    data: '',
    hora: '',
    obra: '',
    site: '',
    otsOsi: '',
    designacao: '',
    equipeConfiguracao: '',
    cidade: '',
    empresa: '',
    equipe: '',
    atividade: '',
    observacao: '',
    status: '',
  });

  // Generate unique values for each column (like Excel)
  const uniqueValues = useMemo(() => {
    const getUniqueValues = (key: keyof Activity) => {
      const values = activities
        .map(activity => activity[key]?.toString() || '')
        .filter(value => value !== '')
        .sort();
      return [...new Set(values)];
    };

    return {
      data: getUniqueValues('data'),
      hora: getUniqueValues('hora'),
      obra: getUniqueValues('obra'),
      site: getUniqueValues('site'),
      otsOsi: getUniqueValues('otsOsi'),
      designacao: getUniqueValues('designacao'),
      equipeConfiguracao: getUniqueValues('equipeConfiguracao'),
      cidade: getUniqueValues('cidade'),
      empresa: getUniqueValues('empresa'),
      equipe: getUniqueValues('equipe'),
      atividade: getUniqueValues('atividade'),
      observacao: getUniqueValues('observacao'),
      status: statuses.map(s => s.name),
    };
  }, [activities, statuses]);

  const applyFilters = () => {
    const filtered = activities.filter(activity => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value || value === 'all') return true;
        
        const activityValue = activity[key as keyof Activity]?.toString().toLowerCase() || '';
        return activityValue.includes(value.toLowerCase());
      });
    });
    
    onFilter(filtered);
  };

  // Apply filters automatically when filters change or activities change
  useEffect(() => {
    applyFilters();
  }, [filters, activities]);

  const clearFilters = () => {
    setFilters({
      data: '',
      hora: '',
      obra: '',
      site: '',
      otsOsi: '',
      designacao: '',
      equipeConfiguracao: '',
      cidade: '',
      empresa: '',
      equipe: '',
      atividade: '',
      observacao: '',
      status: '',
    });
    onFilter(activities);
  };

  const updateFilter = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <Card className="mb-6">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros Avançados
                {hasActiveFilters && (
                  <span className="bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs">
                    Ativo
                  </span>
                )}
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
              <div>
                <Label htmlFor="filter-data">Data</Label>
                <Select value={filters.data} onValueChange={(value) => updateFilter('data', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar data..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as datas</SelectItem>
                    {uniqueValues.data.map((value) => (
                      <SelectItem key={value} value={value}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="filter-hora">Hora</Label>
                <Select value={filters.hora} onValueChange={(value) => updateFilter('hora', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar hora..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as horas</SelectItem>
                    {uniqueValues.hora.map((value) => (
                      <SelectItem key={value} value={value}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="filter-obra">Obra</Label>
                <Select value={filters.obra} onValueChange={(value) => updateFilter('obra', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar obra..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as obras</SelectItem>
                    {uniqueValues.obra.map((value) => (
                      <SelectItem key={value} value={value}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="filter-site">Site</Label>
                <Select value={filters.site} onValueChange={(value) => updateFilter('site', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar site..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os sites</SelectItem>
                    {uniqueValues.site.map((value) => (
                      <SelectItem key={value} value={value}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="filter-equipe">Equipe</Label>
                <Select value={filters.equipe} onValueChange={(value) => updateFilter('equipe', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar equipe..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as equipes</SelectItem>
                    {uniqueValues.equipe.map((value) => (
                      <SelectItem key={value} value={value}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="filter-equipe-configuracao">Equipe de Configuração</Label>
                <Select value={filters.equipeConfiguracao} onValueChange={(value) => updateFilter('equipeConfiguracao', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar equipe de configuração..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as equipes de configuração</SelectItem>
                    {uniqueValues.equipeConfiguracao.map((value) => (
                      <SelectItem key={value} value={value}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="filter-cidade">Cidade</Label>
                <Select value={filters.cidade} onValueChange={(value) => updateFilter('cidade', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar cidade..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as cidades</SelectItem>
                    {uniqueValues.cidade.map((value) => (
                      <SelectItem key={value} value={value}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="filter-status">Status</Label>
                <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar status..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    {uniqueValues.status.map((value) => (
                      <SelectItem key={value} value={value}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={applyFilters} className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Aplicar Filtros
              </Button>
              <Button variant="outline" onClick={clearFilters} className="flex items-center gap-2">
                <X className="h-4 w-4" />
                Limpar Filtros
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}