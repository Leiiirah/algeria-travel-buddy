import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import { Plus, Building2, Phone, Mail, Edit, Trash2, MapPin, Plane, Hotel, FileText, Truck, Shield, MoreHorizontal, ToggleLeft, ToggleRight } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useSuppliers, useCreateSupplier, useDeleteSupplier, useUpdateSupplier } from '@/hooks/useSuppliers';
import { SuppliersSkeleton } from '@/components/skeletons/SuppliersSkeleton';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
import { useAuth } from '@/contexts/AuthContext';
import { SupplierType } from '@/types';

const SUPPLIER_TYPES: SupplierType[] = ['airline', 'hotel', 'visa', 'transport', 'insurance', 'other'];
const CURRENCIES = ['DZD', 'EUR', 'USD', 'SAR', 'AED', 'TRY', 'GBP'];

const getSupplierTypeIcon = (type: SupplierType) => {
  switch (type) {
    case 'airline': return Plane;
    case 'hotel': return Hotel;
    case 'visa': return FileText;
    case 'transport': return Truck;
    case 'insurance': return Shield;
    default: return MoreHorizontal;
  }
};

const SuppliersPage = () => {
  const { t, i18n } = useTranslation('suppliers');
  const { t: tCommon } = useTranslation('common');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [supplierToDelete, setSupplierToDelete] = useState<string | null>(null);
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    type: 'other' as SupplierType,
    country: '',
    city: '',
    phone: '',
    email: '',
    contact: '',
    currency: 'DZD',
    bankAccount: '',
  });

  const { isAdmin } = useAuth();
  const { data: suppliers, isLoading, isError, error, refetch } = useSuppliers();
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

  const supplierTypeOptions = SUPPLIER_TYPES.map(type => ({
    value: type,
    label: t(`types.${type}`),
  }));

  const filteredSuppliers = (suppliers ?? []).filter((supplier) => {
    const matchesSearch =
      supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (supplier.contact?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (supplier.country?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (supplier.city?.toLowerCase() || '').includes(searchQuery.toLowerCase());

    const matchesType =
      !filters.type ||
      filters.type === 'all' ||
      supplier.type === filters.type;

    const matchesStatus =
      !filters.status ||
      filters.status === 'all' ||
      (filters.status === 'active' ? supplier.isActive : !supplier.isActive);

    return matchesSearch && matchesType && matchesStatus;
  });

  const handleSaveSupplier = () => {
    if (!newSupplier.name) {
      return;
    }

    const supplierData = {
      name: newSupplier.name,
      type: newSupplier.type,
      country: newSupplier.country || undefined,
      city: newSupplier.city || undefined,
      phone: newSupplier.phone || undefined,
      email: newSupplier.email || undefined,
      contact: newSupplier.contact || undefined,
      currency: newSupplier.currency,
      bankAccount: newSupplier.bankAccount || undefined,
    };

    if (editingId) {
      updateSupplier.mutate(
        { id: editingId, data: supplierData },
        {
          onSuccess: () => {
            resetForm();
            setIsDialogOpen(false);
          },
        }
      );
    } else {
      createSupplier.mutate(supplierData, {
        onSuccess: () => {
          resetForm();
          setIsDialogOpen(false);
        },
      });
    }
  };

  const resetForm = () => {
    setNewSupplier({
      name: '',
      type: 'other',
      country: '',
      city: '',
      phone: '',
      email: '',
      contact: '',
      currency: 'DZD',
      bankAccount: '',
    });
    setEditingId(null);
  };

  const handleEditClick = (supplier: any) => {
    setEditingId(supplier.id);
    setNewSupplier({
      name: supplier.name,
      type: supplier.type || 'other',
      country: supplier.country || '',
      city: supplier.city || '',
      phone: supplier.phone || '',
      email: supplier.email || '',
      contact: supplier.contact || '',
      currency: supplier.currency || 'DZD',
      bankAccount: supplier.bankAccount || '',
    });
    setIsDialogOpen(true);
  };

  const handleDeleteSupplier = (supplierId: string) => {
    setSupplierToDelete(supplierId);
  };

  const handleConfirmDelete = () => {
    if (supplierToDelete) {
      deleteSupplier.mutate(supplierToDelete, {
        onSuccess: () => setSupplierToDelete(null),
        onError: () => setSupplierToDelete(null),
      });
    }
  };

  const handleToggleActive = (supplier: any) => {
    updateSupplier.mutate({ id: supplier.id, data: { isActive: !supplier.isActive } });
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
                      key: 'type',
                      label: t('form.type'),
                      type: 'select',
                      options: supplierTypeOptions,
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
                  if (!open) resetForm();
                }}>
                  <DialogTrigger asChild>
                    <Button onClick={() => resetForm()}>
                      <Plus className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
                      {tCommon('actions.add')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-card max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{editingId ? t('dialog.editTitle') : t('dialog.createTitle')}</DialogTitle>
                      <DialogDescription>
                        {editingId ? t('dialog.editDesc') : t('dialog.createDesc')}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                      {/* General Information */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                          {t('form.sections.general')}
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>{t('form.companyName')} *</Label>
                            <Input
                              value={newSupplier.name}
                              onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                              placeholder={t('form.companyNamePlaceholder')}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>{t('form.type')} *</Label>
                            <Select
                              value={newSupplier.type}
                              onValueChange={(value) => setNewSupplier({ ...newSupplier, type: value as SupplierType })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder={t('form.typePlaceholder')} />
                              </SelectTrigger>
                              <SelectContent>
                                {SUPPLIER_TYPES.map((type) => (
                                  <SelectItem key={type} value={type}>
                                    {t(`types.${type}`)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      {/* Location */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                          {t('form.sections.location')}
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>{t('form.country')}</Label>
                            <Input
                              value={newSupplier.country}
                              onChange={(e) => setNewSupplier({ ...newSupplier, country: e.target.value })}
                              placeholder={t('form.countryPlaceholder')}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>{t('form.city')}</Label>
                            <Input
                              value={newSupplier.city}
                              onChange={(e) => setNewSupplier({ ...newSupplier, city: e.target.value })}
                              placeholder={t('form.cityPlaceholder')}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Contact */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                          {t('form.sections.contact')}
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>{t('form.phone')}</Label>
                            <Input
                              value={newSupplier.phone}
                              onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                              placeholder={t('form.phonePlaceholder')}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>{t('form.email')}</Label>
                            <Input
                              type="email"
                              value={newSupplier.email}
                              onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
                              placeholder={t('form.emailPlaceholder')}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>{t('form.contactPerson')}</Label>
                          <Input
                            value={newSupplier.contact}
                            onChange={(e) => setNewSupplier({ ...newSupplier, contact: e.target.value })}
                            placeholder={t('form.contactPlaceholder')}
                          />
                        </div>
                      </div>

                      {/* Banking */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                          {t('form.sections.banking')}
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>{t('form.currency')}</Label>
                            <Select
                              value={newSupplier.currency}
                              onValueChange={(value) => setNewSupplier({ ...newSupplier, currency: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder={t('form.currencyPlaceholder')} />
                              </SelectTrigger>
                              <SelectContent>
                                {CURRENCIES.map((currency) => (
                                  <SelectItem key={currency} value={currency}>
                                    {currency} - {t(`currencies.${currency}`)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>{t('form.bankAccount')}</Label>
                            <Input
                              value={newSupplier.bankAccount}
                              onChange={(e) => setNewSupplier({ ...newSupplier, bankAccount: e.target.value })}
                              placeholder={t('form.bankAccountPlaceholder')}
                            />
                          </div>
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
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('table.supplier')}</TableHead>
                  <TableHead>{t('table.location')}</TableHead>
                  <TableHead>{t('table.coordinates')}</TableHead>
                  <TableHead>{t('table.contact')}</TableHead>
                  <TableHead>{t('table.currency')}</TableHead>
                  <TableHead>{t('table.status')}</TableHead>
                  {isAdmin && <TableHead className="text-right">{t('table.actions')}</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSuppliers.map((supplier) => {
                  const TypeIcon = getSupplierTypeIcon(supplier.type as SupplierType);
                  return (
                    <TableRow key={supplier.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <TypeIcon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{supplier.name}</p>
                            <Badge variant="outline" className="text-xs mt-1">
                              {t(`types.${supplier.type || 'other'}`)}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {(supplier.country || supplier.city) ? (
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span>
                              {[supplier.city, supplier.country].filter(Boolean).join(', ')}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {supplier.phone && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              {supplier.phone}
                            </div>
                          )}
                          {supplier.email && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              {supplier.email}
                            </div>
                          )}
                          {!supplier.phone && !supplier.email && (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {supplier.contact ? (
                          <p className="font-medium">{supplier.contact}</p>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{supplier.currency || 'DZD'}</Badge>
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
                              onClick={() => handleToggleActive(supplier)}
                              disabled={updateSupplier.isPending}
                              title={supplier.isActive ? tCommon('companies.deactivate') : tCommon('companies.activate')}
                            >
                              {supplier.isActive
                                ? <ToggleRight className="h-4 w-4 text-primary" />
                                : <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                              }
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
                  );
                })}
              </TableBody>
            </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!supplierToDelete} onOpenChange={(open) => { if (!open) setSupplierToDelete(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tCommon('actions.confirmDeleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{tCommon('actions.confirmDeleteMessage')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon('actions.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteSupplier.isPending}
            >
              {tCommon('actions.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default SuppliersPage;
