import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { ActivityTable } from '@/components/activities/ActivityTable';
import { AddActivityForm } from '@/components/activities/AddActivityForm';
import { StatusManager } from '@/components/status/StatusManager';
import { ExportImport } from '@/components/export/ExportImport';
import { Reports } from '@/components/reports/Reports';
import { Settings } from '@/components/settings/Settings';
import { useActivities } from '@/hooks/useActivities';
import { Toaster } from 'sonner';

const Index = () => {
  const [activeTab, setActiveTab] = useState('activities');
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
  } = useActivities();

  const handleImportActivities = (importedActivities: any[]) => {
    importedActivities.forEach(activity => {
      addActivity(activity);
    });
  };

  const handleClearData = () => {
    localStorage.clear();
    window.location.reload();
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'activities':
        return (
          <ActivityTable
            activities={activities}
            statuses={statuses}
            onUpdateActivity={updateActivity}
            onDeleteActivity={deleteActivity}
            onAddActivity={() => setActiveTab('add')}
            getStatusColor={getStatusColor}
          />
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
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        
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
