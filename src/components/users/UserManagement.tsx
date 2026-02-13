import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Edit, Trash2, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'gerente' | 'analista';
  created_at: string;
}

export function UserManagement() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [newUser, setNewUser] = useState({
    email: '',
    name: '',
    role: 'analista' as const,
    password: ''
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, name, created_at');

      if (profilesError) throw profilesError;

      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      const usersWithRoles = profiles?.map((profile: any) => {
        const userRole = roles?.find(r => r.user_id === profile.id);
        return {
          ...profile,
          role: userRole?.role || 'analista'
        };
      }) || [];

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const callManageUsers = async (payload: Record<string, any>) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error('Sessão expirada. Faça login novamente.');
      return null;
    }

    const { data, error } = await supabase.functions.invoke('manage-users', {
      body: payload,
    });

    if (error) {
      throw new Error(error.message || 'Erro na operação');
    }

    if (data?.error) {
      throw new Error(data.error);
    }

    return data;
  };

  const handleAddUser = async () => {
    if (!newUser.email || !newUser.password) {
      toast.error('Email e senha são obrigatórios');
      return;
    }

    setLoading(true);
    try {
      await callManageUsers({
        action: 'create',
        email: newUser.email,
        password: newUser.password,
        name: newUser.name || newUser.email,
        role: newUser.role,
      });

      toast.success('Usuário criado com sucesso');
      setIsAddDialogOpen(false);
      setNewUser({ email: '', name: '', role: 'analista', password: '' });
      loadUsers();
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast.error(error.message || 'Erro ao criar usuário');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    setLoading(true);
    try {
      // Update profile via direct query (RLS allows)
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ name: editingUser.name, email: editingUser.email })
        .eq('id', editingUser.id);

      if (profileError) throw profileError;

      // Update role via edge function
      await callManageUsers({
        action: 'update-role',
        userId: editingUser.id,
        role: editingUser.role,
      });

      toast.success('Usuário atualizado com sucesso');
      setEditingUser(null);
      loadUsers();
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast.error(error.message || 'Erro ao atualizar usuário');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    setLoading(true);
    try {
      await callManageUsers({
        action: 'delete',
        userId,
      });

      toast.success('Usuário excluído com sucesso');
      loadUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error(error.message || 'Erro ao excluir usuário');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'gerente': return 'default';
      case 'analista': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Gerenciamento de Usuários
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Adicionar Usuário
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Novo Usuário</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="usuario@exemplo.com"
                  />
                </div>
                <div>
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={newUser.name}
                    onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Nome do usuário"
                  />
                </div>
                <div>
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Senha temporária"
                  />
                </div>
                <div>
                  <Label htmlFor="role">Tipo de Usuário</Label>
                  <Select value={newUser.role} onValueChange={(value: any) => setNewUser(prev => ({ ...prev, role: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="analista">Analista</SelectItem>
                      <SelectItem value="gerente">Gerente</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleAddUser} disabled={loading}>
                    {loading ? 'Criando...' : 'Criar Usuário'}
                  </Button>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={getRoleBadgeVariant(user.role)}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(user.created_at).toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingUser(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Editar Usuário</DialogTitle>
                        </DialogHeader>
                        {editingUser && (
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="edit-name">Nome</Label>
                              <Input
                                id="edit-name"
                                value={editingUser.name}
                                onChange={(e) => setEditingUser(prev => prev ? { ...prev, name: e.target.value } : null)}
                              />
                            </div>
                            <div>
                              <Label htmlFor="edit-role">Tipo de Usuário</Label>
                              <Select value={editingUser.role} onValueChange={(value: any) => setEditingUser(prev => prev ? { ...prev, role: value } : null)}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="analista">Analista</SelectItem>
                                  <SelectItem value="gerente">Gerente</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex gap-2 pt-4">
                              <Button onClick={handleUpdateUser} disabled={loading}>
                                {loading ? 'Salvando...' : 'Salvar'}
                              </Button>
                              <Button variant="outline" onClick={() => setEditingUser(null)}>
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir o usuário "{user.name}"? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}