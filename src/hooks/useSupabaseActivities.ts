import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Activity, ActivityStatus } from '@/types/activity';
import { toast } from 'sonner';
import { User } from '@supabase/supabase-js';

export const useSupabaseActivities = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [statuses, setStatuses] = useState<ActivityStatus[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Auth state management
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        setActivities([]);
        setStatuses([]);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load data when user changes
  useEffect(() => {
    if (user) {
      loadActivities();
      loadStatuses();
    }
    setLoading(false);
  }, [user, selectedDate]);

  const loadActivities = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedActivities: Activity[] = data.map(activity => ({
        id: activity.id,
        data: activity.data,
        hora: activity.hora,
        obra: activity.obra,
        site: activity.site,
        otsOsi: activity.ots_osi,
        designacao: activity.designacao,
        equipeConfiguracao: activity.equipe_configuracao,
        cidade: activity.cidade,
        empresa: activity.empresa,
        equipe: activity.equipe,
        atividade: activity.atividade,
        observacao: activity.observacao || '',
        status: activity.status,
      }));

      setActivities(mappedActivities);
    } catch (error) {
      console.error('Error loading activities:', error);
      toast.error('Erro ao carregar atividades');
    }
  };

  const loadStatuses = async () => {
    try {
      const { data, error } = await supabase
        .from('activity_statuses')
        .select('*')
        .order('name');

      if (error) throw error;

      setStatuses(data);
    } catch (error) {
      console.error('Error loading statuses:', error);
      toast.error('Erro ao carregar status');
    }
  };

  const addActivity = async (activity: Omit<Activity, 'id'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('activities')
        .insert({
          user_id: user.id,
          data: activity.data,
          hora: activity.hora,
          obra: activity.obra,
          site: activity.site,
          ots_osi: activity.otsOsi,
          designacao: activity.designacao,
          equipe_configuracao: activity.equipeConfiguracao,
          cidade: activity.cidade,
          empresa: activity.empresa,
          equipe: activity.equipe,
          atividade: activity.atividade,
          observacao: activity.observacao,
          status: activity.status,
        })
        .select()
        .single();

      if (error) throw error;

      const newActivity: Activity = {
        id: data.id,
        data: data.data,
        hora: data.hora,
        obra: data.obra,
        site: data.site,
        otsOsi: data.ots_osi,
        designacao: data.designacao,
        equipeConfiguracao: data.equipe_configuracao,
        cidade: data.cidade,
        empresa: data.empresa,
        equipe: data.equipe,
        atividade: data.atividade,
        observacao: data.observacao || '',
        status: data.status,
      };

      setActivities(prev => [newActivity, ...prev]);
      toast.success('Atividade adicionada com sucesso!');
    } catch (error) {
      console.error('Error adding activity:', error);
      toast.error('Erro ao adicionar atividade');
    }
  };

  const updateActivity = async (id: string, updates: Partial<Activity>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('activities')
        .update({
          data: updates.data,
          hora: updates.hora,
          obra: updates.obra,
          site: updates.site,
          ots_osi: updates.otsOsi,
          designacao: updates.designacao,
          equipe_configuracao: updates.equipeConfiguracao,
          cidade: updates.cidade,
          empresa: updates.empresa,
          equipe: updates.equipe,
          atividade: updates.atividade,
          observacao: updates.observacao,
          status: updates.status,
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setActivities(prev =>
        prev.map(activity =>
          activity.id === id ? { ...activity, ...updates } : activity
        )
      );
      toast.success('Atividade atualizada com sucesso!');
    } catch (error) {
      console.error('Error updating activity:', error);
      toast.error('Erro ao atualizar atividade');
    }
  };

  const deleteActivity = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setActivities(prev => prev.filter(activity => activity.id !== id));
      toast.success('Atividade removida com sucesso!');
    } catch (error) {
      console.error('Error deleting activity:', error);
      toast.error('Erro ao remover atividade');
    }
  };

  const addStatus = async (status: Omit<ActivityStatus, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('activity_statuses')
        .insert(status)
        .select()
        .single();

      if (error) throw error;

      setStatuses(prev => [...prev, data]);
      toast.success('Status adicionado com sucesso!');
    } catch (error) {
      console.error('Error adding status:', error);
      toast.error('Erro ao adicionar status');
    }
  };

  const updateStatus = async (id: string, updates: Partial<ActivityStatus>) => {
    try {
      const { error } = await supabase
        .from('activity_statuses')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setStatuses(prev =>
        prev.map(status =>
          status.id === id ? { ...status, ...updates } : status
        )
      );
      toast.success('Status atualizado com sucesso!');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const deleteStatus = async (id: string) => {
    try {
      const { error } = await supabase
        .from('activity_statuses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setStatuses(prev => prev.filter(status => status.id !== id));
      toast.success('Status removido com sucesso!');
    } catch (error) {
      console.error('Error deleting status:', error);
      toast.error('Erro ao remover status');
    }
  };

  const getStatusColor = (statusName: string): string => {
    const status = statuses.find(s => s.name === statusName);
    return status?.color || '#64748b';
  };

  const importActivities = async (importedActivities: Activity[]) => {
    if (!user) return;

    try {
      const activitiesData = importedActivities.map(activity => ({
        user_id: user.id,
        data: activity.data,
        hora: activity.hora,
        obra: activity.obra,
        site: activity.site,
        ots_osi: activity.otsOsi,
        designacao: activity.designacao,
        equipe_configuracao: activity.equipeConfiguracao,
        cidade: activity.cidade,
        empresa: activity.empresa,
        equipe: activity.equipe,
        atividade: activity.atividade,
        observacao: activity.observacao,
        status: activity.status,
      }));

      // Use insert and handle duplicates gracefully
      const { error } = await supabase
        .from('activities')
        .insert(activitiesData);

      if (error) {
        // If there are duplicate entries, try individual inserts to skip duplicates
        if (error.code === '23505') { // Unique constraint violation
          let successCount = 0;
          for (const activity of activitiesData) {
            const { error: individualError } = await supabase
              .from('activities')
              .insert([activity]);
            
            if (!individualError) {
              successCount++;
            }
          }
          await loadActivities();
          toast.success(`${successCount} atividades importadas com sucesso! ${activitiesData.length - successCount} duplicatas ignoradas.`);
        } else {
          throw error;
        }
      } else {
        await loadActivities();
        toast.success(`${importedActivities.length} atividades importadas com sucesso!`);
      }
    } catch (error) {
      console.error('Error importing activities:', error);
      toast.error('Erro ao importar atividades');
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success('Logout realizado com sucesso!');
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
    importActivities,
    user,
    loading,
    signOut,
  };
};