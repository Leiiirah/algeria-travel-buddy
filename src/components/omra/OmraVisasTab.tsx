import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import { OmraVisa } from '@/types';
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
import { useActiveEmployees } from '@/hooks/useUsers';
import { useAuth } from '@/contexts/AuthContext';
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
  const { t } = useTranslation('omra');
  const { t: tCommon } = useTranslation('common');
  const { user } = useAuth();
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
    assignedTo: '',
  });

  const debouncedSearch = useDebounce(searchQuery, 500);

  const { data: visasData, isLoading } = useOmraVisas({
    ...filters,
    search: debouncedSearch || undefined,
  });
  const { data: hotels = [] } = useActiveOmraHotels();
  const { data: employees } = useActiveEmployees();
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
      assignedTo: '',
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
        assignedTo: visa.assignedTo || '',
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
      assignedTo: formData.assignedTo || undefined,
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
    if (confirm(t('visas.confirm.delete'))) {
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
    return <div className="p-8 text-center text-muted-foreground">{t('loading')}</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-sm">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>{t('visas.title')}</CardTitle>
              <CardDescription>{t('visas.count', { count: visasData?.total ?? 0 })}</CardDescription>
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
                    label: t('filters.status'),
                    type: 'select',
                    options: [
                      { label: t('status.en_attente'), value: 'en_attente' },
                      { label: t('status.confirme'), value: 'confirme' },
                      { label: t('status.termine'), value: 'termine' },
                      { label: t('status.annule'), value: 'annule' },
                    ],
                  },
                  {
                    key: 'hotelId',
                    label: t('filters.hotel'),
                    type: 'select',
                    options: hotels.map((h) => ({ label: h.name, value: h.id })),
                  },
                ]}
              />
              <Button onClick={() => handleOpenDialog()} className="gap-2">
                <Plus className="h-4 w-4" />
                {t('visas.newVisa')}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {visas.length === 0 ? (
            <EmptyState
              icon={FileText}
              title={t('visas.empty.title')}
              description={t('visas.empty.description')}
              action={{
                label: t('visas.empty.action'),
                onClick: () => handleOpenDialog(),
              }}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('visas.table.client')}</TableHead>
                  <TableHead>{t('visas.table.visaDate')}</TableHead>
                  <TableHead>{t('visas.table.entryDate')}</TableHead>
                  <TableHead>{t('visas.table.hotel')}</TableHead>
                  <TableHead>{t('visas.table.price')}</TableHead>
                  <TableHead>{t('visas.table.status')}</TableHead>
                  <TableHead className="w-[70px]">{t('visas.table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visas.map((visa) => (
                  <TableRow key={visa.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{visa.clientName}</p>
                        <p className="text-sm text-muted-foreground">{visa.phone}</p>
                        {visa.assignee && (
                          <Badge variant="outline" className="text-xs mt-1 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                            {t('visas.table.by')} {visa.assignee.firstName}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(visa.visaDate)}</TableCell>
                    <TableCell>{formatDate(visa.entryDate)}</TableCell>
                    <TableCell>{visa.hotel?.name || getHotelName(visa.hotelId)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="font-medium">{formatDZD(Number(visa.sellingPrice))}</p>
                        <p className="text-muted-foreground">
                          {t('visas.table.remaining')}: {formatDZD(Number(visa.sellingPrice) - Number(visa.amountPaid))}
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
                            {t(`status.${visa.status}`)}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en_attente">{t('status.en_attente')}</SelectItem>
                          <SelectItem value="confirme">{t('status.confirme')}</SelectItem>
                          <SelectItem value="termine">{t('status.termine')}</SelectItem>
                          <SelectItem value="annule">{t('status.annule')}</SelectItem>
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
                            <Edit className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
                            {tCommon('actions.edit')}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(visa.id)}
                          >
                            <Trash2 className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
                            {tCommon('actions.delete')}
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
            <DialogTitle>{editingVisa ? t('visas.dialog.editTitle') : t('visas.dialog.createTitle')}</DialogTitle>
            <DialogDescription>
              {editingVisa
                ? t('visas.dialog.editDescription')
                : t('visas.dialog.createDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Client Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientName">{t('visas.form.clientName')} *</Label>
                <Input
                  id="clientName"
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  placeholder={t('visas.form.clientNamePlaceholder')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">{t('visas.form.phone')}</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder={t('visas.form.phonePlaceholder')}
                />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="visaDate">{t('visas.form.visaDate')} *</Label>
                <Input
                  id="visaDate"
                  type="date"
                  value={formData.visaDate}
                  onChange={(e) => setFormData({ ...formData, visaDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="entryDate">{t('visas.form.entryDate')} *</Label>
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
              <Label>{t('visas.form.hotel')}</Label>
              <Select
                value={formData.hotelId}
                onValueChange={(value) => setFormData({ ...formData, hotelId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('visas.form.selectHotel')} />
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
                <Label htmlFor="sellingPrice">{t('visas.form.sellingPrice')}</Label>
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
                <Label htmlFor="amountPaid">{t('visas.form.amountPaid')}</Label>
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
                <Label htmlFor="buyingPrice">{t('visas.form.buyingPrice')}</Label>
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
                <p className="text-sm text-muted-foreground">{t('calculations.remaining')}</p>
                <p className="text-lg font-bold">
                  {formatDZD(formData.sellingPrice - formData.amountPaid)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('calculations.profit')}</p>
                <p className="text-lg font-bold text-green-600">
                  {formatDZD(formData.sellingPrice - formData.buyingPrice)}
                </p>
              </div>
            </div>

            {/* Assign To - Admin Only */}
            {user?.role === 'admin' && (
              <div className="space-y-2">
                <Label>{t('visas.form.assignTo')}</Label>
                <Select
                  value={formData.assignedTo || '__unassigned__'}
                  onValueChange={(value) => setFormData({ ...formData, assignedTo: value === '__unassigned__' ? '' : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('visas.form.selectEmployee')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__unassigned__">{t('visas.form.unassigned')}</SelectItem>
                    {employees?.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">{t('visas.form.notes')}</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder={t('visas.form.notesPlaceholder')}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {tCommon('actions.cancel')}
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
              {editingVisa ? tCommon('actions.save') : t('actions.create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
