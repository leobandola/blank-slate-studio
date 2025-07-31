import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  Calendar,
  Plus,
  Settings,
  FileText,
  Menu,
  X,
  BarChart3,
  Palette,
  LogOut,
  Users,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onSignOut: () => void;
}

const TABS = [
  { id: 'activities', label: 'Atividades', icon: Calendar },
  { id: 'add', label: 'Adicionar', icon: Plus },
  { id: 'status', label: 'Status', icon: Palette },
  { id: 'reports', label: 'Relatórios', icon: BarChart3 },
  { id: 'export', label: 'Importar/Exportar', icon: FileText },
  { id: 'users', label: 'Usuários', icon: Users },
  { id: 'settings', label: 'Configurações', icon: Settings },
];

export const Sidebar = ({ activeTab, onTabChange, onSignOut }: SidebarProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X /> : <Menu />}
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 h-full w-64 bg-card shadow-large transform transition-transform duration-300 z-50",
          "md:static md:transform-none md:z-auto",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Agenda Empresarial
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Controle de Demandas
            </p>
          </div>

          <nav className="space-y-2">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 h-12",
                    activeTab === tab.id && "shadow-medium"
                  )}
                  onClick={() => {
                    onTabChange(tab.id);
                    setIsOpen(false);
                  }}
                >
                  <Icon className="h-5 w-5" />
                  {tab.label}
                </Button>
              );
            })}
          </nav>
          <div className="mt-auto p-4 border-t border-border">
            <Button
              onClick={onSignOut}
              variant="outline"
              className="w-full"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};