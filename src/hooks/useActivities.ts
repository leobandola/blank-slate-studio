import { useState, useEffect } from 'react';
import { Activity, ActivityStatus, DEFAULT_STATUSES } from '@/types/activity';

export const useActivities = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [statuses, setStatuses] = useState<ActivityStatus[]>(DEFAULT_STATUSES);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Load data from localStorage on mount
  useEffect(() => {
    const savedActivities = localStorage.getItem('activities');
    const savedStatuses = localStorage.getItem('statuses');
    
    if (savedActivities) {
      setActivities(JSON.parse(savedActivities));
    }
    
    if (savedStatuses) {
      setStatuses(JSON.parse(savedStatuses));
    }
  }, []);

  // Save activities to localStorage when they change
  useEffect(() => {
    localStorage.setItem('activities', JSON.stringify(activities));
  }, [activities]);

  // Save statuses to localStorage when they change
  useEffect(() => {
    localStorage.setItem('statuses', JSON.stringify(statuses));
  }, [statuses]);

  const addActivity = (activity: Omit<Activity, 'id'>) => {
    const newActivity: Activity = {
      ...activity,
      id: Date.now().toString(),
    };
    setActivities(prev => [...prev, newActivity]);
  };

  const updateActivity = (id: string, updates: Partial<Activity>) => {
    setActivities(prev =>
      prev.map(activity =>
        activity.id === id ? { ...activity, ...updates } : activity
      )
    );
  };

  const deleteActivity = (id: string) => {
    setActivities(prev => prev.filter(activity => activity.id !== id));
  };

  const addStatus = (status: Omit<ActivityStatus, 'id'>) => {
    const newStatus: ActivityStatus = {
      ...status,
      id: Date.now().toString(),
    };
    setStatuses(prev => [...prev, newStatus]);
  };

  const updateStatus = (id: string, updates: Partial<ActivityStatus>) => {
    setStatuses(prev =>
      prev.map(status =>
        status.id === id ? { ...status, ...updates } : status
      )
    );
  };

  const deleteStatus = (id: string) => {
    setStatuses(prev => prev.filter(status => status.id !== id));
  };

  const getStatusColor = (statusName: string): string => {
    const status = statuses.find(s => s.name === statusName);
    return status?.color || '#64748b';
  };

  return {
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
  };
};