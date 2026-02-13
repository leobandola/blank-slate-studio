import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { BookmarkPlus, Bookmark, Trash2, Check } from 'lucide-react';
import { toast } from 'sonner';

interface SavedFilter {
  id: string;
  name: string;
  filters: Record<string, string>;
}

interface SavedFiltersProps {
  currentFilters: Record<string, string>;
  onApplyFilter: (filters: Record<string, string>) => void;
  filterType?: string;
}

export const SavedFilters = ({ currentFilters, onApplyFilter, filterType = 'activities' }: SavedFiltersProps) => {
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [filterName, setFilterName] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilterId, setActiveFilterId] = useState<string | null>(null);

  useEffect(() => {
    loadFilters();
  }, []);

  const loadFilters = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const { data, error } = await supabase
      .from('saved_filters' as any)
      .select('*')
      .eq('user_id', session.user.id)
      .eq('filter_type', filterType)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setSavedFilters(data.map((d: any) => ({ id: d.id, name: d.name, filters: d.filters })));
    }
  };

  const saveFilter = async () => {
    if (!filterName.trim()) {
      toast.error('Informe um nome para o filtro');
      return;
    }

    const hasActive = Object.values(currentFilters).some(v => v && v !== 'all');
    if (!hasActive) {
      toast.error('Nenhum filtro ativo para salvar');
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const { error } = await supabase
      .from('saved_filters' as any)
      .insert({
        user_id: session.user.id,
        name: filterName.trim(),
        filter_type: filterType,
        filters: currentFilters,
      });

    if (error) {
      toast.error('Erro ao salvar filtro');
    } else {
      toast.success('Filtro salvo!');
      setFilterName('');
      loadFilters();
    }
  };

  const deleteFilter = async (id: string) => {
    const { error } = await supabase
      .from('saved_filters' as any)
      .delete()
      .eq('id', id);

    if (!error) {
      setSavedFilters(prev => prev.filter(f => f.id !== id));
      if (activeFilterId === id) setActiveFilterId(null);
      toast.success('Filtro removido');
    }
  };

  const applyFilter = (filter: SavedFilter) => {
    setActiveFilterId(filter.id);
    onApplyFilter(filter.filters);
    setIsOpen(false);
    toast.success(`Filtro "${filter.name}" aplicado`);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Bookmark className="h-4 w-4" />
          Filtros Salvos
          {savedFilters.length > 0 && (
            <Badge variant="secondary" className="ml-1 text-[10px] px-1.5">
              {savedFilters.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Filtros Salvos</h4>

          {/* Save current filter */}
          <div className="flex gap-2">
            <Input
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              placeholder="Nome do filtro..."
              className="text-sm h-8"
              onKeyDown={(e) => e.key === 'Enter' && saveFilter()}
            />
            <Button size="sm" onClick={saveFilter} className="h-8 px-2">
              <BookmarkPlus className="h-4 w-4" />
            </Button>
          </div>

          {/* Saved filters list */}
          {savedFilters.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-2">
              Nenhum filtro salvo
            </p>
          ) : (
            <div className="space-y-1 max-h-[200px] overflow-auto">
              {savedFilters.map(filter => (
                <div
                  key={filter.id}
                  className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 transition-colors group"
                >
                  <button
                    onClick={() => applyFilter(filter)}
                    className="flex-1 text-left text-sm flex items-center gap-2"
                  >
                    {activeFilterId === filter.id && (
                      <Check className="h-3 w-3 text-primary" />
                    )}
                    <span className={activeFilterId === filter.id ? 'font-medium text-primary' : ''}>
                      {filter.name}
                    </span>
                  </button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => deleteFilter(filter.id)}
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
