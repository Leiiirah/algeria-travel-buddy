import { useState } from 'react';
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
import { Plus, Search, UserCircle, Mail, Shield, UserCheck, UserX } from 'lucide-react';
import { mockUsers } from '@/lib/mock-data';
import { User, UserRole } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const EmployeesPage = () => {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'employee' as UserRole,
  });

  const filteredUsers = users.filter(
    (user) =>
      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddUser = () => {
    if (!newUser.firstName || !newUser.lastName || !newUser.email) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs',
        variant: 'destructive',
      });
      return;
    }

    const user: User = {
      id: String(users.length + 1),
      ...newUser,
      createdAt: new Date(),
      isActive: true,
    };

    setUsers([...users, user]);
    setNewUser({ firstName: '', lastName: '', email: '', role: 'employee' });
    setIsDialogOpen(false);
    toast({
      title: 'Employé ajouté',
      description: `${user.firstName} ${user.lastName} a été ajouté avec succès`,
    });
  };

  const toggleUserStatus = (userId: string) => {
    setUsers(
      users.map((user) =>
        user.id === userId ? { ...user, isActive: !user.isActive } : user
      )
    );
    const user = users.find((u) => u.id === userId);
    toast({
      title: user?.isActive ? 'Compte désactivé' : 'Compte activé',
      description: `Le compte de ${user?.firstName} ${user?.lastName} a été ${
        user?.isActive ? 'désactivé' : 'activé'
      }`,
    });
  };

  return (
    <DashboardLayout title="Employés" subtitle="Gestion des comptes utilisateurs">
      <Card className="border-none shadow-sm">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Annuaire des employés</CardTitle>
              <CardDescription>
                {users.length} employés enregistrés
              </CardDescription>
            </div>
            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-9"
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
                      <Button onClick={handleAddUser}>Ajouter</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
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
                    {user.createdAt.toLocaleDateString('fr-FR', {
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
                      >
                        {user.isActive ? (
                          <UserX className="h-4 w-4 text-destructive" />
                        ) : (
                          <UserCheck className="h-4 w-4 text-success" />
                        )}
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default EmployeesPage;
