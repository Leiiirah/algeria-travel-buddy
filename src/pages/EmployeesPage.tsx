import { useState } from 'react';
import { AdvancedFilter } from '@/components/search/AdvancedFilter';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Search, Mail, Shield, UserCheck, UserX, Users, Pencil } from 'lucide-react';
import { UserRole } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useUsers, useCreateUser, useToggleUserStatus, useUpdateUser } from '@/hooks/useUsers';
import { EmployeesSkeleton } from '@/components/skeletons/EmployeesSkeleton';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
import { User } from '@/types';

const EmployeesPage = () => {
  const { isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'employee' as UserRole,
  });
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'employee' as UserRole,
  });

  // React Query hooks
  const { data: users, isLoading, isError, error, refetch } = useUsers();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const toggleStatus = useToggleUserStatus();

  const filteredUsers = (users ?? []).filter((user) => {
    const matchesSearch =
      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole =
      !filters.role ||
      filters.role === 'all' ||
      user.role === filters.role;

    const matchesStatus =
      !filters.status ||
      filters.status === 'all' ||
      (filters.status === 'active' ? user.isActive : !user.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleAddUser = () => {
    if (!newUser.firstName || !newUser.lastName || !newUser.email || !newUser.password) {
      return;
    }

    createUser.mutate(
      {
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        password: newUser.password,
        role: newUser.role,
      },
      {
        onSuccess: () => {
          setNewUser({ firstName: '', lastName: '', email: '', password: '', role: 'employee' });
          setIsDialogOpen(false);
        },
      }
    );
  };

  const toggleUserStatus = (userId: string) => {
    toggleStatus.mutate(userId);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setEditForm({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: '',
      role: user.role,
    });
    setIsEditOpen(true);
  };

  const handleUpdate = () => {
    if (!editingUser || !editForm.firstName || !editForm.lastName || !editForm.email) return;

    updateUser.mutate(
      {
        id: editingUser.id,
        data: {
          ...editForm,
          password: editForm.password || undefined,
        },
      },
      {
        onSuccess: () => {
          setIsEditOpen(false);
          setEditingUser(null);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Employés" subtitle="Gestion des comptes utilisateurs">
        <EmployeesSkeleton />
      </DashboardLayout>
    );
  }

  if (isError) {
    return (
      <DashboardLayout title="Employés" subtitle="Gestion des comptes utilisateurs">
        <ErrorState message={error?.message} onRetry={refetch} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Employés" subtitle="Gestion des comptes utilisateurs">
      <Card className="border-none shadow-sm">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Annuaire des employés</CardTitle>
              <CardDescription>
                {(users ?? []).length} employés enregistrés
              </CardDescription>
            </div>
            <div className="flex gap-3 items-center">
              <div className="w-[450px]">
                <AdvancedFilter
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  filters={filters}
                  onFilterChange={setFilters}
                  filterConfig={[
                    {
                      key: 'role',
                      label: 'Rôle',
                      type: 'select',
                      options: [
                        { label: 'Administrateur', value: 'admin' },
                        { label: 'Employé', value: 'employee' },
                      ],
                    },
                    {
                      key: 'status',
                      label: 'Statut',
                      type: 'select',
                      options: [
                        { label: 'Actif', value: 'active' },
                        { label: 'Inactif', value: 'inactive' },
                      ],
                    },
                  ]}
                />
              </div>
              {isAdmin && (
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Ajouter
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-card">
                    <DialogHeader>
                      <DialogTitle>Nouvel employé</DialogTitle>
                      <DialogDescription>
                        Ajoutez un nouvel utilisateur au système
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">Prénom</Label>
                          <Input
                            id="firstName"
                            value={newUser.firstName}
                            onChange={(e) =>
                              setNewUser({ ...newUser, firstName: e.target.value })
                            }
                            placeholder="Prénom"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Nom</Label>
                          <Input
                            id="lastName"
                            value={newUser.lastName}
                            onChange={(e) =>
                              setNewUser({ ...newUser, lastName: e.target.value })
                            }
                            placeholder="Nom"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={newUser.email}
                          onChange={(e) =>
                            setNewUser({ ...newUser, email: e.target.value })
                          }
                          placeholder="email@agence.dz"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Mot de passe</Label>
                        <Input
                          id="password"
                          type="password"
                          value={newUser.password}
                          onChange={(e) =>
                            setNewUser({ ...newUser, password: e.target.value })
                          }
                          placeholder="Mot de passe"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role">Rôle</Label>
                        <Select
                          value={newUser.role}
                          onValueChange={(value: UserRole) =>
                            setNewUser({ ...newUser, role: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un rôle" />
                          </SelectTrigger>
                          <SelectContent className="bg-popover">
                            <SelectItem value="employee">Employé</SelectItem>
                            <SelectItem value="admin">Administrateur</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Annuler
                      </Button>
                      <Button onClick={handleAddUser} disabled={createUser.isPending}>
                        {createUser.isPending ? 'Ajout...' : 'Ajouter'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}

              <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="bg-card">
                  <DialogHeader>
                    <DialogTitle>Modifier l'employé</DialogTitle>
                    <DialogDescription>
                      Modifiez les informations de l'utilisateur
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-firstName">Prénom</Label>
                        <Input
                          id="edit-firstName"
                          value={editForm.firstName}
                          onChange={(e) =>
                            setEditForm({ ...editForm, firstName: e.target.value })
                          }
                          placeholder="Prénom"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-lastName">Nom</Label>
                        <Input
                          id="edit-lastName"
                          value={editForm.lastName}
                          onChange={(e) =>
                            setEditForm({ ...editForm, lastName: e.target.value })
                          }
                          placeholder="Nom"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-email">Email</Label>
                      <Input
                        id="edit-email"
                        type="email"
                        value={editForm.email}
                        onChange={(e) =>
                          setEditForm({ ...editForm, email: e.target.value })
                        }
                        placeholder="email@agence.dz"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-password">Mot de passe (laisser vide pour ne pas changer)</Label>
                      <Input
                        id="edit-password"
                        type="password"
                        value={editForm.password}
                        onChange={(e) =>
                          setEditForm({ ...editForm, password: e.target.value })
                        }
                        placeholder="Nouveau mot de passe"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-role">Rôle</Label>
                      <Select
                        value={editForm.role}
                        onValueChange={(value: UserRole) =>
                          setEditForm({ ...editForm, role: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un rôle" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover">
                          <SelectItem value="employee">Employé</SelectItem>
                          <SelectItem value="admin">Administrateur</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                      Annuler
                    </Button>
                    <Button onClick={handleUpdate} disabled={updateUser.isPending}>
                      {updateUser.isPending ? 'Modification...' : 'Enregistrer'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <EmptyState
              title="Aucun employé"
              description="Ajoutez votre premier employé"
              icon={Users}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employé</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date d'ajout</TableHead>
                  {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                          {user.firstName[0]}
                          {user.lastName[0]}
                        </div>
                        <div>
                          <p className="font-medium">
                            {user.firstName} {user.lastName}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        {user.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <span className="capitalize">
                          {user.role === 'admin' ? 'Administrateur' : 'Employé'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.isActive ? 'default' : 'secondary'}>
                        {user.isActive ? 'Actif' : 'Inactif'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleUserStatus(user.id)}
                          disabled={toggleStatus.isPending}
                        >
                          {user.isActive ? (
                            <UserX className="h-4 w-4 text-destructive" />
                          ) : (
                            <UserCheck className="h-4 w-4 text-success" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditUser(user)}
                        >
                          <Pencil className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default EmployeesPage;
