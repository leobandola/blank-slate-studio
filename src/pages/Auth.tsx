import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { LogIn, UserPlus } from 'lucide-react';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate('/');
      }
    });

    // Check for existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const createAdminUser = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-admin-user');
      if (error) {
        console.error('Error creating admin user:', error);
      } else {
        console.log('Admin user created:', data);
      }
    } catch (error) {
      console.error('Failed to create admin user:', error);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Por favor, preencha email e senha');
      return;
    }
    
    setLoading(true);

    try {
      // Implementar timeout para evitar travamento
      const loginPromise = supabase.auth.signInWithPassword({
        email,
        password,
      });

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Login timeout')), 15000)
      );

      const { error } = await Promise.race([loginPromise, timeoutPromise]) as any;

      if (error) {
        // If invalid credentials and trying with admin user, create it first
        if (error.message === 'Invalid login credentials' && email === 'leolmo@gmail.com') {
          toast.info('Criando usuário administrador...');
          await createAdminUser();
          
          // Try login again with timeout
          const retryPromise = supabase.auth.signInWithPassword({
            email,
            password,
          });
          
          const retryTimeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Retry login timeout')), 15000)
          );

          const { error: retryError } = await Promise.race([retryPromise, retryTimeoutPromise]) as any;
          
          if (retryError) {
            if (retryError.message === 'Retry login timeout') {
              toast.error('Timeout no login. Tente novamente.');
            } else {
              toast.error(retryError.message);
            }
          } else {
            toast.success('Login realizado com sucesso!');
          }
        } else if (error.message === 'Login timeout') {
          toast.error('Timeout no login. Verifique sua conexão e tente novamente.');
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success('Login realizado com sucesso!');
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      if (error.message?.includes('timeout')) {
        toast.error('Timeout no login. Verifique sua conexão e tente novamente.');
      } else {
        toast.error('Erro inesperado. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-elegant">
        <CardHeader className="bg-gradient-secondary text-center">
          <CardTitle className="text-2xl font-bold text-primary">
            Login
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Digite seu e-mail"
              />
            </div>

            <div>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Digite sua senha"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              variant="hero"
              disabled={loading}
            >
              {loading ? (
                'Aguarde...'
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Entrar
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;