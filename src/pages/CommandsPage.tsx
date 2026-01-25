import { useState } from 'react';
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
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye, Lock, Unlock, Clock } from 'lucide-react';
import {
  mockCommands,
  mockServices,
  mockSuppliers,
  formatDZD,
  isCommandEditable,
  getCommandStatusLabel,
  getPaymentStatusLabel,
} from '@/lib/mock-data';
import { Command, CommandData, CommandStatus, VisaCommand, ResidenceCommand, TicketCommand, DossierCommand } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const CommandsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [commands, setCommands] = useState<Command[]>(mockCommands);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string>('');

  // Form states - using Record for flexible form data
  const [formData, setFormData] = useState<Record<string, any>>({});

  const filteredCommands = commands.filter((command) => {
    const matchesSearch =
      JSON.stringify(command.data).toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || command.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getServiceType = (serviceId: string) => {
    return mockServices.find((s) => s.id === serviceId)?.type || 'visa';
  };

  const handleCreateCommand = () => {
    if (!selectedService || !user) return;

    const serviceType = getServiceType(selectedService);
    let data: CommandData;

    switch (serviceType) {
      case 'visa':
        data = {
          type: 'visa',
          firstName: (formData as VisaCommand).firstName || '',
          lastName: (formData as VisaCommand).lastName || '',
          phone: (formData as VisaCommand).phone || '',
          supplierId: (formData as VisaCommand).supplierId || '',
          state: 'En attente',
          price: Number((formData as VisaCommand).price) || 0,
        };
        break;
      case 'residence':
        data = {
          type: 'residence',
          hotelName: (formData as ResidenceCommand).hotelName || '',
          clientFullName: (formData as ResidenceCommand).clientFullName || '',
          phone: (formData as ResidenceCommand).phone || '',
          price: Number((formData as ResidenceCommand).price) || 0,
        };
        break;
      case 'ticket':
        data = {
          type: 'ticket',
          clientFullName: (formData as TicketCommand).clientFullName || '',
          phone: (formData as TicketCommand).phone || '',
          destination: (formData as TicketCommand).destination || '',
          departureDate: (formData as TicketCommand).departureDate || '',
          returnDate: (formData as TicketCommand).returnDate,
          price: Number((formData as TicketCommand).price) || 0,
        };
        break;
      case 'dossier':
        data = {
          type: 'dossier',
          clientFullName: (formData as DossierCommand).clientFullName || '',
          phone: (formData as DossierCommand).phone || '',
          description: (formData as DossierCommand).description || '',
          price: Number((formData as DossierCommand).price) || 0,
        };
        break;
      default:
        return;
    }

    const newCommand: Command = {
      id: String(commands.length + 1),
      serviceId: selectedService,
      data,
      status: 'en_attente',
      paymentStatus: 'non_paye',
      paidAmount: 0,
      createdBy: user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setCommands([newCommand, ...commands]);
    setIsDialogOpen(false);
    setSelectedService('');
    setFormData({});
    toast({
      title: 'Commande créée',
      description: 'La commande a été enregistrée avec succès',
    });
  };

  const handleDeleteCommand = (commandId: string) => {
    const command = commands.find((c) => c.id === commandId);
    if (!command || !user) return;

    if (!isCommandEditable(command, user.id)) {
      toast({
        title: 'Action non autorisée',
        description: 'Cette commande ne peut plus être supprimée (délai de 24h dépassé)',
        variant: 'destructive',
      });
      return;
    }

    setCommands(commands.filter((c) => c.id !== commandId));
    toast({
      title: 'Commande supprimée',
      description: 'La commande a été supprimée avec succès',
    });
  };

  const getTimeRemaining = (createdAt: Date): string => {
    const hoursSinceCreation = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
    if (hoursSinceCreation >= 24) return 'Verrouillé';
    const remaining = 24 - hoursSinceCreation;
    if (remaining < 1) return `${Math.round(remaining * 60)} min restantes`;
    return `${Math.round(remaining)}h restantes`;
  };

  const renderFormFields = () => {
    const serviceType = getServiceType(selectedService);

    switch (serviceType) {
      case 'visa':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Prénom</Label>
                <Input
                  value={(formData as VisaCommand).firstName || ''}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="Prénom du client"
                />
              </div>
              <div className="space-y-2">
                <Label>Nom</Label>
                <Input
                  value={(formData as VisaCommand).lastName || ''}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Nom du client"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Téléphone</Label>
              <Input
                value={(formData as VisaCommand).phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+213 555 123 456"
              />
            </div>
            <div className="space-y-2">
              <Label>Fournisseur</Label>
              <Select
                value={(formData as VisaCommand).supplierId || ''}
                onValueChange={(value) => setFormData({ ...formData, supplierId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un fournisseur" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {mockSuppliers
                    .filter((s) => s.serviceTypes.includes('visa'))
                    .map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Prix (DZD)</Label>
              <Input
                type="number"
                value={(formData as VisaCommand).price || ''}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                placeholder="25000"
              />
            </div>
          </>
        );

      case 'residence':
        return (
          <>
            <div className="space-y-2">
              <Label>Nom de l'hôtel</Label>
              <Input
                value={(formData as ResidenceCommand).hotelName || ''}
                onChange={(e) => setFormData({ ...formData, hotelName: e.target.value })}
                placeholder="Nom de l'hôtel"
              />
            </div>
            <div className="space-y-2">
              <Label>Nom complet du client</Label>
              <Input
                value={(formData as ResidenceCommand).clientFullName || ''}
                onChange={(e) => setFormData({ ...formData, clientFullName: e.target.value })}
                placeholder="Nom complet"
              />
            </div>
            <div className="space-y-2">
              <Label>Téléphone</Label>
              <Input
                value={(formData as ResidenceCommand).phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+213 555 123 456"
              />
            </div>
            <div className="space-y-2">
              <Label>Prix (DZD)</Label>
              <Input
                type="number"
                value={(formData as ResidenceCommand).price || ''}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                placeholder="45000"
              />
            </div>
            <div className="space-y-2">
              <Label>Pièce jointe (PDF)</Label>
              <Input type="file" accept=".pdf" />
            </div>
          </>
        );

      case 'ticket':
        return (
          <>
            <div className="space-y-2">
              <Label>Nom complet du client</Label>
              <Input
                value={(formData as TicketCommand).clientFullName || ''}
                onChange={(e) => setFormData({ ...formData, clientFullName: e.target.value })}
                placeholder="Nom complet"
              />
            </div>
            <div className="space-y-2">
              <Label>Téléphone</Label>
              <Input
                value={(formData as TicketCommand).phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+213 555 123 456"
              />
            </div>
            <div className="space-y-2">
              <Label>Destination</Label>
              <Input
                value={(formData as TicketCommand).destination || ''}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                placeholder="Paris CDG"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date de départ</Label>
                <Input
                  type="date"
                  value={(formData as TicketCommand).departureDate || ''}
                  onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Date de retour</Label>
                <Input
                  type="date"
                  value={(formData as TicketCommand).returnDate || ''}
                  onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Prix (DZD)</Label>
              <Input
                type="number"
                value={(formData as TicketCommand).price || ''}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                placeholder="85000"
              />
            </div>
          </>
        );

      case 'dossier':
        return (
          <>
            <div className="space-y-2">
              <Label>Nom complet du client</Label>
              <Input
                value={(formData as DossierCommand).clientFullName || ''}
                onChange={(e) => setFormData({ ...formData, clientFullName: e.target.value })}
                placeholder="Nom complet"
              />
            </div>
            <div className="space-y-2">
              <Label>Téléphone</Label>
              <Input
                value={(formData as DossierCommand).phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+213 555 123 456"
              />
            </div>
            <div className="space-y-2">
              <Label>Description du dossier</Label>
              <Textarea
                value={(formData as DossierCommand).description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Décrivez le dossier à traiter..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Prix (DZD)</Label>
              <Input
                type="number"
                value={(formData as DossierCommand).price || ''}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                placeholder="15000"
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <DashboardLayout title="Commandes" subtitle="Gestion des commandes clients">
      <Card className="border-none shadow-sm">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Liste des commandes</CardTitle>
              <CardDescription>{commands.length} commandes au total</CardDescription>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-48 pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="en_attente">En attente</SelectItem>
                  <SelectItem value="en_cours">En cours</SelectItem>
                  <SelectItem value="termine">Terminé</SelectItem>
                  <SelectItem value="annule">Annulé</SelectItem>
                </SelectContent>
              </Select>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Nouvelle commande
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Créer une commande</DialogTitle>
                    <DialogDescription>
                      Sélectionnez un service et remplissez les informations
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Service</Label>
                      <Select value={selectedService} onValueChange={setSelectedService}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choisir un service" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover">
                          {mockServices
                            .filter((s) => s.isActive)
                            .map((service) => (
                              <SelectItem key={service.id} value={service.id}>
                                {service.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {selectedService && renderFormFields()}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Annuler
                    </Button>
                    <Button onClick={handleCreateCommand} disabled={!selectedService}>
                      Créer
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client / Détails</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Paiement</TableHead>
                <TableHead>Modifiable</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCommands.map((command) => {
                const service = mockServices.find((s) => s.id === command.serviceId);
                const canEdit = user ? isCommandEditable(command, user.id) : false;

                return (
                  <TableRow key={command.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {command.data.type === 'visa'
                            ? `${command.data.firstName} ${command.data.lastName}`
                            : command.data.type === 'residence'
                            ? command.data.hotelName
                            : 'clientFullName' in command.data
                            ? command.data.clientFullName
                            : 'N/A'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {command.data.phone}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{service?.name}</Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{formatDZD(command.data.price)}</p>
                        {command.paidAmount > 0 && command.paidAmount < command.data.price && (
                          <p className="text-xs text-muted-foreground">
                            Payé: {formatDZD(command.paidAmount)}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
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
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          command.paymentStatus === 'paye'
                            ? 'default'
                            : command.paymentStatus === 'partiel'
                            ? 'secondary'
                            : 'destructive'
                        }
                      >
                        {getPaymentStatusLabel(command.paymentStatus)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {canEdit ? (
                          <>
                            <Unlock className="h-4 w-4 text-success" />
                            <span className="text-xs text-muted-foreground">
                              {getTimeRemaining(command.createdAt)}
                            </span>
                          </>
                        ) : (
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        )}
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
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            Voir détails
                          </DropdownMenuItem>
                          {canEdit && (
                            <>
                              <DropdownMenuItem>
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
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default CommandsPage;
