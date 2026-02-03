import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye, Lock, Unlock, Banknote, CreditCard, TrendingUp, FileDown } from 'lucide-react';
import {
  formatDZD,
  isCommandEditable,
  getPaymentStatusFromAmounts,
} from '@/lib/utils';
import { CommandData, calculateRemainingBalance, calculateNetProfit } from '@/types';
import { CommandFilters } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { AdvancedFilter } from '@/components/search/AdvancedFilter';
import { useCommands, useCommandStats, useCreateCommand, useUpdateCommand, useDeleteCommand } from '@/hooks/useCommands';
import { useActiveServices } from '@/hooks/useServices';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useDebounce } from '@/hooks/useDebounce';
import { CommandsSkeleton } from '@/components/skeletons/CommandsSkeleton';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
import { generateInvoicePdf } from '@/utils/invoiceGenerator';
import { format } from 'date-fns';

const CommandsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation('commands');
  const { t: tCommon } = useTranslation('common');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<CommandFilters>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string>('');
  const [editingCommandId, setEditingCommandId] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    clientFullName: '',
    phone: '',
    destination: '',
    sellingPrice: 0,
    amountPaid: 0,
    buyingPrice: 0,
    supplierId: '',
    firstName: '',
    lastName: '',
    hotelName: '',
    company: '',
    description: '',
  });

  const debouncedSearch = useDebounce(searchQuery, 500);

  // React Query hooks
  const { data: commandsData, isLoading, isError, error, refetch } = useCommands({
    ...filters,
    search: debouncedSearch || undefined,
  });
  const { data: statsData } = useCommandStats();
  const { data: services } = useActiveServices();
  const { data: suppliers } = useSuppliers();
  const createCommand = useCreateCommand();
  const updateCommand = useUpdateCommand();
  const deleteCommand = useDeleteCommand();

  const commands = commandsData?.data ?? [];

  // Use stats from API or calculate from current page
  const totals = useMemo(() => {
    if (statsData) {
      return {
        totalPaid: statsData.totalPaid,
        totalRemaining: statsData.totalRemaining,
        totalProfit: statsData.totalProfit,
      };
    }
    return commands.reduce(
      (acc, cmd) => {
        const remaining = calculateRemainingBalance(cmd.sellingPrice, cmd.amountPaid);
        const profit = calculateNetProfit(cmd.sellingPrice, cmd.buyingPrice);
        return {
          totalPaid: acc.totalPaid + cmd.amountPaid,
          totalRemaining: acc.totalRemaining + remaining,
          totalProfit: acc.totalProfit + profit,
        };
      },
      { totalPaid: 0, totalRemaining: 0, totalProfit: 0 }
    );
  }, [statsData, commands]);

  // Real-time form calculations
  const formCalculations = useMemo(() => {
    return {
      remaining: calculateRemainingBalance(formData.sellingPrice, formData.amountPaid),
      profit: calculateNetProfit(formData.sellingPrice, formData.buyingPrice),
    };
  }, [formData.sellingPrice, formData.amountPaid, formData.buyingPrice]);

  const getServiceType = (serviceId: string) => {
    return services?.find((s) => s.id === serviceId)?.type || 'visa';
  };

  const getSupplierName = (supplierId: string) => {
    return suppliers?.find((s) => s.id === supplierId)?.name || 'N/A';
  };

  const resetForm = () => {
    setFormData({
      clientFullName: '',
      phone: '',
      destination: '',
      sellingPrice: 0,
      amountPaid: 0,
      buyingPrice: 0,
      supplierId: '',
      firstName: '',
      lastName: '',
      hotelName: '',
      company: '',
      description: '',
    });
    setEditingCommandId(null);
  };

  const handleCreateCommand = () => {
    if (!selectedService || !user) return;

    const serviceType = getServiceType(selectedService);
    let data: CommandData;

    const baseData = {
      clientFullName: formData.clientFullName || `${formData.firstName} ${formData.lastName}`.trim(),
      phone: formData.phone,
    };

    switch (serviceType) {
      case 'visa':
        data = {
          ...baseData,
          type: 'visa',
          firstName: formData.firstName,
          lastName: formData.lastName,
          clientFullName: `${formData.firstName} ${formData.lastName}`.trim(),
        };
        break;
      case 'residence':
        data = {
          ...baseData,
          type: 'residence',
          hotelName: formData.hotelName,
        };
        break;
      case 'ticket':
        data = {
          ...baseData,
          type: 'ticket',
          company: formData.company,
        };
        break;
      case 'dossier':
        data = {
          ...baseData,
          type: 'dossier',
          description: formData.description,
        };
        break;
      default:
        return;
    }

    const commandPayload = {
      serviceId: selectedService,
      data: data as unknown as Record<string, unknown>,
      destination: formData.destination,
      sellingPrice: formData.sellingPrice,
      amountPaid: formData.amountPaid,
      buyingPrice: formData.buyingPrice,
      supplierId: formData.supplierId,
    };

    if (editingCommandId) {
      updateCommand.mutate(
        {
          id: editingCommandId,
          data: commandPayload,
        },
        {
          onSuccess: () => {
            setIsDialogOpen(false);
            setSelectedService('');
            resetForm();
          },
        }
      );
    } else {
      createCommand.mutate(
        commandPayload,
        {
          onSuccess: () => {
            setIsDialogOpen(false);
            setSelectedService('');
            resetForm();
          },
        }
      );
    }
  };

  const handleEditCommand = (command: any) => {
    setEditingCommandId(command.id);
    setSelectedService(command.serviceId);

    // Flatten data for form
    const formUpdates: any = {
      clientFullName: command.data.clientFullName || '',
      phone: command.data.phone || '',
      destination: command.destination || '',
      sellingPrice: command.sellingPrice || 0,
      amountPaid: command.amountPaid || 0,
      buyingPrice: command.buyingPrice || 0,
      supplierId: command.supplierId || '',
    };

    if (command.data.type === 'visa') {
      formUpdates.firstName = command.data.firstName || '';
      formUpdates.lastName = command.data.lastName || '';
    } else if (command.data.type === 'residence') {
      formUpdates.hotelName = command.data.hotelName || '';
    } else if (command.data.type === 'ticket') {
      formUpdates.company = command.data.company || '';
    } else if (command.data.type === 'dossier') {
      formUpdates.description = command.data.description || '';
    }

    setFormData(prev => ({ ...prev, ...formUpdates }));
    setIsDialogOpen(true);
  };

  const handleDeleteCommand = (commandId: string) => {
    const command = commands.find((c) => c.id === commandId);
    if (!command || !user) return;

    if (!isCommandEditable(command, user.id)) {
      return;
    }

    deleteCommand.mutate(commandId);
  };

  const getTimeRemaining = (createdAt: Date | string): string => {
    const createdDate = typeof createdAt === 'string' ? new Date(createdAt) : createdAt;
    const hoursSinceCreation = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60);
    if (hoursSinceCreation >= 24) return t('time.locked');
    const remaining = 24 - hoursSinceCreation;
    if (remaining < 1) return t('time.minutesRemaining', { minutes: Math.round(remaining * 60) });
    return t('time.hoursRemaining', { hours: Math.round(remaining) });
  };

  const getStatusLabel = (status: string): string => {
    return t(`status.${status}`);
  };

  const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'accepte':
      case 'visa_delivre':
      case 'retire':
        return 'default';
      case 'depose':
      case 'en_traitement':
        return 'secondary';
      case 'refuse':
        return 'destructive';
      case 'dossier_incomplet':
      default:
        return 'outline';
    }
  };

  const statusOptions = [
    { value: 'dossier_incomplet', label: t('status.dossier_incomplet') },
    { value: 'depose', label: t('status.depose') },
    { value: 'en_traitement', label: t('status.en_traitement') },
    { value: 'accepte', label: t('status.accepte') },
    { value: 'refuse', label: t('status.refuse') },
    { value: 'visa_delivre', label: t('status.visa_delivre') },
    { value: 'retire', label: t('status.retire') },
  ];

  const handleStatusChange = (commandId: string, newStatus: string) => {
    updateCommand.mutate({
      id: commandId,
      data: { status: newStatus as any },
    });
  };

  const handlePrintInvoice = async (command: any) => {
    const service = services?.find((s) => s.id === command.serviceId);
    const supplier = suppliers?.find((s) => s.id === command.supplierId);
    
    await generateInvoicePdf({
      reference: `CMD-${command.id.substring(0, 6).toUpperCase()}`,
      clientName: command.data.clientFullName || '',
      clientPhone: command.data.phone || '',
      paymentDate: format(new Date(command.createdAt), 'dd/MM/yyyy'),
      amountPaid: Number(command.amountPaid),
      totalPrice: Number(command.sellingPrice),
      remaining: Number(command.sellingPrice) - Number(command.amountPaid),
      service: service?.name || '',
      serviceType: service?.type || '',
      destination: command.destination || '',
      status: getStatusLabel(command.status),
      company: command.data.company,
      supplier: supplier?.name,
      language: (window.localStorage.getItem('i18nextLng') || 'fr') as 'fr' | 'ar',
    });
  };

  const renderServiceSpecificFields = () => {
    const serviceType = getServiceType(selectedService);

    switch (serviceType) {
      case 'visa':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('form.firstName')}</Label>
              <Input
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder={t('form.firstName')}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('form.lastName')}</Label>
              <Input
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder={t('form.lastName')}
              />
            </div>
          </div>
        );

      case 'residence':
        return (
          <>
            <div className="space-y-2">
              <Label>{t('form.clientFullName')}</Label>
              <Input
                value={formData.clientFullName}
                onChange={(e) => setFormData({ ...formData, clientFullName: e.target.value })}
                placeholder={t('form.clientFullName')}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('form.hotelName')}</Label>
              <Input
                value={formData.hotelName}
                onChange={(e) => setFormData({ ...formData, hotelName: e.target.value })}
                placeholder={t('form.hotelName')}
              />
            </div>
          </>
        );

      case 'ticket':
        return (
          <>
            <div className="space-y-2">
              <Label>{t('form.clientFullName')}</Label>
              <Input
                value={formData.clientFullName}
                onChange={(e) => setFormData({ ...formData, clientFullName: e.target.value })}
                placeholder={t('form.clientFullName')}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('form.company')}</Label>
              <Input
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder={t('form.companyPlaceholder')}
              />
            </div>
          </>
        );

      case 'dossier':
        return (
          <>
            <div className="space-y-2">
              <Label>{t('form.clientFullName')}</Label>
              <Input
                value={formData.clientFullName}
                onChange={(e) => setFormData({ ...formData, clientFullName: e.target.value })}
                placeholder={t('form.clientFullName')}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('form.description')}</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={t('form.description')}
                rows={2}
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title={t('title')} subtitle={t('subtitle')}>
        <CommandsSkeleton />
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
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card className="border-none shadow-sm bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('stats.totalPayments')}</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{formatDZD(totals.totalPaid)}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-200/50 dark:bg-blue-800/50 flex items-center justify-center">
                <Banknote className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('stats.totalCredit')}</p>
                <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">{formatDZD(totals.totalRemaining)}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-orange-200/50 dark:bg-orange-800/50 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('stats.totalProfit')}</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-400">{formatDZD(totals.totalProfit)}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-200/50 dark:bg-green-800/50 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>{t('list.title')}</CardTitle>
              <CardDescription>{t('list.count', { count: commandsData?.total ?? 0 })}</CardDescription>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="flex-1">
                <AdvancedFilter
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  filters={filters}
                  onFilterChange={setFilters}
                  filterConfig={[
                    {
                      key: 'status',
                      label: t('filters.status'),
                      type: 'select',
                      options: [
                        { label: t('status.en_attente'), value: 'en_attente' },
                        { label: t('status.en_cours'), value: 'en_cours' },
                        { label: t('status.termine'), value: 'termine' },
                        { label: t('status.annule'), value: 'annule' },
                      ],
                    },
                    {
                      key: 'serviceId',
                      label: t('filters.service'),
                      type: 'select',
                      options: services?.map(s => ({ label: s.name, value: s.id })) || [],
                    },
                    {
                      key: 'supplierId',
                      label: t('filters.supplier'),
                      type: 'select',
                      options: suppliers?.filter(s => s.isActive).map(s => ({ label: s.name, value: s.id })) || [],
                    },
                    {
                      key: 'fromDate',
                      label: t('filters.fromDate'),
                      type: 'date-range',
                    },
                    {
                      key: 'toDate',
                      label: t('filters.toDate'),
                      type: 'date-range',
                    },
                  ]}
                />
              </div>
              <Dialog open={isDialogOpen} onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) {
                  setSelectedService('');
                  resetForm();
                }
              }}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
                    {t('dialog.createTitle')}
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card max-w-lg max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingCommandId ? t('dialog.editTitle') : t('dialog.createTitle')}</DialogTitle>
                    <DialogDescription>
                      {t('dialog.selectServiceDesc')}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    {/* Service Selection */}
                    <div className="space-y-2">
                      <Label>{t('form.service')}</Label>
                      <Select value={selectedService} onValueChange={(value) => {
                        setSelectedService(value);
                        // Reset form but keep/apply defaults if available
                        const service = services?.find(s => s.id === value);
                        setFormData({
                          clientFullName: '',
                          phone: '',
                          destination: '',
                          sellingPrice: 0,
                          amountPaid: 0,
                          buyingPrice: service?.defaultBuyingPrice || 0,
                          supplierId: service?.defaultSupplierId || '',
                          firstName: '',
                          lastName: '',
                          hotelName: '',
                          company: '',
                          description: '',
                        });
                        setEditingCommandId(null);
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder={t('form.selectServicePlaceholder')} />
                        </SelectTrigger>
                        <SelectContent className="bg-popover">
                          {services?.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-4 space-y-2">
                              <p className="text-sm text-muted-foreground text-center">
                                {t('form.noServiceAvailable')}
                              </p>
                              <Button
                                variant="secondary"
                                size="sm"
                                className="w-full"
                                onClick={() => {
                                  setIsDialogOpen(false);
                                  navigate('/services');
                                }}
                              >
                                {t('form.addService')}
                              </Button>
                            </div>
                          ) : (
                            services?.map((service) => (
                              <SelectItem key={service.id} value={service.id}>
                                {service.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedService && (
                      <>
                        {/* Service-specific fields */}
                        {renderServiceSpecificFields()}

                        {/* Common fields */}
                        <div className="space-y-2">
                          <Label>{t('form.phone')}</Label>
                          <Input
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="+213 555 123 456"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>{t('form.destination')}</Label>
                          <Input
                            value={formData.destination}
                            onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                            placeholder="Ex: ALG-IST-ALG"
                          />
                        </div>

                        {/* Accounting fields */}
                        <div className="border-t pt-4 mt-4">
                          <h4 className="font-medium mb-3">{t('form.accountingInfo')}</h4>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>{t('form.sellingPrice')}</Label>
                              <Input
                                type="number"
                                value={formData.sellingPrice || ''}
                                onChange={(e) => setFormData({ ...formData, sellingPrice: Number(e.target.value) })}
                                placeholder="85000"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>{t('form.amountPaid')}</Label>
                              <Input
                                type="number"
                                value={formData.amountPaid || ''}
                                onChange={(e) => setFormData({ ...formData, amountPaid: Number(e.target.value) })}
                                placeholder="25000"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mt-4">
                            <div className="space-y-2">
                              <Label>{t('form.buyingPrice')}</Label>
                              <Input
                                type="number"
                                value={formData.buyingPrice || ''}
                                onChange={(e) => setFormData({ ...formData, buyingPrice: Number(e.target.value) })}
                                placeholder="70000"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>{t('form.supplier')}</Label>
                              <Select
                                value={formData.supplierId}
                                onValueChange={(value) => setFormData({ ...formData, supplierId: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder={t('form.selectSupplier')} />
                                </SelectTrigger>
                                <SelectContent className="bg-popover">
                                  {suppliers?.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center p-4 space-y-2">
                                      <p className="text-sm text-muted-foreground text-center">
                                        {t('form.noSupplierAvailable')}
                                      </p>
                                      <Button
                                        variant="secondary"
                                        size="sm"
                                        className="w-full"
                                        onClick={() => {
                                          setIsDialogOpen(false);
                                          navigate('/fournisseurs');
                                        }}
                                      >
                                        {t('form.addSupplier')}
                                      </Button>
                                    </div>
                                  ) : (
                                    suppliers?.filter((s) => s.isActive).map((supplier) => (
                                      <SelectItem key={supplier.id} value={supplier.id}>
                                        {supplier.name}
                                      </SelectItem>
                                    ))
                                  )}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {/* Real-time calculations display */}
                          {(formData.sellingPrice > 0 || formData.buyingPrice > 0) && (
                            <div className="mt-4 p-3 bg-muted/50 rounded-lg space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">{t('calculations.remaining')}:</span>
                                <span className={formCalculations.remaining > 0 ? 'text-red-600 font-bold' : 'text-green-600 font-semibold'}>
                                  {formatDZD(formCalculations.remaining)}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">{t('calculations.profit')}:</span>
                                <span className="text-green-600 font-semibold">
                                  {formatDZD(formCalculations.profit)}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      {tCommon('actions.cancel')}
                    </Button>
                    <Button onClick={handleCreateCommand} disabled={!selectedService || createCommand.isPending || updateCommand.isPending}>
                      {createCommand.isPending || updateCommand.isPending ? t('actions.saving') : (editingCommandId ? t('actions.edit') : t('actions.create'))}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {commands.length === 0 ? (
            <EmptyState
              title={t('empty.title')}
              description={t('empty.description')}
              icon={CreditCard}
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('table.service')}</TableHead>
                    <TableHead>{t('table.client')}</TableHead>
                    <TableHead>{t('table.destination')}</TableHead>
                    <TableHead className="text-right">{t('table.price')}</TableHead>
                    <TableHead className="text-right">{t('table.payment')}</TableHead>
                    <TableHead className="text-right">{t('table.remaining')}</TableHead>
                    <TableHead className="text-right">{t('table.buyingPrice')}</TableHead>
                    <TableHead className="text-right">{t('table.profit')}</TableHead>
                    <TableHead>{t('table.supplier')}</TableHead>
                    <TableHead>{t('table.status')}</TableHead>
                    <TableHead className="text-right">{t('table.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commands.map((command) => {
                    const service = services?.find((s) => s.id === command.serviceId);
                    const canEdit = user ? isCommandEditable(command, user.id) : false;
                    const remaining = calculateRemainingBalance(command.sellingPrice, command.amountPaid);
                    const profit = calculateNetProfit(command.sellingPrice, command.buyingPrice);

                    return (
                      <TableRow key={command.id}>
                        <TableCell>
                          <Badge variant="outline">{service?.name}</Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{command.data.clientFullName}</p>
                            <p className="text-xs text-muted-foreground">{command.data.phone}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{command.destination}</TableCell>
                        <TableCell className="text-right font-medium">{formatDZD(command.sellingPrice)}</TableCell>
                        <TableCell className="text-right">{formatDZD(command.amountPaid)}</TableCell>
                        <TableCell className="text-right">
                          <span className={remaining > 0 ? 'text-red-600 font-bold' : 'text-green-600 font-semibold'}>
                            {formatDZD(remaining)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">{formatDZD(command.buyingPrice)}</TableCell>
                        <TableCell className="text-right">
                          <span className="text-green-600 font-semibold">{formatDZD(profit)}</span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{getSupplierName(command.supplierId)}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {user?.role === 'admin' ? (
                              <Select
                                value={command.status}
                                onValueChange={(value) => handleStatusChange(command.id, value)}
                              >
                                <SelectTrigger className="w-[160px] h-8">
                                  <SelectValue>
                                    <Badge variant={getStatusVariant(command.status)} className="text-xs">
                                      {getStatusLabel(command.status)}
                                    </Badge>
                                  </SelectValue>
                                </SelectTrigger>
                                <SelectContent className="bg-popover">
                                  {statusOptions.map((status) => (
                                    <SelectItem key={status.value} value={status.value}>
                                      {status.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <Badge variant={getStatusVariant(command.status)}>
                                {getStatusLabel(command.status)}
                              </Badge>
                            )}
                            <div className="flex items-center gap-1 text-xs">
                              {canEdit ? (
                                <>
                                  <Unlock className="h-3 w-3 text-green-600" />
                                  <span className="text-muted-foreground">{getTimeRemaining(command.createdAt)}</span>
                                </>
                              ) : (
                                <Lock className="h-3 w-3 text-muted-foreground" />
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-popover">
                              <DropdownMenuItem onClick={() => handleEditCommand(command)}>
                                <Eye className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
                                {tCommon('actions.view')}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handlePrintInvoice(command)}>
                                <FileDown className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
                                {t('actions.printInvoice')}
                              </DropdownMenuItem>
                              {canEdit && (
                                <>
                                  <DropdownMenuItem onClick={() => handleEditCommand(command)}>
                                    <Edit className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
                                    {tCommon('actions.edit')}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => handleDeleteCommand(command.id)}
                                  >
                                    <Trash2 className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
                                    {tCommon('actions.delete')}
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout >
  );
};

export default CommandsPage;
