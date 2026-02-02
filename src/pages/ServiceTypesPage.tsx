import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Plus, Settings, FileText, Plane, Hotel, Folder, Ship, Bus, Ticket, Globe, CreditCard, Briefcase, MapPin, Users, Package, icons } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { useServiceTypes, useCreateServiceType, useUpdateServiceType, useToggleServiceTypeStatus } from '@/hooks/useServiceTypes';
import { ServicesSkeleton } from '@/components/skeletons/ServicesSkeleton';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
import { ServiceTypeEntity } from '@/types';

// Available icons for selection
const availableIcons = [
  { name: 'FileText', icon: FileText },
  { name: 'Plane', icon: Plane },
  { name: 'Hotel', icon: Hotel },
  { name: 'Folder', icon: Folder },
  { name: 'Ship', icon: Ship },
  { name: 'Bus', icon: Bus },
  { name: 'Ticket', icon: Ticket },
  { name: 'Globe', icon: Globe },
  { name: 'CreditCard', icon: CreditCard },
  { name: 'Briefcase', icon: Briefcase },
  { name: 'MapPin', icon: MapPin },
  { name: 'Users', icon: Users },
  { name: 'Package', icon: Package },
];

const getIconComponent = (iconName: string) => {
  const found = availableIcons.find(i => i.name === iconName);
  return found?.icon || FileText;
};

const ServiceTypesPage = () => {
  const { t, i18n } = useTranslation('serviceTypes');
  const { t: tCommon } = useTranslation('common');
  const { isAdmin } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    nameFr: '',
    nameAr: '',
    icon: 'FileText',
  });

  // Only admin can access this page
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // React Query hooks
  const { data: serviceTypes, isLoading, isError, error, refetch } = useServiceTypes();
  const createServiceType = useCreateServiceType();
  const updateServiceType = useUpdateServiceType();
  const toggleStatus = useToggleServiceTypeStatus();

  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString(
      i18n.language === 'ar' ? 'ar-DZ' : 'fr-FR',
      { day: '2-digit', month: 'short', year: 'numeric' }
    );
  };

  const handleSave = () => {
    if (!formData.code || !formData.nameFr || !formData.nameAr) {
      return;
    }

    const data = {
      code: formData.code.toLowerCase().replace(/\s+/g, '_'),
      nameFr: formData.nameFr,
      nameAr: formData.nameAr,
      icon: formData.icon,
    };

    if (editingId) {
      updateServiceType.mutate(
        { id: editingId, data },
        {
          onSuccess: () => {
            resetForm();
            setIsDialogOpen(false);
          },
        }
      );
    } else {
      createServiceType.mutate(data, {
        onSuccess: () => {
          resetForm();
          setIsDialogOpen(false);
        },
      });
    }
  };

  const handleEdit = (serviceType: ServiceTypeEntity) => {
    setEditingId(serviceType.id);
    setFormData({
      code: serviceType.code,
      nameFr: serviceType.nameFr,
      nameAr: serviceType.nameAr,
      icon: serviceType.icon,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      code: '',
      nameFr: '',
      nameAr: '',
      icon: 'FileText',
    });
    setEditingId(null);
  };

  const handleToggleStatus = (id: string) => {
    toggleStatus.mutate(id);
  };

  if (isLoading) {
    return (
      <DashboardLayout title={t('title')} subtitle={t('subtitle')}>
        <ServicesSkeleton />
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

  const allTypes = serviceTypes ?? [];

  return (
    <DashboardLayout title={t('title')} subtitle={t('subtitle')}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-muted-foreground">
            {t('activeCount', {
              active: allTypes.filter((s) => s.isActive).length,
              total: allTypes.length,
            })}
          </p>
        </div>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
              {t('actions.newType')}
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card">
            <DialogHeader>
              <DialogTitle>
                {editingId ? t('dialog.editTitle') : t('dialog.createTitle')}
              </DialogTitle>
              <DialogDescription>
                {editingId ? t('dialog.editDesc') : t('dialog.createDesc')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="code">{t('form.code')}</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder={t('form.codePlaceholder')}
                  disabled={!!editingId}
                />
                <p className="text-xs text-muted-foreground">{t('form.codeHint')}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nameFr">{t('form.nameFr')}</Label>
                  <Input
                    id="nameFr"
                    value={formData.nameFr}
                    onChange={(e) => setFormData({ ...formData, nameFr: e.target.value })}
                    placeholder={t('form.nameFrPlaceholder')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nameAr">{t('form.nameAr')}</Label>
                  <Input
                    id="nameAr"
                    dir="rtl"
                    value={formData.nameAr}
                    onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                    placeholder={t('form.nameArPlaceholder')}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t('form.icon')}</Label>
                <Select
                  value={formData.icon}
                  onValueChange={(value) => setFormData({ ...formData, icon: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('form.selectIcon')}>
                      <div className="flex items-center gap-2">
                        {(() => {
                          const IconComp = getIconComponent(formData.icon);
                          return <IconComp className="h-4 w-4" />;
                        })()}
                        <span>{formData.icon}</span>
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    {availableIcons.map(({ name, icon: Icon }) => (
                      <SelectItem key={name} value={name}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <span>{name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                {tCommon('actions.cancel')}
              </Button>
              <Button
                onClick={handleSave}
                disabled={createServiceType.isPending || updateServiceType.isPending}
              >
                {createServiceType.isPending || updateServiceType.isPending
                  ? tCommon('actions.saving')
                  : editingId
                  ? t('actions.edit')
                  : t('actions.create')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {allTypes.length === 0 ? (
        <EmptyState
          title={t('empty.title')}
          description={t('empty.description')}
          icon={FileText}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {allTypes.map((serviceType) => {
            const IconComponent = getIconComponent(serviceType.icon);
            const displayName = i18n.language === 'ar' ? serviceType.nameAr : serviceType.nameFr;

            return (
              <Card
                key={serviceType.id}
                className={`border-none shadow-sm transition-opacity ${
                  !serviceType.isActive ? 'opacity-60' : ''
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <IconComponent className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{displayName}</CardTitle>
                        <Badge variant="outline" className="mt-1 font-mono text-xs">
                          {serviceType.code}
                        </Badge>
                      </div>
                    </div>
                    <Switch
                      checked={serviceType.isActive}
                      onCheckedChange={() => handleToggleStatus(serviceType.id)}
                      disabled={toggleStatus.isPending}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                    <span>🇫🇷 {serviceType.nameFr}</span>
                    <span dir="rtl">🇸🇦 {serviceType.nameAr}</span>
                  </div>
                  <div className="mt-4 flex items-center justify-end">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(serviceType)}>
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

export default ServiceTypesPage;
