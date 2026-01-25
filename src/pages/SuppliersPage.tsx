import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Search, Building2, Phone, Mail, Edit, Trash2 } from 'lucide-react';
import { getServiceTypeLabel } from '@/lib/mock-data';
import { ServiceType } from '@/types';
import { useSuppliers, useCreateSupplier, useDeleteSupplier } from '@/hooks/useSuppliers';
import { SuppliersSkeleton } from '@/components/skeletons/SuppliersSkeleton';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';

const SuppliersPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    contact: '',
    phone: '',
    email: '',
    serviceTypes: [] as ServiceType[],
  });

  // React Query hooks
  const { data: suppliers, isLoading, isError, error, refetch } = useSuppliers();
  const createSupplier = useCreateSupplier();
  const deleteSupplier = useDeleteSupplier();

  const filteredSuppliers = (suppliers ?? []).filter(
    (supplier) =>
      supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.contact.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const serviceTypeOptions: { value: ServiceType; label: string }[] = [
    { value: 'visa', label: 'Visa' },
    { value: 'residence', label: 'Résidence / Hôtel' },
    { value: 'ticket', label: 'Billetterie' },
    { value: 'dossier', label: 'Traitement de dossier' },
  ];

  const handleAddSupplier = () => {
    if (!newSupplier.name || !newSupplier.contact || !newSupplier.phone) {
      return;
    }

    createSupplier.mutate(
      {
        name: newSupplier.name,
        contact: newSupplier.contact,
        phone: newSupplier.phone,
        email: newSupplier.email,
        serviceTypes: newSupplier.serviceTypes,
      },
      {
        onSuccess: () => {
          setNewSupplier({ name: '', contact: '', phone: '', email: '', serviceTypes: [] });
          setIsDialogOpen(false);
        },
      }
    );
  };

  const handleDeleteSupplier = (supplierId: string) => {
    deleteSupplier.mutate(supplierId);
  };

  const toggleServiceType = (type: ServiceType) => {
    setNewSupplier((prev) => ({
      ...prev,
      serviceTypes: prev.serviceTypes.includes(type)
        ? prev.serviceTypes.filter((t) => t !== type)
        : [...prev.serviceTypes, type],
    }));
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Fournisseurs" subtitle="Gestion des partenaires et fournisseurs">
        <SuppliersSkeleton />
      </DashboardLayout>
    );
  }

  if (isError) {
    return (
      <DashboardLayout title="Fournisseurs" subtitle="Gestion des partenaires et fournisseurs">
        <ErrorState message={error?.message} onRetry={refetch} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Fournisseurs" subtitle="Gestion des partenaires et fournisseurs">
      <Card className="border-none shadow-sm">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Base de données fournisseurs</CardTitle>
              <CardDescription>
                {(suppliers ?? []).filter((s) => s.isActive).length} fournisseurs actifs
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
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card">
                  <DialogHeader>
                    <DialogTitle>Nouveau fournisseur</DialogTitle>
                    <DialogDescription>
                      Ajoutez un nouveau partenaire à votre réseau
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Nom de l'entreprise *</Label>
                      <Input
                        value={newSupplier.name}
                        onChange={(e) =>
                          setNewSupplier({ ...newSupplier, name: e.target.value })
                        }
                        placeholder="Nom du fournisseur"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Personne de contact *</Label>
                      <Input
                        value={newSupplier.contact}
                        onChange={(e) =>
                          setNewSupplier({ ...newSupplier, contact: e.target.value })
                        }
                        placeholder="Nom du contact"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Téléphone *</Label>
                        <Input
                          value={newSupplier.phone}
                          onChange={(e) =>
                            setNewSupplier({ ...newSupplier, phone: e.target.value })
                          }
                          placeholder="+213 555 123 456"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={newSupplier.email}
                          onChange={(e) =>
                            setNewSupplier({ ...newSupplier, email: e.target.value })
                          }
                          placeholder="contact@fournisseur.dz"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Types de services</Label>
                      <div className="grid grid-cols-2 gap-3">
                        {serviceTypeOptions.map((option) => (
                          <div
                            key={option.value}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={option.value}
                              checked={newSupplier.serviceTypes.includes(option.value)}
                              onCheckedChange={() => toggleServiceType(option.value)}
                            />
                            <label
                              htmlFor={option.value}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {option.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Annuler
                    </Button>
                    <Button onClick={handleAddSupplier} disabled={createSupplier.isPending}>
                      {createSupplier.isPending ? 'Ajout...' : 'Ajouter'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredSuppliers.length === 0 ? (
            <EmptyState
              title="Aucun fournisseur"
              description="Ajoutez votre premier fournisseur"
              icon={Building2}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fournisseur</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Coordonnées</TableHead>
                  <TableHead>Services</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSuppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <Building2 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{supplier.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Depuis{' '}
                            {new Date(supplier.createdAt).toLocaleDateString('fr-FR', {
                              month: 'short',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{supplier.contact}</p>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {supplier.phone}
                        </div>
                        {supplier.email && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {supplier.email}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {supplier.serviceTypes.map((type) => (
                          <Badge key={type} variant="outline" className="text-xs">
                            {getServiceTypeLabel(type)}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={supplier.isActive ? 'default' : 'secondary'}>
                        {supplier.isActive ? 'Actif' : 'Inactif'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteSupplier(supplier.id)}
                          disabled={deleteSupplier.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
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

export default SuppliersPage;
