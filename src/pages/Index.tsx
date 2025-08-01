import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { ActivityTable } from '@/components/activities/ActivityTable';
import { AddActivityForm } from '@/components/activities/AddActivityForm';
import { StatusManager } from '@/components/status/StatusManager';
import { ExportImport } from '@/components/export/ExportImport';
import { Reports } from '@/components/reports/Reports';
import { Settings } from '@/components/settings/Settings';
import { useSupabaseActivities } from '@/hooks/useSupabaseActivities';
import { ActivityFilters } from '@/components/activities/ActivityFilters';
import { DateView } from '@/components/activities/DateView';
import { UserManagement } from '@/components/users/UserManagement';
import { Toaster } from 'sonner';
import { Activity } from '@/types/activity';

const Index = () => {
  const [activeTab, setActiveTab] = useState('activities');
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  const [dateFilteredActivities, setDateFilteredActivities] = useState<Activity[]>([]);
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

  useEffect(() => {
    // Default to showing current day activities only on initial load
    if (activities.length > 0 && dateFilteredActivities.length === 0) {
      const today = new Date().toISOString().split('T')[0];
      const todayActivities = activities.filter(activity => 
        activity.data && activity.data === today
      );
      setDateFilteredActivities(todayActivities);
      setFilteredActivities(todayActivities);
    }
  }, [activities]);

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
          <>
            <DateView
              activities={activities}
              onFilter={(filtered) => {
                setDateFilteredActivities(filtered);
                // Don't set filteredActivities here - let ActivityFilters handle it
              }}
            />
            <ActivityFilters
              activities={dateFilteredActivities}
              statuses={statuses}
              onFilter={setFilteredActivities}
            />
            <ActivityTable
              activities={filteredActivities}
              statuses={statuses}
              onUpdateActivity={updateActivity}
              onDeleteActivity={deleteActivity}
              onAddActivity={() => setActiveTab('add')}
              getStatusColor={getStatusColor}
            />
          </>
        );
      case 'add':
        return (
          <AddActivityForm
            statuses={statuses}
            onAddActivity={addActivity}
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
          <Reports
            activities={activities}
            statuses={statuses}
            getStatusColor={getStatusColor}
          />
        );
      case 'export':
        return (
          <ExportImport
            activities={activities}
            onImportActivities={handleImportActivities}
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
    <>
      <Toaster position="top-right" richColors />
      <div className="min-h-screen bg-background flex">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} onSignOut={signOut} />
        
        <main className="flex-1 md:ml-0 p-4 md:p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </>
  );
};

export default Index;
