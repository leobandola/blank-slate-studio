import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Filter, X } from 'lucide-react';
import { OsiActivity } from '@/types/osiActivity';
import { ActivityStatus } from '@/types/activity';

interface OsiActivityFiltersProps {
  activities: OsiActivity[];
  statuses: ActivityStatus[];
  onFilter: (filteredActivities: OsiActivity[]) => void;
}

interface FilterState {
  data: string;
  obra: string;
  atividade: string;
  osi: string;
  ativacao: string;
  equipe_campo: string;
  equipe_configuracao: string;
  obs: string;
  status: string;
}

export function OsiActivityFilters({ activities, statuses, onFilter }: OsiActivityFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    data: '',
    obra: '',
    atividade: '',
    osi: '',
    ativacao: '',
    equipe_campo: '',
    equipe_configuracao: '',
    obs: '',
    status: '',
  });

  // Generate unique values for each column
  const uniqueValues = useMemo(() => {
    const getUniqueValues = (key: keyof OsiActivity) => {
      const values = activities
        .map(activity => activity[key]?.toString() || '')
        .filter(value => value !== '')
        .sort();
      return [...new Set(values)];
    };

    return {
      data: getUniqueValues('data'),
      obra: getUniqueValues('obra'),
      atividade: getUniqueValues('atividade'),
      osi: getUniqueValues('osi'),
      ativacao: getUniqueValues('ativacao'),
      equipe_campo: getUniqueValues('equipe_campo'),
      equipe_configuracao: getUniqueValues('equipe_configuracao'),
      obs: getUniqueValues('obs'),
      status: statuses.map(s => s.name),
    };
  }, [activities, statuses]);

  const applyFilters = () => {
    const filtered = activities.filter(activity => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value || value === 'all') return true;
        
        const activityValue = activity[key as keyof OsiActivity]?.toString().toLowerCase() || '';
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
      obra: '',
      atividade: '',
      osi: '',
      ativacao: '',
      equipe_campo: '',
      equipe_configuracao: '',
      obs: '',
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
                <Label htmlFor="filter-atividade">Atividade</Label>
                <Select value={filters.atividade} onValueChange={(value) => updateFilter('atividade', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar atividade..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as atividades</SelectItem>
                    {uniqueValues.atividade.map((value) => (
                      <SelectItem key={value} value={value}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="filter-osi">OSI</Label>
                <Select value={filters.osi} onValueChange={(value) => updateFilter('osi', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar OSI..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os OSIs</SelectItem>
                    {uniqueValues.osi.map((value) => (
                      <SelectItem key={value} value={value}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="filter-equipe-campo">Equipe de Campo</Label>
                <Select value={filters.equipe_campo} onValueChange={(value) => updateFilter('equipe_campo', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar equipe de campo..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as equipes de campo</SelectItem>
                    {uniqueValues.equipe_campo.map((value) => (
                      <SelectItem key={value} value={value}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="filter-equipe-configuracao">Equipe de Configuração</Label>
                <Select value={filters.equipe_configuracao} onValueChange={(value) => updateFilter('equipe_configuracao', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar equipe de configuração..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as equipes de configuração</SelectItem>
                    {uniqueValues.equipe_configuracao.map((value) => (
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