import { useState } from 'react';
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
import { Plus, MoreHorizontal, Edit, Trash2, FileText } from 'lucide-react';
import { OmraVisa, omraStatusLabels } from '@/types';
import { OmraFilters } from '@/lib/api';
import { formatDZD } from '@/lib/utils';
import {
  useOmraVisas,
  useActiveOmraHotels,
  useCreateOmraVisa,
  useUpdateOmraVisa,
  useUpdateOmraVisaStatus,
  useDeleteOmraVisa,
} from '@/hooks/useOmra';
import { AdvancedFilter } from '@/components/search/AdvancedFilter';
import { useDebounce } from '@/hooks/useDebounce';
import { EmptyState } from '@/components/ui/empty-state';

const statusColors: Record<string, string> = {
  en_attente: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  confirme: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  termine: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  annule: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

export const OmraVisasTab = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<OmraFilters>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVisa, setEditingVisa] = useState<OmraVisa | null>(null);
  const [formData, setFormData] = useState({
    clientName: '',
    phone: '',
    visaDate: new Date().toISOString().split('T')[0],
    entryDate: '',
    hotelId: '',
    sellingPrice: 0,
    amountPaid: 0,
    buyingPrice: 0,
    notes: '',
  });

  const debouncedSearch = useDebounce(searchQuery, 500);

  const { data: visasData, isLoading } = useOmraVisas({
    ...filters,
    search: debouncedSearch || undefined,
  });
  const { data: hotels = [] } = useActiveOmraHotels();
  const createVisa = useCreateOmraVisa();
  const updateVisa = useUpdateOmraVisa();
  const updateStatus = useUpdateOmraVisaStatus();
  const deleteVisa = useDeleteOmraVisa();

  const visas = visasData?.data ?? [];

  const resetForm = () => {
    setFormData({
      clientName: '',
      phone: '',
      visaDate: new Date().toISOString().split('T')[0],
      entryDate: '',
      hotelId: '',
      sellingPrice: 0,
      amountPaid: 0,
      buyingPrice: 0,
      notes: '',
    });
    setEditingVisa(null);
  };

  const handleOpenDialog = (visa?: OmraVisa) => {
    if (visa) {
      setEditingVisa(visa);
      setFormData({
        clientName: visa.clientName,
        phone: visa.phone || '',
        visaDate: new Date(visa.visaDate).toISOString().split('T')[0],
        entryDate: new Date(visa.entryDate).toISOString().split('T')[0],
        hotelId: visa.hotelId || '',
        sellingPrice: Number(visa.sellingPrice),
        amountPaid: Number(visa.amountPaid),
        buyingPrice: Number(visa.buyingPrice),
        notes: visa.notes || '',
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.clientName.trim() || !formData.visaDate || !formData.entryDate) return;

    const payload = {
      ...formData,
      hotelId: formData.hotelId || undefined,
    };

    if (editingVisa) {
      updateVisa.mutate(
        { id: editingVisa.id, data: payload },
        {
          onSuccess: () => {
            setIsDialogOpen(false);
            resetForm();
          },
        }
      );
    } else {
      createVisa.mutate(payload, {
        onSuccess: () => {
          setIsDialogOpen(false);
          resetForm();
        },
      });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce visa ?')) {
      deleteVisa.mutate(id);
    }
  };

  const handleStatusChange = (id: string, status: string) => {
    updateStatus.mutate({ id, status });
  };

  const getHotelName = (hotelId: string) => {
    return hotels.find((h) => h.id === hotelId)?.name || '-';
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('fr-FR');
  };

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-sm">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Visas Omra</CardTitle>
              <CardDescription>{visasData?.total ?? 0} visas au total</CardDescription>
            </div>
            <div className="flex flex-wrap gap-3">
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
                      { label: 'Confirmé', value: 'confirme' },
                      { label: 'Terminé', value: 'termine' },
                      { label: 'Annulé', value: 'annule' },
                    ],
                  },
                  {
                    key: 'hotelId',
                    label: 'Hôtel',
                    type: 'select',
                    options: hotels.map((h) => ({ label: h.name, value: h.id })),
                  },
                ]}
              />
              <Button onClick={() => handleOpenDialog()} className="gap-2">
                <Plus className="h-4 w-4" />
                Nouveau Visa
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {visas.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="Aucun visa"
              description="Commencez par créer un visa Omra"
              action={{
                label: 'Nouveau visa',
                onClick: () => handleOpenDialog(),
              }}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Date Visa</TableHead>
                  <TableHead>Date Entrée</TableHead>
                  <TableHead>Hôtel</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visas.map((visa) => (
                  <TableRow key={visa.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{visa.clientName}</p>
                        <p className="text-sm text-muted-foreground">{visa.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(visa.visaDate)}</TableCell>
                    <TableCell>{formatDate(visa.entryDate)}</TableCell>
                    <TableCell>{visa.hotel?.name || getHotelName(visa.hotelId)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="font-medium">{formatDZD(Number(visa.sellingPrice))}</p>
                        <p className="text-muted-foreground">
                          Reste: {formatDZD(Number(visa.sellingPrice) - Number(visa.amountPaid))}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={visa.status}
                        onValueChange={(value) => handleStatusChange(visa.id, value)}
                      >
                        <SelectTrigger className="w-[130px] h-8">
                          <Badge className={`${statusColors[visa.status]} border-0`}>
                            {omraStatusLabels[visa.status]}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en_attente">En attente</SelectItem>
                          <SelectItem value="confirme">Confirmé</SelectItem>
                          <SelectItem value="termine">Terminé</SelectItem>
                          <SelectItem value="annule">Annulé</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenDialog(visa)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(visa.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingVisa ? 'Modifier le visa' : 'Nouveau visa Omra'}</DialogTitle>
            <DialogDescription>
              {editingVisa
                ? 'Modifiez les informations du visa'
                : 'Créez un nouveau visa pour le pèlerinage Omra'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Client Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientName">Nom du client *</Label>
                <Input
                  id="clientName"
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  placeholder="Nom complet"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Ex: 0550123456"
                />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="visaDate">Date du visa *</Label>
                <Input
                  id="visaDate"
                  type="date"
                  value={formData.visaDate}
                  onChange={(e) => setFormData({ ...formData, visaDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="entryDate">Date d'entrée *</Label>
                <Input
                  id="entryDate"
                  type="date"
                  value={formData.entryDate}
                  onChange={(e) => setFormData({ ...formData, entryDate: e.target.value })}
                />
              </div>
            </div>

            {/* Hotel */}
            <div className="space-y-2">
              <Label>Hôtel</Label>
              <Select
                value={formData.hotelId}
                onValueChange={(value) => setFormData({ ...formData, hotelId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un hôtel" />
                </SelectTrigger>
                <SelectContent>
                  {hotels.map((hotel) => (
                    <SelectItem key={hotel.id} value={hotel.id}>
                      {hotel.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Prices */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sellingPrice">Prix de vente (DA)</Label>
                <Input
                  id="sellingPrice"
                  type="number"
                  value={formData.sellingPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amountPaid">Versement (DA)</Label>
                <Input
                  id="amountPaid"
                  type="number"
                  value={formData.amountPaid}
                  onChange={(e) =>
                    setFormData({ ...formData, amountPaid: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="buyingPrice">Prix d'achat (DA)</Label>
                <Input
                  id="buyingPrice"
                  type="number"
                  value={formData.buyingPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, buyingPrice: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Reste à payer</p>
                <p className="text-lg font-bold">
                  {formatDZD(formData.sellingPrice - formData.amountPaid)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bénéfice net</p>
                <p className="text-lg font-bold text-green-600">
                  {formatDZD(formData.sellingPrice - formData.buyingPrice)}
                </p>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Notes supplémentaires..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                !formData.clientName.trim() ||
                !formData.visaDate ||
                !formData.entryDate ||
                createVisa.isPending ||
                updateVisa.isPending
              }
            >
              {editingVisa ? 'Enregistrer' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
