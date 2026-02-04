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
import { Plus, MoreHorizontal, Edit, Trash2, Package, Building2 } from 'lucide-react';
import { OmraOrder, OmraRoomType } from '@/types';
import { OmraFilters } from '@/lib/api';
import { formatDZD } from '@/lib/utils';
import {
  useOmraOrders,
  useActiveOmraHotels,
  useCreateOmraOrder,
  useUpdateOmraOrder,
  useUpdateOmraOrderStatus,
  useDeleteOmraOrder,
  useCreateOmraHotel,
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

const roomTypes: OmraRoomType[] = ['chambre_1', 'chambre_2', 'chambre_3', 'chambre_4', 'chambre_5', 'suite'];

export const OmraOrdersTab = () => {
  const { t } = useTranslation('omra');
  const { t: tCommon } = useTranslation('common');
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<OmraFilters>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<OmraOrder | null>(null);
  const [isAddingHotel, setIsAddingHotel] = useState(false);
  const [newHotelName, setNewHotelName] = useState('');
  const [formData, setFormData] = useState({
    clientName: '',
    phone: '',
    orderDate: new Date().toISOString().split('T')[0],
    periodFrom: '',
    periodTo: '',
    hotelId: '',
    roomType: 'chambre_2' as OmraRoomType,
    sellingPrice: 0,
    amountPaid: 0,
    buyingPrice: 0,
    notes: '',
    assignedTo: '',
  });

  const debouncedSearch = useDebounce(searchQuery, 500);

  const { data: ordersData, isLoading } = useOmraOrders({
    ...filters,
    search: debouncedSearch || undefined,
  });
  const { data: hotels = [] } = useActiveOmraHotels();
  const { data: employees } = useActiveEmployees();
  const createOrder = useCreateOmraOrder();
  const updateOrder = useUpdateOmraOrder();
  const updateStatus = useUpdateOmraOrderStatus();
  const deleteOrder = useDeleteOmraOrder();
  const createHotel = useCreateOmraHotel();

  const handleAddHotel = () => {
    if (!newHotelName.trim()) return;
    createHotel.mutate(
      { name: newHotelName.trim() },
      {
        onSuccess: (newHotel) => {
          setFormData({ ...formData, hotelId: newHotel.id });
          setNewHotelName('');
          setIsAddingHotel(false);
        },
      }
    );
  };

  const orders = ordersData?.data ?? [];

  const resetForm = () => {
    setFormData({
      clientName: '',
      phone: '',
      orderDate: new Date().toISOString().split('T')[0],
      periodFrom: '',
      periodTo: '',
      hotelId: '',
      roomType: 'chambre_2',
      sellingPrice: 0,
      amountPaid: 0,
      buyingPrice: 0,
      notes: '',
      assignedTo: '',
    });
    setEditingOrder(null);
  };

  const handleOpenDialog = (order?: OmraOrder) => {
    if (order) {
      setEditingOrder(order);
      setFormData({
        clientName: order.clientName,
        phone: order.phone || '',
        orderDate: new Date(order.orderDate).toISOString().split('T')[0],
        periodFrom: new Date(order.periodFrom).toISOString().split('T')[0],
        periodTo: new Date(order.periodTo).toISOString().split('T')[0],
        hotelId: order.hotelId || '',
        roomType: order.roomType,
        sellingPrice: Number(order.sellingPrice),
        amountPaid: Number(order.amountPaid),
        buyingPrice: Number(order.buyingPrice),
        notes: order.notes || '',
        assignedTo: order.assignedTo || '',
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.clientName.trim() || !formData.periodFrom || !formData.periodTo) return;

    const payload = {
      ...formData,
      hotelId: formData.hotelId || undefined,
      assignedTo: formData.assignedTo || undefined,
    };

    if (editingOrder) {
      updateOrder.mutate(
        { id: editingOrder.id, data: payload },
        {
          onSuccess: () => {
            setIsDialogOpen(false);
            resetForm();
          },
        }
      );
    } else {
      createOrder.mutate(payload, {
        onSuccess: () => {
          setIsDialogOpen(false);
          resetForm();
        },
      });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm(t('orders.confirm.delete'))) {
      deleteOrder.mutate(id);
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
              <CardTitle>{t('orders.title')}</CardTitle>
              <CardDescription>{t('orders.count', { count: ordersData?.total ?? 0 })}</CardDescription>
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
                {t('orders.newOrder')}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <EmptyState
              icon={Package}
              title={t('orders.empty.title')}
              description={t('orders.empty.description')}
              action={{
                label: t('orders.empty.action'),
                onClick: () => handleOpenDialog(),
              }}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('orders.table.client')}</TableHead>
                  <TableHead>{t('orders.table.period')}</TableHead>
                  <TableHead>{t('orders.table.hotel')}</TableHead>
                  <TableHead>{t('orders.table.room')}</TableHead>
                  <TableHead>{t('orders.table.price')}</TableHead>
                  <TableHead>{t('orders.table.status')}</TableHead>
                  <TableHead className="w-[70px]">{t('orders.table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.clientName}</p>
                        <p className="text-sm text-muted-foreground">{order.phone}</p>
                        {order.assignee && (
                          <Badge variant="outline" className="text-xs mt-1 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                            {t('orders.table.by')} {order.assignee.firstName}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{formatDate(order.periodFrom)}</p>
                        <p className="text-muted-foreground">→ {formatDate(order.periodTo)}</p>
                      </div>
                    </TableCell>
                    <TableCell>{order.hotel?.name || getHotelName(order.hotelId)}</TableCell>
                    <TableCell>{t(`roomTypes.${order.roomType}`)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="font-medium">{formatDZD(Number(order.sellingPrice))}</p>
                        <p className="text-muted-foreground">
                          {t('orders.table.remaining')}: {formatDZD(Number(order.sellingPrice) - Number(order.amountPaid))}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={order.status}
                        onValueChange={(value) => handleStatusChange(order.id, value)}
                      >
                        <SelectTrigger className="w-[130px] h-8">
                          <Badge className={`${statusColors[order.status]} border-0`}>
                            {t(`status.${order.status}`)}
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
                          <DropdownMenuItem onClick={() => handleOpenDialog(order)}>
                            <Edit className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
                            {tCommon('actions.edit')}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(order.id)}
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
            <DialogTitle>
              {editingOrder ? t('orders.dialog.editTitle') : t('orders.dialog.createTitle')}
            </DialogTitle>
            <DialogDescription>
              {editingOrder
                ? t('orders.dialog.editDescription')
                : t('orders.dialog.createDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Client Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientName">{t('orders.form.clientName')} *</Label>
                <Input
                  id="clientName"
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  placeholder={t('orders.form.clientNamePlaceholder')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">{t('orders.form.phone')}</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder={t('orders.form.phonePlaceholder')}
                />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="orderDate">{t('orders.form.orderDate')}</Label>
                <Input
                  id="orderDate"
                  type="date"
                  value={formData.orderDate}
                  onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="periodFrom">{t('orders.form.periodFrom')} *</Label>
                <Input
                  id="periodFrom"
                  type="date"
                  value={formData.periodFrom}
                  onChange={(e) => setFormData({ ...formData, periodFrom: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="periodTo">{t('orders.form.periodTo')} *</Label>
                <Input
                  id="periodTo"
                  type="date"
                  value={formData.periodTo}
                  onChange={(e) => setFormData({ ...formData, periodTo: e.target.value })}
                />
              </div>
            </div>

            {/* Hotel & Room */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('orders.form.hotel')}</Label>
                {hotels.length === 0 && !isAddingHotel ? (
                  <div className="flex flex-col gap-2">
                    <p className="text-sm text-muted-foreground">{t('orders.form.noHotelAvailable')}</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsAddingHotel(true)}
                      className="gap-2"
                    >
                      <Building2 className="h-4 w-4" />
                      {t('orders.form.addHotel')}
                    </Button>
                  </div>
                ) : isAddingHotel ? (
                  <div className="flex gap-2">
                    <Input
                      placeholder={t('orders.form.hotelPlaceholder')}
                      value={newHotelName}
                      onChange={(e) => setNewHotelName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddHotel()}
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleAddHotel}
                      disabled={createHotel.isPending || !newHotelName.trim()}
                    >
                      {createHotel.isPending ? '...' : t('actions.add')}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIsAddingHotel(false);
                        setNewHotelName('');
                      }}
                    >
                      {tCommon('actions.cancel')}
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Select
                      value={formData.hotelId}
                      onValueChange={(value) => setFormData({ ...formData, hotelId: value })}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder={t('orders.form.selectHotel')} />
                      </SelectTrigger>
                      <SelectContent>
                        {hotels.map((hotel) => (
                          <SelectItem key={hotel.id} value={hotel.id}>
                            {hotel.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setIsAddingHotel(true)}
                      title={t('orders.form.addHotel')}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label>{t('orders.form.roomType')}</Label>
                <Select
                  value={formData.roomType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, roomType: value as OmraRoomType })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roomTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {t(`roomTypes.${type}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Prices */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sellingPrice">{t('orders.form.sellingPrice')}</Label>
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
                <Label htmlFor="amountPaid">{t('orders.form.amountPaid')}</Label>
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
                <Label htmlFor="buyingPrice">{t('orders.form.buyingPrice')}</Label>
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

            {/* Assign To - Admin Only */}
            {user?.role === 'admin' && (
              <div className="space-y-2">
                <Label>{t('orders.form.assignTo')}</Label>
                <Select
                  value={formData.assignedTo}
                  onValueChange={(value) => setFormData({ ...formData, assignedTo: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('orders.form.selectEmployee')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">{t('orders.form.unassigned')}</SelectItem>
                    {employees?.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

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

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">{t('orders.form.notes')}</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder={t('orders.form.notesPlaceholder')}
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
                !formData.periodFrom ||
                !formData.periodTo ||
                createOrder.isPending ||
                updateOrder.isPending
              }
            >
              {editingOrder ? tCommon('actions.save') : t('actions.create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
