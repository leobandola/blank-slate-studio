import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { 
  Calendar,
  Plus,
  Settings,
  FileText,
  BarChart3,
  Palette,
  LogOut,
  Users,
  Activity,
  LayoutDashboard,
  Columns3,
  Moon,
  Sun,
  User,
  History,
  CalendarDays,
  FileBox,
  RepeatIcon,
  Target,
  GitCompareArrows,
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
import { useUserRole } from '@/hooks/useUserRole';

interface AppSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onSignOut: () => void;
}

const ALL_TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, minRole: 'analista' },
  { id: 'activities', label: 'Atividades', icon: Calendar, minRole: 'analista' },
  { id: 'osi-activities', label: 'Atividades OSI', icon: Activity, minRole: 'analista' },
  { id: 'kanban', label: 'Kanban', icon: Columns3, minRole: 'analista' },
  { id: 'calendar', label: 'Calendário', icon: CalendarDays, minRole: 'analista' },
  { id: 'add', label: 'Adicionar', icon: Plus, minRole: 'analista' },
  { id: 'templates', label: 'Templates', icon: FileBox, minRole: 'analista' },
  { id: 'recurring', label: 'Recorrentes', icon: RepeatIcon, minRole: 'analista' },
  { id: 'goals', label: 'Metas', icon: Target, minRole: 'analista' },
  { id: 'profile', label: 'Meu Perfil', icon: User, minRole: 'analista' },
  { id: 'status', label: 'Status', icon: Palette, minRole: 'gerente' },
  { id: 'team-dashboard', label: 'Painel Equipes', icon: Users, minRole: 'gerente' },
  { id: 'reports', label: 'Relatórios', icon: BarChart3, minRole: 'gerente' },
  { id: 'comparative', label: 'Comparativos', icon: GitCompareArrows, minRole: 'gerente' },
  { id: 'export', label: 'Importar/Exportar', icon: FileText, minRole: 'gerente' },
  { id: 'audit', label: 'Auditoria', icon: History, minRole: 'gerente' },
  { id: 'users', label: 'Usuários', icon: Users, minRole: 'admin' },
  { id: 'settings', label: 'Configurações', icon: Settings, minRole: 'admin' },
];

const ROLE_HIERARCHY: Record<string, number> = {
  analista: 1,
  gerente: 2,
  admin: 3,
};

export function AppSidebar({ activeTab, onTabChange, onSignOut }: AppSidebarProps) {
  const { open } = useSidebar();
  const { theme, setTheme } = useTheme();
  const { role } = useUserRole();
  const [appTitle, setAppTitle] = useState(() => localStorage.getItem('appTitle') || 'Agenda Empresarial');
  const [appSubtitle, setAppSubtitle] = useState(() => localStorage.getItem('appSubtitle') || 'Controle de Demandas');
  const [logo, setLogo] = useState<string>('');

  const visibleTabs = ALL_TABS.filter(tab => {
    const userLevel = ROLE_HIERARCHY[role] || 1;
    const requiredLevel = ROLE_HIERARCHY[tab.minRole] || 1;
    return userLevel >= requiredLevel;
  });

  useEffect(() => {
    const customFavicon = localStorage.getItem('customFavicon');
    if (customFavicon) {
      const existingFavicons = document.querySelectorAll('link[rel*="icon"]');
      existingFavicons.forEach(link => link.remove());
      
      const link = document.createElement('link');
      link.rel = 'icon';
      link.type = 'image/png';
      link.href = customFavicon;
      document.head.appendChild(link);
    }

    const handleBrandingUpdate = (event: CustomEvent) => {
      setAppTitle(event.detail.title);
      setAppSubtitle(event.detail.subtitle);
    };

    const handleLogoUpdate = (event: CustomEvent) => {
      setLogo(event.detail.logo);
    };

    window.addEventListener('brandingUpdated', handleBrandingUpdate as EventListener);
    window.addEventListener('logoUpdated', handleLogoUpdate as EventListener);
    
    return () => {
      window.removeEventListener('brandingUpdated', handleBrandingUpdate as EventListener);
      window.removeEventListener('logoUpdated', handleLogoUpdate as EventListener);
    };
  }, []);

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            <div className="flex items-center gap-2">
              {logo && (
                <img src={logo} alt="Logo" className="h-8 w-8 object-contain" />
              )}
              <div className="flex flex-col">
                <span className="font-bold text-sm bg-gradient-primary bg-clip-text text-transparent">
                  {appTitle}
                </span>
                {open && (
                  <span className="text-xs text-muted-foreground">
                    {appSubtitle}
                  </span>
                )}
              </div>
            </div>
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleTabs.map((tab) => {
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
                <SidebarMenuButton
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  tooltip={theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
                >
                  {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  <span>{theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
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