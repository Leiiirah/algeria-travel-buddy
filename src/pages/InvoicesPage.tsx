import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { fr, ar } from 'date-fns/locale';
import {
  FileText,
  Plus,
  Download,
  Pencil,
  Trash2,
  Search,
  Receipt,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataState } from '@/components/ui/data-state';
import { InvoicesSkeleton } from '@/components/skeletons/InvoicesSkeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { useAuth } from '@/contexts/AuthContext';
import {
  useClientInvoices,
  useClientInvoiceStats,
  useCreateClientInvoice,
  useUpdateClientInvoice,
  useDeleteClientInvoice,
} from '@/hooks/useClientInvoices';
import { generateClientInvoicePdf } from '@/utils/invoiceGenerator';
import { ClientInvoice, ClientInvoiceType, ClientInvoiceStatus } from '@/types';
import { CreateClientInvoiceDto, UpdateClientInvoiceDto, ClientInvoiceFilters } from '@/lib/api';
import { TRAVEL_CLASSES, PAYMENT_METHODS } from '@/constants/agency';

export default function InvoicesPage() {
  const { t, i18n } = useTranslation(['invoices', 'common']);
  const { isAdmin } = useAuth();
  const locale = i18n.language === 'ar' ? ar : fr;

  // Filters
  const [filters, setFilters] = useState<ClientInvoiceFilters>({});
  const [searchQuery, setSearchQuery] = useState('');

  // Dialogs
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<ClientInvoice | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<CreateClientInvoiceDto>>({
    type: 'proforma',
    clientName: '',
    serviceName: '',
    totalAmount: 0,
    paidAmount: 0,
    ticketPrice: 0,
    agencyFees: 0,
    validityHours: 48,
  });

  // Queries and mutations
  const { data: invoices, isLoading, isError, error, refetch } = useClientInvoices(filters);
  const { data: stats } = useClientInvoiceStats(true);
  const createMutation = useCreateClientInvoice();
  const updateMutation = useUpdateClientInvoice();
  const deleteMutation = useDeleteClientInvoice();

  // Filter handlers
  const handleFilterChange = (key: keyof ClientInvoiceFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === 'all' ? undefined : value,
    }));
  };

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, search: searchQuery || undefined }));
  };

  // Form handlers
  const openCreateDialog = () => {
    setSelectedInvoice(null);
    setFormData({
      type: 'proforma',
      clientName: '',
      serviceName: '',
      totalAmount: 0,
      paidAmount: 0,
      ticketPrice: 0,
      agencyFees: 0,
      validityHours: 48,
    });
    setIsFormOpen(true);
  };

  const openEditDialog = (invoice: ClientInvoice) => {
    setSelectedInvoice(invoice);
    setFormData({
      type: invoice.type,
      clientName: invoice.clientName,
      clientPhone: invoice.clientPhone || undefined,
      clientEmail: invoice.clientEmail || undefined,
      clientPassport: invoice.clientPassport || undefined,
      serviceName: invoice.serviceName,
      serviceType: invoice.serviceType || undefined,
      destination: invoice.destination || undefined,
      companyName: invoice.companyName || undefined,
      departureDate: invoice.departureDate ? format(new Date(invoice.departureDate), 'yyyy-MM-dd') : undefined,
      returnDate: invoice.returnDate ? format(new Date(invoice.returnDate), 'yyyy-MM-dd') : undefined,
      travelClass: invoice.travelClass || undefined,
      pnr: invoice.pnr || undefined,
      ticketPrice: invoice.ticketPrice || 0,
      agencyFees: invoice.agencyFees || 0,
      totalAmount: invoice.totalAmount,
      paidAmount: invoice.paidAmount,
      paymentMethod: invoice.paymentMethod || undefined,
      validityHours: invoice.validityHours || 48,
      notes: invoice.notes || undefined,
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async () => {
    if (selectedInvoice) {
      await updateMutation.mutateAsync({
        id: selectedInvoice.id,
        data: formData as UpdateClientInvoiceDto,
      });
    } else {
      await createMutation.mutateAsync(formData as CreateClientInvoiceDto);
    }
    setIsFormOpen(false);
  };

  const handleDelete = async () => {
    if (selectedInvoice) {
      await deleteMutation.mutateAsync(selectedInvoice.id);
      setIsDeleteOpen(false);
      setSelectedInvoice(null);
    }
  };

  const handleDownloadPdf = (invoice: ClientInvoice) => {
    generateClientInvoicePdf({
      invoiceNumber: invoice.invoiceNumber,
      invoiceType: invoice.type,
      clientName: invoice.clientName,
      clientPhone: invoice.clientPhone || '',
      clientPassport: invoice.clientPassport || '',
      invoiceDate: format(new Date(invoice.invoiceDate), 'dd/MM/yyyy'),
      totalAmount: invoice.totalAmount,
      paidAmount: invoice.paidAmount,
      remaining: invoice.totalAmount - invoice.paidAmount,
      serviceName: invoice.serviceName,
      serviceType: invoice.serviceType || '',
      destination: invoice.destination || '',
      companyName: invoice.companyName || '',
      departureDate: invoice.departureDate ? format(new Date(invoice.departureDate), 'dd/MM/yyyy') : '',
      returnDate: invoice.returnDate ? format(new Date(invoice.returnDate), 'dd/MM/yyyy') : '',
      travelClass: invoice.travelClass || '',
      pnr: invoice.pnr || '',
      ticketPrice: invoice.ticketPrice || 0,
      agencyFees: invoice.agencyFees || 0,
      paymentMethod: invoice.paymentMethod || '',
      validityHours: invoice.validityHours || 48,
      status: invoice.status,
      language: i18n.language as 'fr' | 'ar',
    });
  };

  // Status badge color
  const getStatusBadge = (status: ClientInvoiceStatus) => {
    const classNames: Record<ClientInvoiceStatus, string> = {
      brouillon: 'bg-slate-100 text-slate-700 border-slate-200',
      envoyee: 'bg-blue-100 text-blue-700 border-blue-200',
      payee: 'bg-green-100 text-green-700 border-green-200',
      annulee: 'bg-red-100 text-red-700 border-red-200',
    };
    return (
      <Badge variant="outline" className={classNames[status]}>
        {t(`status.${status}`)}
      </Badge>
    );
  };

  // Type badge color
  const getTypeBadge = (type: ClientInvoiceType) => {
    const className = type === 'proforma' 
      ? 'bg-blue-100 text-blue-800 border-blue-200'
      : 'bg-purple-100 text-purple-800 border-purple-200';
    return (
      <Badge variant="outline" className={className}>
        {t(`type.${type}`)}
      </Badge>
    );
  };

  // Empty state component
  const emptyState = (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <FileText className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium">{t('empty.title')}</h3>
      <p className="text-sm text-muted-foreground">{t('empty.description')}</p>
    </div>
  );

  return (
    <DashboardLayout title={t('title')}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t('title')}</h1>
          </div>
          <div className="flex gap-2">
            <Button onClick={openCreateDialog} variant="default">
              <Plus className="mr-2 h-4 w-4" />
              {t('add')}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title={t('stats.total')}
              value={stats.total.toString()}
              icon={FileText}
              description=""
            />
            <StatsCard
              title={t('stats.pending')}
              value={stats.pending.toString()}
              icon={Clock}
              description=""
              variant="warning"
            />
            <StatsCard
              title={t('stats.paid')}
              value={stats.paid.toString()}
              icon={CheckCircle}
              description=""
              variant="success"
            />
            <StatsCard
              title={t('stats.totalRemaining')}
              value={`${stats.totalRemaining.toLocaleString()} ${t('common:currency')}`}
              icon={Receipt}
              description=""
              variant="info"
            />
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <Select
            value={filters.type || 'all'}
            onValueChange={(value) => handleFilterChange('type', value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t('filters.allTypes')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('filters.allTypes')}</SelectItem>
              <SelectItem value="proforma">{t('type.proforma')}</SelectItem>
              <SelectItem value="finale">{t('type.finale')}</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.status || 'all'}
            onValueChange={(value) => handleFilterChange('status', value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t('filters.allStatus')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('filters.allStatus')}</SelectItem>
              <SelectItem value="brouillon">{t('status.brouillon')}</SelectItem>
              <SelectItem value="envoyee">{t('status.envoyee')}</SelectItem>
              <SelectItem value="payee">{t('status.payee')}</SelectItem>
              <SelectItem value="annulee">{t('status.annulee')}</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex flex-1 gap-2">
            <Input
              placeholder={t('filters.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="min-w-[200px]"
            />
            <Button variant="outline" onClick={handleSearch}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Invoices Table */}
        <DataState
          isLoading={isLoading}
          isError={isError}
          error={error}
          data={invoices}
          loadingSkeleton={<InvoicesSkeleton />}
          emptyState={emptyState}
          onRetry={refetch}
        >
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('table.invoiceNumber')}</TableHead>
                    <TableHead>{t('table.type')}</TableHead>
                    <TableHead>{t('table.client')}</TableHead>
                    <TableHead>{t('table.service')}</TableHead>
                    <TableHead className="text-right">{t('table.amount')}</TableHead>
                    <TableHead className="text-right">{t('table.paid')}</TableHead>
                    <TableHead className="text-right">{t('table.remaining')}</TableHead>
                    <TableHead>{t('table.date')}</TableHead>
                    <TableHead>{t('table.status')}</TableHead>
                    <TableHead className="text-center">{t('table.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices?.map((invoice) => {
                    const remaining = invoice.totalAmount - invoice.paidAmount;
                    return (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                        <TableCell>{getTypeBadge(invoice.type)}</TableCell>
                        <TableCell>{invoice.clientName}</TableCell>
                        <TableCell>{invoice.serviceName}</TableCell>
                        <TableCell className="text-right">
                          {invoice.totalAmount.toLocaleString()} {t('common:currency')}
                        </TableCell>
                        <TableCell className="text-right text-green-600">
                          {invoice.paidAmount.toLocaleString()} {t('common:currency')}
                        </TableCell>
                        <TableCell className={`text-right ${remaining > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {remaining.toLocaleString()} {t('common:currency')}
                        </TableCell>
                        <TableCell>
                          {format(new Date(invoice.invoiceDate), 'dd/MM/yyyy', { locale })}
                        </TableCell>
                        <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDownloadPdf(invoice)}
                              title={t('actions.download')}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(invoice)}
                              title={t('common:actions.edit')}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            {isAdmin && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedInvoice(invoice);
                                  setIsDeleteOpen(true);
                                }}
                                title={t('common:actions.delete')}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </DataState>

        {/* Create/Edit Dialog */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedInvoice ? t('edit') : t('add')}
              </DialogTitle>
              <DialogDescription>
                {selectedInvoice 
                  ? `${t('form.invoiceNumber')}: ${selectedInvoice.invoiceNumber}`
                  : ''
                }
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('form.invoiceType')}</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: ClientInvoiceType) =>
                      setFormData((prev) => ({ ...prev, type: value }))
                    }
                    disabled={!!selectedInvoice}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="proforma">{t('type.proforma')}</SelectItem>
                      <SelectItem value="finale">{t('type.finale')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {selectedInvoice && (
                  <div className="space-y-2">
                    <Label>{t('status.label')}</Label>
                    <Select
                      value={(formData as UpdateClientInvoiceDto).status || selectedInvoice.status}
                      onValueChange={(value: ClientInvoiceStatus) =>
                        setFormData((prev) => ({ ...prev, status: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="brouillon">{t('status.brouillon')}</SelectItem>
                        <SelectItem value="envoyee">{t('status.envoyee')}</SelectItem>
                        <SelectItem value="payee">{t('status.payee')}</SelectItem>
                        <SelectItem value="annulee">{t('status.annulee')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('form.clientName')} *</Label>
                  <Input
                    value={formData.clientName || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, clientName: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('form.clientPassport')}</Label>
                  <Input
                    value={formData.clientPassport || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, clientPassport: e.target.value }))}
                    placeholder="P12345678"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('form.serviceName')} *</Label>
                  <Input
                    value={formData.serviceName || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, serviceName: e.target.value }))}
                    required
                    placeholder={i18n.language === 'ar' ? 'تذكرة طيران' : "Billet d'avion"}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('form.destination')}</Label>
                  <Input
                    value={formData.destination || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, destination: e.target.value }))}
                    placeholder="ALG-IST"
                  />
                </div>
              </div>

              {/* Travel Details Section */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('form.companyName')}</Label>
                  <Input
                    value={formData.companyName || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, companyName: e.target.value }))}
                    placeholder="Turkish Airlines"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('form.travelClass')}</Label>
                  <Select
                    value={formData.travelClass || ''}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, travelClass: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('form.travelClass')} />
                    </SelectTrigger>
                    <SelectContent>
                      {TRAVEL_CLASSES.map((cls) => (
                        <SelectItem key={cls.value} value={cls.value}>
                          {i18n.language === 'ar' ? cls.labelAr : cls.labelFr}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('form.departureDate')}</Label>
                  <Input
                    type="date"
                    value={formData.departureDate || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, departureDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('form.returnDate')}</Label>
                  <Input
                    type="date"
                    value={formData.returnDate || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, returnDate: e.target.value }))}
                  />
                </div>
              </div>

              {/* PNR for final invoices only */}
              {formData.type === 'finale' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('form.pnr')}</Label>
                    <Input
                      value={formData.pnr || ''}
                      onChange={(e) => setFormData((prev) => ({ ...prev, pnr: e.target.value.toUpperCase() }))}
                      placeholder="AB4K9Q"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('form.paymentMethod')}</Label>
                    <Select
                      value={formData.paymentMethod || ''}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, paymentMethod: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('form.paymentMethod')} />
                      </SelectTrigger>
                      <SelectContent>
                        {PAYMENT_METHODS.map((pm) => (
                          <SelectItem key={pm.value} value={pm.value}>
                            {i18n.language === 'ar' ? pm.labelAr : pm.labelFr}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Financial Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('form.ticketPrice')}</Label>
                  <Input
                    type="number"
                    min={0}
                    value={formData.ticketPrice || 0}
                    onChange={(e) => {
                      const ticketPrice = Number(e.target.value);
                      const agencyFees = formData.agencyFees || 0;
                      setFormData((prev) => ({
                        ...prev,
                        ticketPrice,
                        totalAmount: ticketPrice + agencyFees,
                      }));
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('form.agencyFees')}</Label>
                  <Input
                    type="number"
                    min={0}
                    value={formData.agencyFees || 0}
                    onChange={(e) => {
                      const agencyFees = Number(e.target.value);
                      const ticketPrice = formData.ticketPrice || 0;
                      setFormData((prev) => ({
                        ...prev,
                        agencyFees,
                        totalAmount: ticketPrice + agencyFees,
                      }));
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>{t('form.totalAmount')} *</Label>
                  <Input
                    type="number"
                    min={0}
                    value={formData.totalAmount || 0}
                    onChange={(e) => setFormData((prev) => ({ ...prev, totalAmount: Number(e.target.value) }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('form.paidAmount')}</Label>
                  <Input
                    type="number"
                    min={0}
                    value={formData.paidAmount || 0}
                    onChange={(e) => setFormData((prev) => ({ ...prev, paidAmount: Number(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('form.remaining')}</Label>
                  <Input
                    type="number"
                    value={(formData.totalAmount || 0) - (formData.paidAmount || 0)}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>

              {/* Validity hours for proforma */}
              {formData.type === 'proforma' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('form.validityHours')}</Label>
                    <Input
                      type="number"
                      min={1}
                      value={formData.validityHours || 48}
                      onChange={(e) => setFormData((prev) => ({ ...prev, validityHours: Number(e.target.value) }))}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>{t('form.notes')}</Label>
                <Textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsFormOpen(false)}>
                {t('common:actions.cancel')}
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!formData.clientName || !formData.serviceName || createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending
                  ? t('common:actions.saving')
                  : t('common:actions.save')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('deleteConfirm.title')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('deleteConfirm.description')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('common:actions.cancel')}</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {t('common:actions.delete')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
