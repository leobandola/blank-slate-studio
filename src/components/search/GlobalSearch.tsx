import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Activity } from '@/types/activity';
import { OsiActivity } from '@/types/osiActivity';
import { Search, Calendar, MapPin, Users } from 'lucide-react';

interface GlobalSearchProps {
  activities: Activity[];
  osiActivities: OsiActivity[];
  onNavigateToActivity: (tab: string) => void;
}

export const GlobalSearch = ({ activities, osiActivities, onNavigateToActivity }: GlobalSearchProps) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(prev => !prev);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const activityResults = useMemo(() => {
    return activities.slice(0, 20).map(a => ({
      id: a.id,
      title: a.atividade || a.obra || 'Sem descrição',
      subtitle: `${a.data} • ${a.equipe || ''} • ${a.cidade || ''}`,
      status: a.status,
      type: 'activity' as const,
    }));
  }, [activities]);

  const osiResults = useMemo(() => {
    return osiActivities.slice(0, 10).map(a => ({
      id: a.id,
      title: a.atividade || a.obra || 'Sem descrição',
      subtitle: `${a.data} • ${a.osi || ''} • ${a.equipe_campo || ''}`,
      status: a.status,
      type: 'osi' as const,
    }));
  }, [osiActivities]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-muted/50 text-sm text-muted-foreground hover:bg-muted transition-colors"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Buscar...</span>
        <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-background px-1.5 text-[10px] font-medium text-muted-foreground">
          ⌘K
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 max-w-lg overflow-hidden">
          <Command className="rounded-lg border-0">
            <CommandInput placeholder="Buscar atividades, OSI, equipes..." />
            <CommandList className="max-h-[400px]">
              <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
              
              {activityResults.length > 0 && (
                <CommandGroup heading="Atividades">
                  {activityResults.map((item) => (
                    <CommandItem
                      key={item.id}
                      onSelect={() => {
                        onNavigateToActivity('activities');
                        setOpen(false);
                      }}
                      className="flex items-start gap-3 py-3"
                    >
                      <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>
                      </div>
                      {item.status && (
                        <span className="text-xs bg-muted px-2 py-0.5 rounded">{item.status}</span>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {osiResults.length > 0 && (
                <CommandGroup heading="Atividades OSI">
                  {osiResults.map((item) => (
                    <CommandItem
                      key={item.id}
                      onSelect={() => {
                        onNavigateToActivity('osi-activities');
                        setOpen(false);
                      }}
                      className="flex items-start gap-3 py-3"
                    >
                      <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>
                      </div>
                      {item.status && (
                        <span className="text-xs bg-muted px-2 py-0.5 rounded">{item.status}</span>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
};