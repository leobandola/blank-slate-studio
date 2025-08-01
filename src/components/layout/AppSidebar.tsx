import { useState } from 'react';
import { 
  Calendar,
  Plus,
  Settings,
  FileText,
  BarChart3,
  Palette,
  LogOut,
  Users,
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

interface AppSidebarProps {
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

export function AppSidebar({ activeTab, onTabChange, onSignOut }: AppSidebarProps) {
  const { open } = useSidebar();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            <div className="flex flex-col">
              <span className="font-bold text-sm bg-gradient-primary bg-clip-text text-transparent">
                Agenda Empresarial
              </span>
              {open && (
                <span className="text-xs text-muted-foreground">
                  Controle de Demandas
                </span>
              )}
            </div>
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu>
              {TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <SidebarMenuItem key={tab.id}>
                    <SidebarMenuButton
                      isActive={activeTab === tab.id}
                      onClick={() => onTabChange(tab.id)}
                      tooltip={tab.label}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{tab.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={onSignOut} tooltip="Sair">
                  <LogOut className="h-4 w-4" />
                  <span>Sair</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}