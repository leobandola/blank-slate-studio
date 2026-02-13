import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { ActivityTable } from '@/components/activities/ActivityTable';
import { AddActivityForm } from '@/components/activities/AddActivityForm';
import { StatusManager } from '@/components/status/StatusManager';
import { ExportImport } from '@/components/export/ExportImport';
import { Reports } from '@/components/reports/Reports';
import { Settings } from '@/components/settings/Settings';
import { useSupabaseActivities } from '@/hooks/useSupabaseActivities';
import { useSupabaseOsiActivities } from '@/hooks/useSupabaseOsiActivities';
import { ActivityFilters } from '@/components/activities/ActivityFilters';
import { DateView } from '@/components/activities/DateView';
import { OsiActivityFilters } from '@/components/activities/OsiActivityFilters';
import { OsiDateView } from '@/components/activities/OsiDateView';
import { UserManagement } from '@/components/users/UserManagement';
import { OsiActivityTable } from '@/components/activities/OsiActivityTable';
import { AddOsiActivityForm } from '@/components/activities/AddOsiActivityForm';
import { OsiExportImport } from '@/components/export/OsiExportImport';
import { ActivityReports } from '@/components/reports/ActivityReports';
import { OsiActivityReports } from '@/components/reports/OsiActivityReports';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { KanbanBoard } from '@/components/activities/KanbanBoard';
import { GlobalSearch } from '@/components/search/GlobalSearch';
import { UserProfile } from '@/components/profile/UserProfile';
import { AuditLog } from '@/components/audit/AuditLog';
import { ActivityDetail } from '@/components/activities/ActivityDetail';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { PdfExport } from '@/components/export/PdfExport';
import { RecurringActivities } from '@/components/recurring/RecurringActivities';
import { ActivityTemplates } from '@/components/templates/ActivityTemplates';
import { GoalsManager } from '@/components/goals/GoalsManager';
import { CalendarView } from '@/components/calendar/CalendarView';
import { TeamDashboard } from '@/components/dashboard/TeamDashboard';
import { ComparativeReports } from '@/components/reports/ComparativeReports';
import { NotificationPreferences } from '@/components/notifications/NotificationPreferences';
import { Toaster } from 'sonner';
import { Activity } from '@/types/activity';
import { OsiActivity } from '@/types/osiActivity';

