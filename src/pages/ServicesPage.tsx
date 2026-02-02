import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
import { Plus, Settings, FileText, Plane, Hotel, Folder } from 'lucide-react';
import { ServiceType } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { useServices, useCreateService, useUpdateService, useToggleServiceStatus } from '@/hooks/useServices';
import { useSuppliers } from '@/hooks/useSuppliers';
import { ServicesSkeleton } from '@/components/skeletons/ServicesSkeleton';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';

const ServicesPage = () => {
  const { t, i18n } = useTranslation('services');
  const { t: tCommon } = useTranslation('common');
  const { isAdmin } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [newService, setNewService] = useState({
    name: '',
    type: 'visa' as ServiceType,
    description: '',
    defaultSupplierId: '',
    defaultBuyingPrice: '',
  });

  // Only admin can access this page
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // React Query hooks
  const { data: services, isLoading, isError, error, refetch } = useServices();
  const { data: suppliers } = useSuppliers();
  const createService = useCreateService();
  const updateService = useUpdateService();
  const toggleStatus = useToggleServiceStatus();

  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString(
      i18n.language === 'ar' ? 'ar-DZ' : 'fr-FR',
      { day: '2-digit', month: 'short', year: 'numeric' }
    );
  };

  const getServiceIcon = (type: ServiceType) => {
    switch (type) {
      case 'visa':
        return FileText;
      case 'residence':
        return Hotel;
      case 'ticket':
        return Plane;
      case 'dossier':
        return Folder;
      default:
        return FileText;
    }
  };

  const handleSaveService = () => {
    if (!newService.name || !newService.description) {
      return;
    }

    const serviceData = {
      name: newService.name,
      type: newService.type,
      description: newService.description,
      defaultSupplierId: newService.defaultSupplierId || undefined,
      defaultBuyingPrice: newService.defaultBuyingPrice ? Number(newService.defaultBuyingPrice) : undefined,
    };

    if (editingServiceId) {
      updateService.mutate(
        {
          id: editingServiceId,
          data: serviceData,
        },
        {
          onSuccess: () => {
            resetForm();
            setIsDialogOpen(false);
          },
        }
      );
    } else {
      createService.mutate(
        serviceData,
        {
          onSuccess: () => {
            resetForm();
            setIsDialogOpen(false);
          },
        }
      );
    }
  };

  const handleEditService = (service: any) => {
    setEditingServiceId(service.id);
    setNewService({
      name: service.name,
      type: service.type,
      description: service.description,
      defaultSupplierId: service.defaultSupplierId || '',
      defaultBuyingPrice: service.defaultBuyingPrice?.toString() || '',
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setNewService({
      name: '',
      type: 'visa',
      description: '',
      defaultSupplierId: '',
      defaultBuyingPrice: '',
    });
    setEditingServiceId(null);
  };

  const toggleServiceStatus = (serviceId: string) => {
    toggleStatus.mutate(serviceId);
  };

  if (isLoading) {
    return (
      <DashboardLayout
        title={t('title')}
        subtitle={t('subtitle')}
      >
        <ServicesSkeleton />
      </DashboardLayout>
    );
  }

  if (isError) {
    return (
      <DashboardLayout
        title={t('title')}
        subtitle={t('subtitle')}
      >
        <ErrorState message={error?.message} onRetry={refetch} />
      </DashboardLayout>
    );
  }

  const allServices = services ?? [];

  return (
    <DashboardLayout
      title={t('title')}
      subtitle={t('subtitle')}
    >
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-muted-foreground">
            {t('activeCount', { 
              active: allServices.filter((s) => s.isActive).length,
              total: allServices.length 
            })}
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
              {t('actions.newService')}
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card">
            <DialogHeader>
              <DialogTitle>{editingServiceId ? t('dialog.editTitle') : t('dialog.createTitle')}</DialogTitle>
              <DialogDescription>
                {editingServiceId ? t('dialog.editDesc') : t('dialog.createDesc')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="serviceName">{t('form.name')}</Label>
                <Input
                  id="serviceName"
                  value={newService.name}
                  onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                  placeholder={t('form.namePlaceholder')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="serviceType">{t('form.type')}</Label>
                <Select
                  value={newService.type}
                  onValueChange={(value: ServiceType) =>
                    setNewService({ ...newService, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('form.selectType')} />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="visa">{t('types.visa')}</SelectItem>
                    <SelectItem value="residence">{t('types.residence')}</SelectItem>
                    <SelectItem value="ticket">{t('types.ticket')}</SelectItem>
                    <SelectItem value="dossier">{t('types.dossier')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="serviceDescription">{t('form.description')}</Label>
                <Textarea
                  id="serviceDescription"
                  value={newService.description}
                  onChange={(e) =>
                    setNewService({ ...newService, description: e.target.value })
                  }
                  placeholder={t('form.descriptionPlaceholder')}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                <div className="space-y-2">
                  <Label htmlFor="defaultSupplier">{t('form.defaultSupplier')}</Label>
                  <Select
                    value={newService.defaultSupplierId}
                    onValueChange={(value) =>
                      setNewService({ ...newService, defaultSupplierId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('form.selectSupplier')} />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      {suppliers?.filter(s => s.isActive).map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="defaultCost">{t('form.defaultCost')}</Label>
                  <Input
                    id="defaultCost"
                    type="number"
                    value={newService.defaultBuyingPrice}
                    onChange={(e) =>
                      setNewService({ ...newService, defaultBuyingPrice: e.target.value })
                    }
                    placeholder={t('form.costPlaceholder')}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                {tCommon('actions.cancel')}
              </Button>
              <Button onClick={handleSaveService} disabled={createService.isPending || updateService.isPending}>
                {createService.isPending || updateService.isPending ? t('actions.saving') : (editingServiceId ? t('actions.edit') : t('actions.create'))}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {allServices.length === 0 ? (
        <EmptyState
          title={t('empty.title')}
          description={t('empty.description')}
          icon={FileText}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {allServices.map((service) => {
            const IconComponent = getServiceIcon(service.type);
            return (
              <Card
                key={service.id}
                className={`border-none shadow-sm transition-opacity ${!service.isActive ? 'opacity-60' : ''
                  }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <IconComponent className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{service.name}</CardTitle>
                        <Badge variant="outline" className="mt-1">
                          {t(`types.${service.type}`)}
                        </Badge>
                      </div>
                    </div>
                    <Switch
                      checked={service.isActive}
                      onCheckedChange={() => toggleServiceStatus(service.id)}
                      disabled={toggleStatus.isPending}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{service.description}</p>
                  <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {t('card.createdAt', { date: formatDate(service.createdAt) })}
                    </span>
                    <Button variant="ghost" size="sm" onClick={() => handleEditService(service)}>
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
};

export default ServicesPage;
