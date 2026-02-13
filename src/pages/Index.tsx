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
import { Toaster } from 'sonner';
import { Activity } from '@/types/activity';
import { OsiActivity } from '@/types/osiActivity';

const Index = () => {
  const [activeTab, setActiveTab] = useState('activities');
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  const [dateFilteredActivities, setDateFilteredActivities] = useState<Activity[]>([]);
  const [filteredOsiActivities, setFilteredOsiActivities] = useState<OsiActivity[]>([]);
  const [dateFilteredOsiActivities, setDateFilteredOsiActivities] = useState<OsiActivity[]>([]);
  const navigate = useNavigate();
  const {
    activities,
    statuses,
    selectedDate,
    setSelectedDate,
    addActivity,
    updateActivity,
    deleteActivity,
    addStatus,
    updateStatus,
    deleteStatus,
    getStatusColor,
    importActivities,
    user,
    loading,
    signOut,
  } = useSupabaseActivities();

  const {
    osiActivities,
    addOsiActivity,
    updateOsiActivity,
    deleteOsiActivity,
    importOsiActivities,
    loading: osiLoading,
  } = useSupabaseOsiActivities();

  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [initialOsiLoadDone, setInitialOsiLoadDone] = useState(false);

  useEffect(() => {
    // Default to showing current day activities only on initial load
    if (activities.length > 0 && !initialLoadDone) {
      const today = new Date().toISOString().split('T')[0];
      const todayActivities = activities.filter(activity => 
        activity.data && activity.data === today
      );
      setDateFilteredActivities(todayActivities);
      setFilteredActivities(todayActivities);
      setInitialLoadDone(true);
    }
  }, [activities, initialLoadDone]);

  useEffect(() => {
    // Default to showing current day OSI activities only on initial load
    if (osiActivities.length > 0 && !initialOsiLoadDone) {
      const today = new Date().toISOString().split('T')[0];
      const todayOsiActivities = osiActivities.filter(activity => 
        activity.data && activity.data === today
      );
      setDateFilteredOsiActivities(todayOsiActivities);
      setFilteredOsiActivities(todayOsiActivities);
      setInitialOsiLoadDone(true);
    }
  }, [osiActivities, initialOsiLoadDone]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
        <div className="text-primary text-xl">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleImportActivities = (importedActivities: Activity[]) => {
    importActivities(importedActivities);
  };

  const handleClearData = () => {
    localStorage.clear();
    window.location.reload();
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'activities':
        return (
          <div className="h-full flex flex-col space-y-4">
            <div className="flex-shrink-0">
              <DateView
                activities={activities}
                onFilter={(filtered) => {
                  setDateFilteredActivities(filtered);
                }}
              />
            </div>
            <div className="flex-shrink-0">
              <ActivityFilters
                activities={dateFilteredActivities}
                statuses={statuses}
                onFilter={setFilteredActivities}
              />
            </div>
            <div className="flex-1 min-h-0">
              <ActivityTable
                activities={filteredActivities}
                statuses={statuses}
                onUpdateActivity={updateActivity}
                onDeleteActivity={deleteActivity}
                onAddActivity={() => setActiveTab('add')}
                getStatusColor={getStatusColor}
              />
            </div>
          </div>
        );
      case 'osi-activities':
        return (
          <div className="h-full flex flex-col space-y-4">
            <div className="flex-shrink-0">
              <OsiDateView
                activities={osiActivities}
                onFilter={(filtered) => {
                  setDateFilteredOsiActivities(filtered);
                }}
              />
            </div>
            <div className="flex-shrink-0">
              <OsiActivityFilters
                activities={dateFilteredOsiActivities}
                statuses={statuses}
                onFilter={setFilteredOsiActivities}
              />
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
      case 'add':
        return (
          <AddActivityForm
            statuses={statuses}
            onAddActivity={addActivity}
          />
        );
      case 'add-osi':
        return (
          <AddOsiActivityForm
            onAddActivity={addOsiActivity}
          />
        );
      case 'status':
        return (
          <StatusManager
            statuses={statuses}
            onAddStatus={addStatus}
            onUpdateStatus={updateStatus}
            onDeleteStatus={deleteStatus}
          />
        );
      case 'reports':
        return (
          <div className="space-y-8">
            <ActivityReports
              activities={activities}
              statuses={statuses}
              getStatusColor={getStatusColor}
            />
            <OsiActivityReports
              activities={osiActivities}
              statuses={statuses}
              getStatusColor={getStatusColor}
            />
          </div>
        );
      case 'export':
        return (
          <ExportImport
            activities={activities}
            onImportActivities={handleImportActivities}
            osiActivities={osiActivities}
            onImportOsiActivities={importOsiActivities}
          />
        );
      case 'export-osi':
        return (
          <OsiExportImport
            activities={osiActivities}
            onImportActivities={importOsiActivities}
          />
        );
      case 'users':
        return <UserManagement />;
      case 'settings':
        return (
          <Settings
            activities={activities}
            statuses={statuses}
            onClearData={handleClearData}
          />
        );
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
          <header className="h-12 flex items-center border-b bg-background px-4">
            <SidebarTrigger />
            <h1 className="ml-4 font-semibold text-lg">
              {activeTab === 'activities' && 'Atividades'}
              {activeTab === 'osi-activities' && 'Atividades OSI'}
              {activeTab === 'add' && 'Adicionar Atividade'}
              {activeTab === 'add-osi' && 'Adicionar Atividade OSI'}
              {activeTab === 'status' && 'Gerenciar Status'}
              {activeTab === 'reports' && 'Relatórios'}
              {activeTab === 'export' && 'Importar/Exportar'}
              {activeTab === 'export-osi' && 'Importar/Exportar OSI'}
              {activeTab === 'users' && 'Usuários'}
              {activeTab === 'settings' && 'Configurações'}
            </h1>
          </header>
          
          <main className="flex-1 overflow-hidden p-4">
            <div className="h-full max-w-full">
              {renderContent()}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
