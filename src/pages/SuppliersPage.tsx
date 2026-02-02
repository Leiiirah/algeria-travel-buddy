import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AdvancedFilter } from '@/components/search/AdvancedFilter';
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
import { Plus, Building2, Phone, Mail, Edit, Trash2 } from 'lucide-react';
import { useSuppliers, useCreateSupplier, useDeleteSupplier, useUpdateSupplier } from '@/hooks/useSuppliers';
import { useActiveServiceTypes } from '@/hooks/useServiceTypes';
import { SuppliersSkeleton } from '@/components/skeletons/SuppliersSkeleton';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
import { useAuth } from '@/contexts/AuthContext';

const SuppliersPage = () => {
  const { t, i18n } = useTranslation('suppliers');
  const { t: tCommon } = useTranslation('common');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    contact: '',
    phone: '',
    email: '',
    serviceTypes: [] as string[],
  });

  // Auth hook
  const { isAdmin } = useAuth();

  // React Query hooks
  const { data: suppliers, isLoading, isError, error, refetch } = useSuppliers();
  const { data: serviceTypes } = useActiveServiceTypes();
  const createSupplier = useCreateSupplier();
  const updateSupplier = useUpdateSupplier();
  const deleteSupplier = useDeleteSupplier();

  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString(
      i18n.language === 'ar' ? 'ar-DZ' : 'fr-FR',
      { month: 'short', year: 'numeric' }
    );
  };

  // Get label for a service type code
  const getServiceTypeLabel = (code: string) => {
    const st = serviceTypes?.find(s => s.code === code);
    if (!st) return code;
    return i18n.language === 'ar' ? st.nameAr : st.nameFr;
  };

  // Build service type options from dynamic data
  const serviceTypeOptions = (serviceTypes ?? []).map(st => ({
    value: st.code,
    label: i18n.language === 'ar' ? st.nameAr : st.nameFr,
  }));

  const filteredSuppliers = (suppliers ?? []).filter((supplier) => {
    const matchesSearch =
      supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.contact.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesService =
      !filters.serviceType ||
      filters.serviceType === 'all' ||
      supplier.serviceTypes.includes(filters.serviceType);

    const matchesStatus =
      !filters.status ||
      filters.status === 'all' ||
      (filters.status === 'active' ? supplier.isActive : !supplier.isActive);

    return matchesSearch && matchesService && matchesStatus;
  });

  const handleSaveSupplier = () => {
    if (!newSupplier.name || !newSupplier.contact || !newSupplier.phone) {
      return;
    }

    const supplierData = {
      name: newSupplier.name,
      contact: newSupplier.contact,
      phone: newSupplier.phone,
      email: newSupplier.email,
      serviceTypes: newSupplier.serviceTypes,
    };

    if (editingId) {
      updateSupplier.mutate(
        { id: editingId, data: supplierData },
        {
          onSuccess: () => {
            setNewSupplier({ name: '', contact: '', phone: '', email: '', serviceTypes: [] });
            setEditingId(null);
            setIsDialogOpen(false);
          },
        }
      );
    } else {
      createSupplier.mutate(supplierData, {
        onSuccess: () => {
          setNewSupplier({ name: '', contact: '', phone: '', email: '', serviceTypes: [] });
          setIsDialogOpen(false);
        },
      });
    }
  };

  const handleEditClick = (supplier: any) => {
    setEditingId(supplier.id);
    setNewSupplier({
      name: supplier.name,
      contact: supplier.contact,
      phone: supplier.phone,
      email: supplier.email || '',
      serviceTypes: supplier.serviceTypes,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteSupplier = (supplierId: string) => {
    deleteSupplier.mutate(supplierId);
  };

  const toggleServiceType = (typeCode: string) => {
    setNewSupplier((prev) => ({
      ...prev,
      serviceTypes: prev.serviceTypes.includes(typeCode)
        ? prev.serviceTypes.filter((t) => t !== typeCode)
        : [...prev.serviceTypes, typeCode],
    }));
  };

  if (isLoading) {
    return (
      <DashboardLayout title={t('title')} subtitle={t('subtitle')}>
        <SuppliersSkeleton />
      </DashboardLayout>
    );
  }

  if (isError) {
    return (
      <DashboardLayout title={t('title')} subtitle={t('subtitle')}>
        <ErrorState message={error?.message} onRetry={refetch} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={t('title')} subtitle={t('subtitle')}>
      <Card className="border-none shadow-sm">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>{t('database.title')}</CardTitle>
              <CardDescription>
                {t('database.activeCount', { count: (suppliers ?? []).filter((s) => s.isActive).length })}
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
                      key: 'serviceType',
                      label: tCommon('service'),
                      type: 'select',
                      options: serviceTypeOptions,
                    },
                    {
                      key: 'status',
                      label: tCommon('status.label'),
                      type: 'select',
                      options: [
                        { label: tCommon('status.active'), value: 'active' },
                        { label: tCommon('status.inactive'), value: 'inactive' },
                      ],
                    },
                  ]}
                />
              </div>
              {isAdmin && (
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                  setIsDialogOpen(open);
                  if (!open) {
                    setEditingId(null);
                    setNewSupplier({ name: '', contact: '', phone: '', email: '', serviceTypes: [] });
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button onClick={() => {
                      setEditingId(null);
                      setNewSupplier({ name: '', contact: '', phone: '', email: '', serviceTypes: [] });
                    }}>
                      <Plus className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
                      {tCommon('actions.add')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-card">
                  <DialogHeader>
                    <DialogTitle>{editingId ? t('dialog.editTitle') : t('dialog.createTitle')}</DialogTitle>
                    <DialogDescription>
                      {editingId ? t('dialog.editDesc') : t('dialog.createDesc')}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>{t('form.companyName')} *</Label>
                      <Input
                        value={newSupplier.name}
                        onChange={(e) =>
                          setNewSupplier({ ...newSupplier, name: e.target.value })
                        }
                        placeholder={t('form.companyNamePlaceholder')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('form.contactPerson')} *</Label>
                      <Input
                        value={newSupplier.contact}
                        onChange={(e) =>
                          setNewSupplier({ ...newSupplier, contact: e.target.value })
                        }
                        placeholder={t('form.contactPlaceholder')}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{t('form.phone')} *</Label>
                        <Input
                          value={newSupplier.phone}
                          onChange={(e) =>
                            setNewSupplier({ ...newSupplier, phone: e.target.value })
                          }
                          placeholder={t('form.phonePlaceholder')}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t('form.email')}</Label>
                        <Input
                          type="email"
                          value={newSupplier.email}
                          onChange={(e) =>
                            setNewSupplier({ ...newSupplier, email: e.target.value })
                          }
                          placeholder={t('form.emailPlaceholder')}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>{t('form.serviceTypes')}</Label>
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
                      {tCommon('actions.cancel')}
                    </Button>
                    <Button onClick={handleSaveSupplier} disabled={createSupplier.isPending || updateSupplier.isPending}>
                      {createSupplier.isPending || updateSupplier.isPending ? tCommon('actions.saving') : (editingId ? tCommon('actions.edit') : tCommon('actions.add'))}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredSuppliers.length === 0 ? (
            <EmptyState
              title={t('empty.title')}
              description={t('empty.description')}
              icon={Building2}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('table.supplier')}</TableHead>
                  <TableHead>{t('table.contact')}</TableHead>
                  <TableHead>{t('table.coordinates')}</TableHead>
                  <TableHead>{t('table.services')}</TableHead>
                  <TableHead>{t('table.status')}</TableHead>
                  {isAdmin && <TableHead className="text-right">{t('table.actions')}</TableHead>}
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
                            {t('table.since', { date: formatDate(supplier.createdAt) })}
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
                        {supplier.isActive ? tCommon('status.active') : tCommon('status.inactive')}
                      </Badge>
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEditClick(supplier)}>
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

export default SuppliersPage;
