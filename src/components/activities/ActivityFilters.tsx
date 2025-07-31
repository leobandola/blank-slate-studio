import React, { useState } from 'react';
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
                <Input
                  id="filter-data"
                  placeholder="Filtrar por data..."
                  value={filters.data}
                  onChange={(e) => updateFilter('data', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="filter-hora">Hora</Label>
                <Input
                  id="filter-hora"
                  placeholder="Filtrar por hora..."
                  value={filters.hora}
                  onChange={(e) => updateFilter('hora', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="filter-obra">Obra</Label>
                <Input
                  id="filter-obra"
                  placeholder="Filtrar por obra..."
                  value={filters.obra}
                  onChange={(e) => updateFilter('obra', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="filter-site">Site</Label>
                <Input
                  id="filter-site"
                  placeholder="Filtrar por site..."
                  value={filters.site}
                  onChange={(e) => updateFilter('site', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="filter-otsOsi">OTS / OSI</Label>
                <Input
                  id="filter-otsOsi"
                  placeholder="Filtrar por OTS/OSI..."
                  value={filters.otsOsi}
                  onChange={(e) => updateFilter('otsOsi', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="filter-designacao">Designação</Label>
                <Input
                  id="filter-designacao"
                  placeholder="Filtrar por designação..."
                  value={filters.designacao}
                  onChange={(e) => updateFilter('designacao', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="filter-equipeConfiguracao">Equipe Configuração</Label>
                <Input
                  id="filter-equipeConfiguracao"
                  placeholder="Filtrar por equipe configuração..."
                  value={filters.equipeConfiguracao}
                  onChange={(e) => updateFilter('equipeConfiguracao', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="filter-cidade">Cidade</Label>
                <Input
                  id="filter-cidade"
                  placeholder="Filtrar por cidade..."
                  value={filters.cidade}
                  onChange={(e) => updateFilter('cidade', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="filter-empresa">Empresa</Label>
                <Input
                  id="filter-empresa"
                  placeholder="Filtrar por empresa..."
                  value={filters.empresa}
                  onChange={(e) => updateFilter('empresa', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="filter-equipe">Equipe</Label>
                <Input
                  id="filter-equipe"
                  placeholder="Filtrar por equipe..."
                  value={filters.equipe}
                  onChange={(e) => updateFilter('equipe', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="filter-atividade">Atividade</Label>
                <Input
                  id="filter-atividade"
                  placeholder="Filtrar por atividade..."
                  value={filters.atividade}
                  onChange={(e) => updateFilter('atividade', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="filter-observacao">Observação</Label>
                <Input
                  id="filter-observacao"
                  placeholder="Filtrar por observação..."
                  value={filters.observacao}
                  onChange={(e) => updateFilter('observacao', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="filter-status">Status</Label>
                <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar status..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    {statuses.map((status) => (
                      <SelectItem key={status.id} value={status.name}>
                        {status.name}
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