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
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye, Lock, Unlock, Banknote, CreditCard, TrendingUp, FileDown, Download, Loader2, X } from 'lucide-react';
import {
  formatDZD,
  isCommandEditable,
  getPaymentStatusFromAmounts,
} from '@/lib/utils';
import { CommandData, calculateRemainingBalance, calculateNetProfit, Command } from '@/types';
import { CommandFilters, api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { AdvancedFilter } from '@/components/search/AdvancedFilter';
import { useCommands, useCommandStats, useCreateCommand, useUpdateCommand, useDeleteCommand } from '@/hooks/useCommands';
import { useActiveServices } from '@/hooks/useServices';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useActiveEmployees } from '@/hooks/useUsers';
import { useCompanies, useCreateCompany } from '@/hooks/useCompanies';
import { usePaymentTypes, useCreatePaymentType } from '@/hooks/usePaymentTypes';
import { useDebounce } from '@/hooks/useDebounce';
import { CommandsSkeleton } from '@/components/skeletons/CommandsSkeleton';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
import { generateClientInvoicePdf } from '@/utils/invoiceGenerator';
import { format } from 'date-fns';
import { useAgencySettings } from '@/hooks/useAgencySettings';

const CommandsPage = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { t } = useTranslation('commands');
  const { t: tCommon } = useTranslation('common');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<CommandFilters>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string>('');
  const [editingCommandId, setEditingCommandId] = useState<string | null>(null);
  const [passportFile, setPassportFile] = useState<File | null>(null);
  // Details dialog state
  const [viewingCommand, setViewingCommand] = useState<Command | null>(null);
  const [passportBlobUrl, setPassportBlobUrl] = useState<string | null>(null);
  const [isLoadingPassport, setIsLoadingPassport] = useState(false);
  const [isPassportExpanded, setIsPassportExpanded] = useState(false);
  // Inline add company dialog (admin only)
  const [isAddCompanyOpen, setIsAddCompanyOpen] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  // Inline add payment type dialog (admin only)
  const [isAddPaymentTypeOpen, setIsAddPaymentTypeOpen] = useState(false);
  const [newPaymentTypeName, setNewPaymentTypeName] = useState('');
  // Loading state for passport upload path (bypasses mutation)
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    assignedTo: '',
    paymentType: '',
    commandDate: '',
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
  const { data: employees } = useActiveEmployees();
  const { data: companies } = useCompanies();
  const { data: paymentTypes } = usePaymentTypes();
  const createCompanyMutation = useCreateCompany();
  const createPaymentTypeMutation = useCreatePaymentType();
  const createCommand = useCreateCommand();
  const updateCommand = useUpdateCommand();
  const deleteCommand = useDeleteCommand();
  const { data: agencySettings } = useAgencySettings();

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
      assignedTo: '',
      paymentType: '',
      commandDate: '',
    });
    setEditingCommandId(null);
    setPassportFile(null);
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
        // Generic fallback - just include clientFullName
        data = {
          ...baseData,
          type: serviceType,
        };
        break;
    }

    // Include paymentType in the data JSONB field
    if (formData.paymentType) {
      (data as any).paymentType = formData.paymentType;
    }

    const commandPayload = {
      serviceId: selectedService,
      data: data as unknown as Record<string, unknown>,
      destination: formData.destination,
      sellingPrice: formData.sellingPrice,
      amountPaid: formData.amountPaid,
      buyingPrice: formData.buyingPrice,
      supplierId: formData.supplierId,
      assignedTo: formData.assignedTo || undefined,
      commandDate: formData.commandDate || undefined,
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
      // Check if this is a visa command with a passport file (new command only)
      const serviceType = getServiceType(selectedService);
      if (serviceType === 'visa' && passportFile && !editingCommandId) {
        // Use the API method with FormData for file upload
        setIsSubmitting(true);
        api.createCommandWithPassport(commandPayload, passportFile)
          .then(() => {
            setIsDialogOpen(false);
            setSelectedService('');
            resetForm();
            // Refetch commands to show the new one
            refetch();
          })
          .catch((error) => {
            console.error('Error creating command with passport:', error);
          })
          .finally(() => {
            setIsSubmitting(false);
          });
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

    // Fallback for generic/custom types - ensure clientFullName is loaded
    if (!['visa', 'residence', 'ticket', 'dossier'].includes(command.data.type)) {
      formUpdates.clientFullName = command.data.clientFullName || '';
    }

    formUpdates.assignedTo = command.assignedTo || '';
    formUpdates.paymentType = (command.data as any).paymentType || '';
    formUpdates.commandDate = command.commandDate ? new Date(command.commandDate).toISOString().split('T')[0] : '';

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

    await generateClientInvoicePdf({
      invoiceNumber: `CMD-${command.id.substring(0, 6).toUpperCase()}`,
      invoiceType: 'proforma',
      clientName: command.data.clientFullName || command.data.nomPrenom || command.data.clientName || '',
      clientPhone: command.data.phone || '',
      clientPassport: command.data.passportNumber || '',
      invoiceDate: format(new Date(command.createdAt), 'dd/MM/yyyy'),
      totalAmount: Number(command.sellingPrice),
      paidAmount: Number(command.amountPaid),
      remaining: Number(command.sellingPrice) - Number(command.amountPaid),
      serviceName: service?.name || '',
      serviceType: service?.type || '',
      destination: command.destination || '',
      companyName: command.data.company || '',
      departureDate: command.data.departureDate ? format(new Date(command.data.departureDate), 'dd/MM/yyyy') : '',
      returnDate: command.data.returnDate ? format(new Date(command.data.returnDate), 'dd/MM/yyyy') : '',
      travelClass: command.data.travelClass || '',
      pnr: command.data.pnr || '',
      ticketPrice: Number(command.buyingPrice) || 0,
      agencyFees: Math.max(0, Number(command.sellingPrice) - Number(command.buyingPrice)),
      paymentMethod: command.data.paymentMethod || '',
      validityHours: 48,
      status: command.status,
      language: (localStorage.getItem('i18nextLng') || 'fr') as 'fr' | 'ar',
      agencyInfo: agencySettings || undefined,
    });
  };

  // View command details with passport
  const handleViewCommand = async (command: Command) => {
    setViewingCommand(command);
    setPassportBlobUrl(null);
    
    // If command has a passport, load it
    if (command.passportUrl) {
      setIsLoadingPassport(true);
      try {
        const blob = await api.getCommandPassportBlob(command.id, 'view');
        const url = URL.createObjectURL(blob);
        setPassportBlobUrl(url);
      } catch (error) {
        console.error('Failed to load passport:', error);
      } finally {
        setIsLoadingPassport(false);
      }
    }
  };

  const handleDownloadPassport = async (commandId: string) => {
    try {
      const blob = await api.getCommandPassportBlob(commandId, 'download');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'passport.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download passport:', error);
    }
  };

  const closeDetailsDialog = () => {
    setViewingCommand(null);
    if (passportBlobUrl) {
      URL.revokeObjectURL(passportBlobUrl);
      setPassportBlobUrl(null);
    }
  };

  const renderServiceSpecificFields = () => {
    const serviceType = getServiceType(selectedService);

    switch (serviceType) {
      case 'visa':
        return (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            {/* Passport Upload - only for new commands */}
            {!editingCommandId && (
              <div className="space-y-2">
                <Label>{t('form.passport')}</Label>
                <Input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setPassportFile(e.target.files?.[0] || null)}
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground">{t('form.passportHelp')}</p>
                {passportFile && (
                  <p className="text-xs text-green-600 dark:text-green-400">
                    ✓ {passportFile.name}
                  </p>
                )}
              </div>
            )}
          </>
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
              <div className="flex gap-2">
                <Select
                  value={formData.company}
                  onValueChange={(value) => setFormData({ ...formData, company: value })}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder={t('form.companyPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {companies?.map((c) => (
                      <SelectItem key={c.id} value={c.name}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isAdmin && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setIsAddCompanyOpen(true)}
                    title={tCommon('companies.add')}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Inline Add Company Dialog */}
            <Dialog open={isAddCompanyOpen} onOpenChange={setIsAddCompanyOpen}>
              <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                  <DialogTitle>{tCommon('companies.add')}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>{tCommon('companies.name')}</Label>
                    <Input
                      value={newCompanyName}
                      onChange={(e) => setNewCompanyName(e.target.value)}
                      placeholder={tCommon('companies.namePlaceholder')}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newCompanyName.trim()) {
                          createCompanyMutation.mutate(
                            { name: newCompanyName.trim() },
                            {
                              onSuccess: (company) => {
                                setFormData({ ...formData, company: company.name });
                                setNewCompanyName('');
                                setIsAddCompanyOpen(false);
                              },
                            }
                          );
                        }
                      }}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => { setIsAddCompanyOpen(false); setNewCompanyName(''); }}>
                    {tCommon('actions.cancel')}
                  </Button>
                  <Button
                    onClick={() => {
                      if (!newCompanyName.trim()) return;
                      createCompanyMutation.mutate(
                        { name: newCompanyName.trim() },
                        {
                          onSuccess: (company) => {
                            setFormData({ ...formData, company: company.name });
                            setNewCompanyName('');
                            setIsAddCompanyOpen(false);
                          },
                        }
                      );
                    }}
                    disabled={!newCompanyName.trim() || createCompanyMutation.isPending}
                  >
                    {tCommon('actions.save')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
        // Generic fallback for any other service types (e.g., billet_bateau)
        return (
          <div className="space-y-2">
            <Label>{t('form.clientFullName')}</Label>
            <Input
              value={formData.clientFullName}
              onChange={(e) => setFormData({ ...formData, clientFullName: e.target.value })}
              placeholder={t('form.clientFullName')}
            />
          </div>
        );
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
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 mb-6">
        <Card className="overflow-hidden border-none shadow-sm bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-muted-foreground">{t('stats.totalPayments')}</p>
                <p className="text-lg sm:text-2xl font-bold text-blue-700 dark:text-blue-400 truncate">{formatDZD(totals.totalPaid)}</p>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-blue-200/50 dark:bg-blue-800/50 flex items-center justify-center shrink-0 ml-3">
                <Banknote className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-none shadow-sm bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-muted-foreground">{t('stats.totalCredit')}</p>
                <p className="text-lg sm:text-2xl font-bold text-orange-700 dark:text-orange-400 truncate">{formatDZD(totals.totalRemaining)}</p>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-orange-200/50 dark:bg-orange-800/50 flex items-center justify-center shrink-0 ml-3">
                <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-none shadow-sm bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-muted-foreground">{t('stats.totalProfit')}</p>
                <p className="text-lg sm:text-2xl font-bold text-green-700 dark:text-green-400 truncate">{formatDZD(totals.totalProfit)}</p>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-green-200/50 dark:bg-green-800/50 flex items-center justify-center shrink-0 ml-3">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="min-w-0 border-none shadow-sm">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>{t('list.title')}</CardTitle>
              <CardDescription>{t('list.count', { count: commandsData?.total ?? 0 })}</CardDescription>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <div className="w-full sm:flex-1 sm:min-w-[200px]">
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
                <DialogContent className="bg-card max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">
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
                          assignedTo: '',
                          paymentType: '',
                          commandDate: '',
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

                        <div className="space-y-2">
                          <Label>{t('form.commandDate')}</Label>
                          <Input
                            type="date"
                            value={formData.commandDate}
                            onChange={(e) => setFormData({ ...formData, commandDate: e.target.value })}
                          />
                          <p className="text-xs text-muted-foreground">{t('form.commandDateHelp')}</p>
                        </div>

                        {/* Accounting fields */}
                        <div className="border-t pt-4 mt-4">
                          <h4 className="font-medium mb-3">{t('form.accountingInfo')}</h4>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
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

                          {/* Payment Type */}
                          <div className="space-y-2 mt-4">
                            <Label>{t('form.paymentType')}</Label>
                            <div className="flex gap-2">
                              <Select
                                value={formData.paymentType || '__none__'}
                                onValueChange={(value) => setFormData({ ...formData, paymentType: value === '__none__' ? '' : value })}
                              >
                                <SelectTrigger className="flex-1">
                                  <SelectValue placeholder={t('form.selectPaymentType')} />
                                </SelectTrigger>
                                <SelectContent className="bg-popover">
                                  <SelectItem value="__none__">{t('form.selectPaymentType')}</SelectItem>
                                  {paymentTypes?.map((pt) => (
                                    <SelectItem key={pt.id} value={pt.name}>
                                      {pt.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {isAdmin && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  onClick={() => setIsAddPaymentTypeOpen(true)}
                                  title={t('form.addPaymentType')}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>

                          {/* Inline Add Payment Type Dialog */}
                          <Dialog open={isAddPaymentTypeOpen} onOpenChange={setIsAddPaymentTypeOpen}>
                            <DialogContent className="sm:max-w-[400px]">
                              <DialogHeader>
                                <DialogTitle>{t('form.addPaymentType')}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label>{tCommon('common.name') || 'Nom'}</Label>
                                  <Input
                                    value={newPaymentTypeName}
                                    onChange={(e) => setNewPaymentTypeName(e.target.value)}
                                    placeholder={t('form.paymentType')}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' && newPaymentTypeName.trim()) {
                                        createPaymentTypeMutation.mutate(
                                          { name: newPaymentTypeName.trim() },
                                          {
                                            onSuccess: (pt) => {
                                              setFormData({ ...formData, paymentType: pt.name });
                                              setNewPaymentTypeName('');
                                              setIsAddPaymentTypeOpen(false);
                                            },
                                          }
                                        );
                                      }
                                    }}
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => { setIsAddPaymentTypeOpen(false); setNewPaymentTypeName(''); }}>
                                  {tCommon('actions.cancel')}
                                </Button>
                                <Button
                                  onClick={() => {
                                    if (!newPaymentTypeName.trim()) return;
                                    createPaymentTypeMutation.mutate(
                                      { name: newPaymentTypeName.trim() },
                                      {
                                        onSuccess: (pt) => {
                                          setFormData({ ...formData, paymentType: pt.name });
                                          setNewPaymentTypeName('');
                                          setIsAddPaymentTypeOpen(false);
                                        },
                                      }
                                    );
                                  }}
                                  disabled={!newPaymentTypeName.trim() || createPaymentTypeMutation.isPending}
                                >
                                  {tCommon('actions.save')}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>

                          {/* Assign To - Admin Only for VISA services */}
                          {user?.role === 'admin' && selectedService && getServiceType(selectedService) === 'visa' && (
                            <div className="space-y-2 mt-4">
                              <Label>{t('form.assignTo')}</Label>
                              <Select
                                value={formData.assignedTo || '__unassigned__'}
                                onValueChange={(value) => setFormData({ ...formData, assignedTo: value === '__unassigned__' ? '' : value })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder={t('form.selectEmployee')} />
                                </SelectTrigger>
                                <SelectContent className="bg-popover">
                                  <SelectItem value="__unassigned__">{t('form.unassigned')}</SelectItem>
                                  {employees?.map((emp) => (
                                    <SelectItem key={emp.id} value={emp.id}>
                                      {emp.firstName} {emp.lastName}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}

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
                    <Button onClick={handleCreateCommand} disabled={!selectedService || createCommand.isPending || updateCommand.isPending || isSubmitting}>
                      {(createCommand.isPending || updateCommand.isPending || isSubmitting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {createCommand.isPending || updateCommand.isPending || isSubmitting ? t('actions.saving') : (editingCommandId ? t('actions.edit') : t('actions.create'))}
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
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <Table className="text-xs sm:text-sm">
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('table.service')}</TableHead>
                    <TableHead>{t('table.client')}</TableHead>
                    <TableHead className="hidden md:table-cell">{t('table.destination')}</TableHead>
                    <TableHead className="text-right">{t('table.price')}</TableHead>
                    <TableHead className="text-right hidden sm:table-cell">{t('table.payment')}</TableHead>
                    <TableHead className="text-right hidden sm:table-cell">{t('table.remaining')}</TableHead>
                    <TableHead className="text-right hidden md:table-cell">{t('table.buyingPrice')}</TableHead>
                    <TableHead className="text-right hidden md:table-cell">{t('table.profit')}</TableHead>
                    <TableHead className="hidden md:table-cell">{t('table.supplier')}</TableHead>
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
                            {command.assignee && (
                              <Badge 
                                variant="outline" 
                                className="text-xs mt-1 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                              >
                                {t('table.by')} {command.assignee.firstName}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium hidden md:table-cell">{command.destination}</TableCell>
                        <TableCell className="text-right font-medium">{formatDZD(command.sellingPrice)}</TableCell>
                        <TableCell className="text-right hidden sm:table-cell">{formatDZD(command.amountPaid)}</TableCell>
                        <TableCell className="text-right hidden sm:table-cell">
                          <span className={remaining > 0 ? 'text-red-600 font-bold' : 'text-green-600 font-semibold'}>
                            {formatDZD(remaining)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground hidden md:table-cell">{formatDZD(command.buyingPrice)}</TableCell>
                        <TableCell className="text-right hidden md:table-cell">
                          <span className="text-green-600 font-semibold">{formatDZD(profit)}</span>
                        </TableCell>
                        <TableCell className="text-muted-foreground hidden md:table-cell">{getSupplierName(command.supplierId)}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {user?.role === 'admin' ? (
                              <Select
                                value={command.status}
                                onValueChange={(value) => handleStatusChange(command.id, value)}
                              >
                                <SelectTrigger className="w-[100px] sm:w-[160px] h-8">
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
                              <DropdownMenuItem onClick={() => handleViewCommand(command)}>
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

      {/* View Details Dialog */}
      <Dialog open={!!viewingCommand} onOpenChange={(open) => {
        if (!open) closeDetailsDialog();
      }}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('details.title')}</DialogTitle>
          </DialogHeader>
          
          {viewingCommand && (() => {
            const viewService = services?.find((s) => s.id === viewingCommand.serviceId);
            const viewSupplier = suppliers?.find((s) => s.id === viewingCommand.supplierId);
            const viewRemaining = calculateRemainingBalance(viewingCommand.sellingPrice, viewingCommand.amountPaid);
            const viewProfit = calculateNetProfit(viewingCommand.sellingPrice, viewingCommand.buyingPrice);
            
            return (
              <div className="space-y-6">
                {/* Service and Date Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground text-xs">{t('details.service')}</Label>
                    <p className="font-medium">{viewService?.name || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">{t('details.createdAt')}</Label>
                    <p className="font-medium">{format(new Date(viewingCommand.createdAt), 'dd/MM/yyyy HH:mm')}</p>
                  </div>
                </div>

                {/* Client Information */}
                <div className="border-t pt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground text-xs">{t('table.client')}</Label>
                      <p className="font-medium">{viewingCommand.data.clientFullName}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">{t('form.phone')}</Label>
                      <p className="font-medium">{viewingCommand.data.phone || '-'}</p>
                    </div>
                  </div>
                </div>

                {/* Visa-specific fields */}
                {viewingCommand.data.type === 'visa' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground text-xs">{t('form.firstName')}</Label>
                      <p className="font-medium">{(viewingCommand.data as any).firstName || '-'}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">{t('form.lastName')}</Label>
                      <p className="font-medium">{(viewingCommand.data as any).lastName || '-'}</p>
                    </div>
                  </div>
                )}

                {/* Residence-specific fields */}
                {viewingCommand.data.type === 'residence' && (
                  <div>
                    <Label className="text-muted-foreground text-xs">{t('form.hotelName')}</Label>
                    <p className="font-medium">{(viewingCommand.data as any).hotelName || '-'}</p>
                  </div>
                )}

                {/* Ticket-specific fields */}
                {viewingCommand.data.type === 'ticket' && (
                  <div>
                    <Label className="text-muted-foreground text-xs">{t('form.company')}</Label>
                    <p className="font-medium">{(viewingCommand.data as any).company || '-'}</p>
                  </div>
                )}

                {/* Dossier-specific fields */}
                {viewingCommand.data.type === 'dossier' && (
                  <div>
                    <Label className="text-muted-foreground text-xs">{t('form.description')}</Label>
                    <p className="font-medium">{(viewingCommand.data as any).description || '-'}</p>
                  </div>
                )}

                {/* Destination and Supplier */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground text-xs">{t('form.destination')}</Label>
                    <p className="font-medium">{viewingCommand.destination || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">{t('form.supplier')}</Label>
                    <p className="font-medium">{viewSupplier?.name || '-'}</p>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <Label className="text-muted-foreground text-xs">{t('table.status')}</Label>
                  <div className="mt-1">
                    <Badge variant={getStatusVariant(viewingCommand.status)}>
                      {getStatusLabel(viewingCommand.status)}
                    </Badge>
                  </div>
                </div>

                {/* Passport Section - Only for Visa */}
                {viewingCommand.data.type === 'visa' && (
                  <div className="border-t pt-4">
                    <Label className="text-muted-foreground text-xs mb-2 block">{t('form.passport')}</Label>
                    {viewingCommand.passportUrl ? (
                      <div className="space-y-3">
                        {isLoadingPassport ? (
                          <div className="flex items-center justify-center h-[300px] bg-muted rounded-lg">
                            <Loader2 className="h-6 w-6 animate-spin" />
                          </div>
                        ) : passportBlobUrl ? (
                          <>
                            {/* Display based on file type */}
                            {viewingCommand.passportUrl.toLowerCase().endsWith('.pdf') ? (
                              <iframe
                                src={passportBlobUrl}
                                className="w-full h-[400px] rounded-lg border"
                                title="Passport Preview"
                              />
                            ) : (
                              <img
                                src={passportBlobUrl}
                                alt="Passport"
                                className="max-w-full max-h-[400px] rounded-lg border mx-auto block cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => setIsPassportExpanded(true)}
                                title={t('details.clickToEnlarge')}
                              />
                            )}
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleDownloadPassport(viewingCommand.id)}>
                                <Download className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                                {t('form.downloadPassport')}
                              </Button>
                            </div>
                          </>
                        ) : (
                          <p className="text-sm text-destructive">{t('details.passportLoadError')}</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">{t('form.noPassport')}</p>
                    )}
                  </div>
                )}
                
                {/* Financial Information */}
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">{t('form.accountingInfo')}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <Label className="text-muted-foreground text-xs">{t('table.sellingPrice')}</Label>
                      <p className="font-medium">{formatDZD(viewingCommand.sellingPrice)}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">{t('table.payment')}</Label>
                      <p className="font-medium">{formatDZD(viewingCommand.amountPaid)}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">{t('table.remaining')}</Label>
                      <p className={`font-medium ${viewRemaining > 0 ? 'text-destructive' : 'text-green-600'}`}>
                        {formatDZD(viewRemaining)}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">{t('table.profit')}</Label>
                      <p className="font-medium text-green-600">{formatDZD(viewProfit)}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Passport Lightbox */}
      {isPassportExpanded && passportBlobUrl && (
        <div 
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setIsPassportExpanded(false)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
            onClick={() => setIsPassportExpanded(false)}
          >
            <X className="h-8 w-8" />
          </button>
          <img
            src={passportBlobUrl}
            alt="Passport Full View"
            className="max-w-[95vw] max-h-[95vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </DashboardLayout >
  );
};

export default CommandsPage;
