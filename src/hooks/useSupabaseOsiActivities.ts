import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { OsiActivity } from '@/types/osiActivity';
import { toast } from 'sonner';

export const useSupabaseOsiActivities = () => {
  const [osiActivities, setOsiActivities] = useState<OsiActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Fetch user session
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const loadOsiActivities = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('osi_activities')
        .select('*')
        .eq('user_id', user.id)
        .order('data', { ascending: false });

      if (error) throw error;

      const formattedData = data?.map(activity => ({
        id: activity.id,
        data: activity.data,
        obra: activity.obra,
        atividade: activity.atividade,
        osi: activity.osi,
        ativacao: activity.ativacao,
        equipe_campo: activity.equipe_campo,
        equipe_configuracao: activity.equipe_configuracao,
        obs: activity.obs || '',
        status: activity.status || 'PENDENTE',
        user_id: activity.user_id
      })) || [];

      setOsiActivities(formattedData);
    } catch (error) {
      console.error('Error fetching OSI activities:', error);
      toast.error('Erro ao carregar atividades OSI');
    } finally {
      setLoading(false);
    }
  };

  // Fetch OSI activities
  useEffect(() => {
    if (user) {
      loadOsiActivities();
    }
  }, [user]);

  const addOsiActivity = async (activity: Omit<OsiActivity, 'id'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('osi_activities')
        .insert([{
          ...activity,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      const newActivity = {
        id: data.id,
        data: data.data,
        obra: data.obra,
        atividade: data.atividade,
        osi: data.osi,
        ativacao: data.ativacao,
        equipe_campo: data.equipe_campo,
        equipe_configuracao: data.equipe_configuracao,
        obs: data.obs || '',
        status: data.status || 'PENDENTE',
        user_id: data.user_id
      };

      setOsiActivities(prev => [newActivity, ...prev]);
      toast.success('Atividade OSI adicionada com sucesso');
    } catch (error) {
      console.error('Error adding OSI activity:', error);
      toast.error('Erro ao adicionar atividade OSI');
    }
  };

  const updateOsiActivity = async (id: string, updates: Partial<OsiActivity>) => {
    try {
      const { error } = await supabase
        .from('osi_activities')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setOsiActivities(prev => 
        prev.map(activity => 
          activity.id === id ? { ...activity, ...updates } : activity
        )
      );

      toast.success('Atividade OSI atualizada com sucesso');
    } catch (error) {
      console.error('Error updating OSI activity:', error);
      toast.error('Erro ao atualizar atividade OSI');
    }
  };

  const deleteOsiActivity = async (id: string) => {
    try {
      const { error } = await supabase
        .from('osi_activities')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setOsiActivities(prev => prev.filter(activity => activity.id !== id));
      toast.success('Atividade OSI removida com sucesso');
    } catch (error) {
      console.error('Error deleting OSI activity:', error);
      toast.error('Erro ao remover atividade OSI');
    }
  };

  const importOsiActivities = async (activities: OsiActivity[]) => {
    if (!user) return;

    try {
      const activitiesWithUserId = activities.map(activity => ({
        ...activity,
        user_id: user.id
      }));

      // Use insert and handle duplicates gracefully
      const { error } = await supabase
        .from('osi_activities')
        .insert(activitiesWithUserId);

      if (error) {
        // If there are duplicate entries, try individual inserts to skip duplicates
        if (error.code === '23505') { // Unique constraint violation
          let successCount = 0;
          for (const activity of activitiesWithUserId) {
            const { error: individualError } = await supabase
              .from('osi_activities')
              .insert([activity]);
            
            if (!individualError) {
              successCount++;
            }
          }
          await loadOsiActivities();
          toast.success(`${successCount} atividades OSI importadas com sucesso! ${activitiesWithUserId.length - successCount} duplicatas ignoradas.`);
        } else {
          throw error;
        }
      } else {
        // Reload all OSI activities instead of just adding new ones
        await loadOsiActivities();
        toast.success(`${activities.length} atividades OSI importadas com sucesso`);
      }
    } catch (error) {
      console.error('Error importing OSI activities:', error);
      toast.error('Erro ao importar atividades OSI');
    }
  };

  return {
    osiActivities,
    loading,
    user,
    addOsiActivity,
    updateOsiActivity,
    deleteOsiActivity,
    importOsiActivities
  };
};