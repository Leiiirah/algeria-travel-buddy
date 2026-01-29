import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye, Lock, Unlock, Banknote, CreditCard, TrendingUp } from 'lucide-react';
import {
  formatDZD,
  isCommandEditable,
  getCommandStatusLabel,
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

const CommandsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
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
    departureDate: '',
    returnDate: '',
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
      departureDate: '',
      returnDate: '',
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
          departureDate: formData.departureDate,
          returnDate: formData.returnDate || undefined,
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
      formUpdates.departureDate = command.data.departureDate || '';
      formUpdates.returnDate = command.data.returnDate || '';
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
    if (hoursSinceCreation >= 24) return 'Verrouillé';
    const remaining = 24 - hoursSinceCreation;
    if (remaining < 1) return `${Math.round(remaining * 60)} min restantes`;
    return `${Math.round(remaining)}h restantes`;
  };

  const renderServiceSpecificFields = () => {
    const serviceType = getServiceType(selectedService);

    switch (serviceType) {
      case 'visa':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Prénom</Label>
              <Input
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="Prénom du client"
              />
            </div>
            <div className="space-y-2">
              <Label>Nom</Label>
              <Input
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Nom du client"
              />
            </div>
          </div>
        );

      case 'residence':
        return (
          <>
            <div className="space-y-2">
              <Label>Nom complet du client</Label>
              <Input
                value={formData.clientFullName}
                onChange={(e) => setFormData({ ...formData, clientFullName: e.target.value })}
                placeholder="Nom complet"
              />
            </div>
            <div className="space-y-2">
              <Label>Nom de l'hôtel</Label>
              <Input
                value={formData.hotelName}
                onChange={(e) => setFormData({ ...formData, hotelName: e.target.value })}
                placeholder="Nom de l'hôtel"
              />
            </div>
          </>
        );

      case 'ticket':
        return (
          <>
            <div className="space-y-2">
              <Label>Nom complet du client</Label>
              <Input
                value={formData.clientFullName}
                onChange={(e) => setFormData({ ...formData, clientFullName: e.target.value })}
                placeholder="Nom complet"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date de départ</Label>
                <Input
                  type="date"
                  value={formData.departureDate}
                  onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Date de retour</Label>
                <Input
                  type="date"
                  value={formData.returnDate}
                  onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
                />
              </div>
            </div>
          </>
        );

      case 'dossier':
        return (
          <>
            <div className="space-y-2">
              <Label>Nom complet du client</Label>
              <Input
                value={formData.clientFullName}
                onChange={(e) => setFormData({ ...formData, clientFullName: e.target.value })}
                placeholder="Nom complet"
              />
            </div>
            <div className="space-y-2">
              <Label>Description du dossier</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Décrivez le dossier à traiter..."
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
      <DashboardLayout title="Commandes" subtitle="Gestion des commandes clients">
        <CommandsSkeleton />
      </DashboardLayout>
    );
  }

  if (isError) {
    return (
      <DashboardLayout title="Commandes" subtitle="Gestion des commandes clients">
        <ErrorState message={error?.message} onRetry={refetch} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Commandes" subtitle="Gestion des commandes clients">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card className="border-none shadow-sm bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Versements</p>
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
                <p className="text-sm font-medium text-muted-foreground">Total Crédit (Reste)</p>
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
                <p className="text-sm font-medium text-muted-foreground">Total Bénéfice Net</p>
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
              <CardTitle>Liste des commandes</CardTitle>
              <CardDescription>{commandsData?.total ?? 0} commandes au total</CardDescription>
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
                      label: 'Statut',
                      type: 'select',
                      options: [
                        { label: 'En attente', value: 'en_attente' },
                        { label: 'En cours', value: 'en_cours' },
                        { label: 'Terminé', value: 'termine' },
                        { label: 'Annulé', value: 'annule' },
                      ],
                    },
                    {
                      key: 'serviceId',
                      label: 'Service',
                      type: 'select',
                      options: services?.map(s => ({ label: s.name, value: s.id })) || [],
                    },
                    {
                      key: 'supplierId',
                      label: 'Fournisseur',
                      type: 'select',
                      options: suppliers?.filter(s => s.isActive).map(s => ({ label: s.name, value: s.id })) || [],
                    },
                    {
                      key: 'fromDate',
                      label: 'Date début',
                      type: 'date-range',
                    },
                    {
                      key: 'toDate',
                      label: 'Date fin',
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
                    <Plus className="mr-2 h-4 w-4" />
                    Nouvelle commande
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card max-w-lg max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingCommandId ? 'Modifier la commande' : 'Créer une commande'}</DialogTitle>
                    <DialogDescription>
                      Sélectionnez un service et remplissez les informations
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    {/* Service Selection */}
                    <div className="space-y-2">
                      <Label>Service</Label>
                      <Select value={selectedService} onValueChange={(value) => {
                        setSelectedService(value);
                        resetForm();
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choisir un service" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover">
                          {services?.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-4 space-y-2">
                              <p className="text-sm text-muted-foreground text-center">
                                Aucun service disponible
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
                                Ajouter un service
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
                          <Label>Téléphone</Label>
                          <Input
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="+213 555 123 456"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Destination</Label>
                          <Input
                            value={formData.destination}
                            onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                            placeholder="Ex: ALG-IST-ALG"
                          />
                        </div>

                        {/* Accounting fields */}
                        <div className="border-t pt-4 mt-4">
                          <h4 className="font-medium mb-3">Informations comptables</h4>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Prix de Vente (DZD)</Label>
                              <Input
                                type="number"
                                value={formData.sellingPrice || ''}
                                onChange={(e) => setFormData({ ...formData, sellingPrice: Number(e.target.value) })}
                                placeholder="85000"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Versement (DZD)</Label>
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
                              <Label>Prix d'Achat (DZD)</Label>
                              <Input
                                type="number"
                                value={formData.buyingPrice || ''}
                                onChange={(e) => setFormData({ ...formData, buyingPrice: Number(e.target.value) })}
                                placeholder="70000"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Fournisseur</Label>
                              <Select
                                value={formData.supplierId}
                                onValueChange={(value) => setFormData({ ...formData, supplierId: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Sélectionner" />
                                </SelectTrigger>
                                <SelectContent className="bg-popover">
                                  {suppliers?.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center p-4 space-y-2">
                                      <p className="text-sm text-muted-foreground text-center">
                                        Aucun fournisseur disponible
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
                                        Ajouter un fournisseur
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
                                <span className="text-muted-foreground">Reste à payer:</span>
                                <span className={formCalculations.remaining > 0 ? 'text-red-600 font-bold' : 'text-green-600 font-semibold'}>
                                  {formatDZD(formCalculations.remaining)}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Bénéfice net:</span>
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
                      Annuler
                    </Button>
                    <Button onClick={handleCreateCommand} disabled={!selectedService || createCommand.isPending || updateCommand.isPending}>
                      {createCommand.isPending || updateCommand.isPending ? 'Enregistrement...' : (editingCommandId ? 'Modifier' : 'Créer')}
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
              title="Aucune commande"
              description="Commencez par créer votre première commande"
              icon={CreditCard}
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead className="text-right">Prix</TableHead>
                    <TableHead className="text-right">Versement</TableHead>
                    <TableHead className="text-right">Reste</TableHead>
                    <TableHead className="text-right">P. Achat</TableHead>
                    <TableHead className="text-right">Bénéfice</TableHead>
                    <TableHead>Fournisseur</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
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
                            <Badge
                              variant={
                                command.status === 'termine'
                                  ? 'default'
                                  : command.status === 'en_cours'
                                    ? 'secondary'
                                    : command.status === 'annule'
                                      ? 'destructive'
                                      : 'outline'
                              }
                            >
                              {getCommandStatusLabel(command.status)}
                            </Badge>
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
                                <Eye className="mr-2 h-4 w-4" />
                                Voir détails
                              </DropdownMenuItem>
                              {canEdit && (
                                <>
                                  <DropdownMenuItem onClick={() => handleEditCommand(command)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Modifier
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => handleDeleteCommand(command.id)}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Supprimer
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
