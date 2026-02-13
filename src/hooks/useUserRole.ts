import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

type UserRole = 'admin' | 'gerente' | 'analista';

export const useUserRole = () => {
  const [role, setRole] = useState<UserRole>('analista');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .single();

        if (!error && data) {
          setRole(data.role as UserRole);
        } else {
          // Default to admin if no role found (for existing users without role assignment)
          setRole('admin');
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRole();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        fetchRole();
      } else {
        setRole('analista');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const canManageUsers = role === 'admin';
  const canManageStatus = role === 'admin' || role === 'gerente';
  const canExport = role === 'admin' || role === 'gerente';
  const canViewReports = role === 'admin' || role === 'gerente';
  const canDeleteActivities = role === 'admin' || role === 'gerente';
  const canAccessSettings = role === 'admin';

  return {
    role,
    loading,
    canManageUsers,
    canManageStatus,
    canExport,
    canViewReports,
    canDeleteActivities,
    canAccessSettings,
  };
};