const TAB_TITLES: Record<string, string> = {
  dashboard: 'Dashboard',
  activities: 'Atividades',
  'osi-activities': 'Atividades OSI',
  kanban: 'Kanban Board',
  calendar: 'Calendário',
  add: 'Adicionar Atividade',
  'add-osi': 'Adicionar Atividade OSI',
  templates: 'Templates',
  recurring: 'Recorrentes',
  goals: 'Metas',
  status: 'Gerenciar Status',
  'team-dashboard': 'Painel Multi-Equipe',
  reports: 'Relatórios',
  comparative: 'Relatórios Comparativos',
  export: 'Importar/Exportar',
  'export-osi': 'Importar/Exportar OSI',
  users: 'Usuários',
  settings: 'Configurações',
  profile: 'Meu Perfil',
  audit: 'Log de Auditoria',
  'notification-prefs': 'Preferências de Notificação',
};

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  const [dateFilteredActivities, setDateFilteredActivities] = useState<Activity[]>([]);
  const [filteredOsiActivities, setFilteredOsiActivities] = useState<OsiActivity[]>([]);
  const [dateFilteredOsiActivities, setDateFilteredOsiActivities] = useState<OsiActivity[]>([]);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [initialOsiLoadDone, setInitialOsiLoadDone] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const navigate = useNavigate();

  const {
    activities, statuses, selectedDate, setSelectedDate,
    addActivity, updateActivity, deleteActivity,
    addStatus, updateStatus, deleteStatus,
    getStatusColor, importActivities, user, loading, signOut,
  } = useSupabaseActivities();

  const {
    osiActivities, addOsiActivity, updateOsiActivity,
    deleteOsiActivity, importOsiActivities, loading: osiLoading,
  } = useSupabaseOsiActivities();

  useEffect(() => {
    if (activities.length > 0 && !initialLoadDone) {
      const today = new Date().toISOString().split('T')[0];
      const todayActivities = activities.filter(a => a.data === today);
      setDateFilteredActivities(todayActivities);
      setFilteredActivities(todayActivities);
      setInitialLoadDone(true);
    }
  }, [activities, initialLoadDone]);

  useEffect(() => {
    if (osiActivities.length > 0 && !initialOsiLoadDone) {
      const today = new Date().toISOString().split('T')[0];
      const todayOsi = osiActivities.filter(a => a.data === today);
      setDateFilteredOsiActivities(todayOsi);
      setFilteredOsiActivities(todayOsi);
      setInitialOsiLoadDone(true);
    }
  }, [osiActivities, initialOsiLoadDone]);

  useEffect(() => {
    if (!loading && !user) navigate('/auth');
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-primary text-xl animate-fade-in">Carregando...</div>
      </div>
    );
  }

  if (!user) return null;

  const handleDuplicateActivity = (activity: Activity) => {
    const { id, ...activityData } = activity;
    addActivity(activityData);
  };

  const handleClearData = () => {
    localStorage.clear();
    window.location.reload();
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <Dashboard
              activities={activities}
              osiActivities={osiActivities}
              statuses={statuses}
              getStatusColor={getStatusColor}
            />
            <GoalsManager activities={activities} />
          </div>
        );
      case 'activities':
        return (
          <div className="h-full flex flex-col space-y-4 animate-fade-in">
            <div className="flex-shrink-0">
              <DateView activities={activities} onFilter={(filtered) => setDateFilteredActivities(filtered)} />
            </div>
            <div className="flex-shrink-0">
              <ActivityFilters activities={dateFilteredActivities} statuses={statuses} onFilter={setFilteredActivities} />
            </div>
            <div className="flex-1 min-h-0">
              <ActivityTable
                activities={filteredActivities}
                statuses={statuses}
                onUpdateActivity={updateActivity}
                onDeleteActivity={deleteActivity}
                onAddActivity={() => setActiveTab('add')}
                onDuplicateActivity={handleDuplicateActivity}
                onSelectActivity={setSelectedActivity}
                getStatusColor={getStatusColor}
              />
            </div>
          </div>
        );
      case 'osi-activities':
        return (
          <div className="h-full flex flex-col space-y-4 animate-fade-in">
            <div className="flex-shrink-0">
              <OsiDateView activities={osiActivities} onFilter={(filtered) => setDateFilteredOsiActivities(filtered)} />
            </div>
            <div className="flex-shrink-0">
              <OsiActivityFilters activities={dateFilteredOsiActivities} statuses={statuses} onFilter={setFilteredOsiActivities} />
            </div>
            <div className="flex-1 min-h-0">
              <OsiActivityTable
                activities={filteredOsiActivities}
                statuses={statuses}
                onUpdateActivity={updateOsiActivity}
                onDeleteActivity={deleteOsiActivity}
                onAddActivity={() => setActiveTab('add-osi')}
                getStatusColor={getStatusColor}
              />
            </div>
          </div>
        );
      case 'kanban':
        return (
          <KanbanBoard
            activities={filteredActivities.length > 0 ? filteredActivities : activities}
            statuses={statuses}
            onUpdateActivity={updateActivity}
            getStatusColor={getStatusColor}
          />
        );
      case 'calendar':
        return (
          <CalendarView
            activities={activities}
            getStatusColor={getStatusColor}
            onSelectActivity={setSelectedActivity}
          />
        );
      case 'add':
        return <AddActivityForm statuses={statuses} onAddActivity={addActivity} />;
      case 'add-osi':
        return <AddOsiActivityForm onAddActivity={addOsiActivity} />;
      case 'templates':
        return <ActivityTemplates statuses={statuses} onApplyTemplate={addActivity} />;
      case 'recurring':
        return <RecurringActivities statuses={statuses} />;
      case 'goals':
        return <GoalsManager activities={activities} />;
      case 'team-dashboard':
        return (
          <TeamDashboard
            activities={activities}
            osiActivities={osiActivities}
            statuses={statuses}
            getStatusColor={getStatusColor}
          />
        );
      case 'comparative':
        return (
          <ComparativeReports
            activities={activities}
            statuses={statuses}
            getStatusColor={getStatusColor}
          />
        );
      case 'notification-prefs':
        return <NotificationPreferences />;
      case 'status':
        return <StatusManager statuses={statuses} onAddStatus={addStatus} onUpdateStatus={updateStatus} onDeleteStatus={deleteStatus} />;
      case 'reports':
        return (
          <div className="space-y-8 animate-fade-in">
            <ActivityReports activities={activities} statuses={statuses} getStatusColor={getStatusColor} />
            <OsiActivityReports activities={osiActivities} statuses={statuses} getStatusColor={getStatusColor} />
          </div>
        );
      case 'export':
        return <ExportImport activities={activities} onImportActivities={importActivities} osiActivities={osiActivities} onImportOsiActivities={importOsiActivities} />;
      case 'export-osi':
        return <OsiExportImport activities={osiActivities} onImportActivities={importOsiActivities} />;
      case 'users':
        return <UserManagement />;
      case 'settings':
        return <Settings activities={activities} statuses={statuses} onClearData={handleClearData} />;
      case 'profile':
        return <UserProfile />;
      case 'audit':
        return <AuditLog />;
      default:
        return <div>Página não encontrada</div>;
    }
  };

  return (
    <SidebarProvider>
      <Toaster position="top-right" richColors />
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar activeTab={activeTab} onTabChange={setActiveTab} onSignOut={signOut} />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="h-12 flex items-center border-b bg-background px-4 no-print">
            <SidebarTrigger />
            <h1 className="ml-4 font-semibold text-lg">
              {TAB_TITLES[activeTab] || 'Página'}
            </h1>
            <div className="ml-auto flex items-center gap-2">
              {(activeTab === 'activities' || activeTab === 'reports') && (
                <PdfExport activities={filteredActivities.length > 0 ? filteredActivities : activities} title="Atividades" />
              )}
              {(activeTab === 'osi-activities') && (
                <PdfExport osiActivities={filteredOsiActivities.length > 0 ? filteredOsiActivities : osiActivities} title="OSI" />
              )}
              <NotificationBell />
              <GlobalSearch
                activities={activities}
                osiActivities={osiActivities}
                onNavigateToActivity={setActiveTab}
              />
            </div>
          </header>
          
          <main className="flex-1 overflow-auto p-4">
            <div className="h-full max-w-full">
              {renderContent()}
            </div>
          </main>
        </div>
      </div>
      <ActivityDetail
        activity={selectedActivity}
        open={!!selectedActivity}
        onClose={() => setSelectedActivity(null)}
      />
    </SidebarProvider>
  );
};

export default Index;