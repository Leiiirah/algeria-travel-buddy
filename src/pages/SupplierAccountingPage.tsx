import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { fr, ar } from 'date-fns/locale';
import { Plus, ArrowDownCircle, ArrowUpCircle, Wallet, TrendingDown, CreditCard, FileText, Eye, Download, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { formatDZD, getTransactionTypeLabel } from '@/lib/utils';
import { api } from '@/lib/api';
import { SupplierTransactionType } from '@/types';
import { useSuppliers, useSuppliersWithBalance } from '@/hooks/useSuppliers';
import { useSupplierTransactions, useCreateSupplierTransaction } from '@/hooks/useSupplierTransactions';
import { useCommands } from '@/hooks/useCommands';
import { SupplierAccountingSkeleton } from '@/components/skeletons/SupplierAccountingSkeleton';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
import { SupplierOrdersTab } from '@/components/suppliers/SupplierOrdersTab';
import { SupplierReceiptsTab } from '@/components/suppliers/SupplierReceiptsTab';
import { SupplierInvoicesTab } from '@/components/suppliers/SupplierInvoicesTab';
import { useToast } from '@/hooks/use-toast';

const SupplierAccountingPage = () => {
  const { t, i18n } = useTranslation('suppliers');
  const { t: tCommon } = useTranslation('common');
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isPdfPreviewOpen, setIsPdfPreviewOpen] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);
  const [newTransaction, setNewTransaction] = useState({
    supplierId: '',
    type: 'sortie' as SupplierTransactionType,
    amount: '',
    note: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    file: null as File | null,
  });

  const dateLocale = i18n.language === 'ar' ? ar : fr;

  // React Query hooks
  const { data: suppliers } = useSuppliers();
  const { data: suppliersWithBalance, isLoading: suppliersLoading, isError: suppliersError, error, refetch } = useSuppliersWithBalance();
  const { data: transactions, isLoading: transactionsLoading } = useSupplierTransactions();
  const { data: supplierCommands } = useCommands(
    selectedSupplierId ? { supplierId: selectedSupplierId } : undefined
  );
  const createTransaction = useCreateSupplierTransaction();

  const isLoading = suppliersLoading || transactionsLoading;

  // Calculate totals for all suppliers
  const globalTotals = useMemo(() => {
    if (!suppliersWithBalance) {
      return { totalPurchased: 0, totalPaid: 0, totalRemaining: 0 };
    }

    const totalPurchased = suppliersWithBalance.reduce((sum, s) => sum + (s.totalBuyingPrice || 0), 0);
    const totalSortie = suppliersWithBalance.reduce((sum, s) => sum + (s.totalTransactionsSortie || 0), 0);
    const totalEntree = suppliersWithBalance.reduce((sum, s) => sum + (s.totalTransactionsEntree || 0), 0);
    const totalPaid = totalSortie - totalEntree;
    const totalRemaining = suppliersWithBalance.reduce((sum, s) => sum + (s.balance || 0), 0);

    return {
      totalPurchased,
      totalPaid,
      totalRemaining,
    };
  }, [suppliersWithBalance]);

  // Get supplier balances for the table
  const supplierBalances = useMemo(() => {
    if (!suppliersWithBalance) return [];

    return suppliersWithBalance.map((supplier) => {
      return {
        supplier: supplier,
        totalPurchased: supplier.totalBuyingPrice || 0,
        totalPaid: (supplier.totalTransactionsSortie || 0) - (supplier.totalTransactionsEntree || 0),
        remainingBalance: supplier.balance || 0,
      };
    });
  }, [suppliersWithBalance]);

  // Sort transactions by date (newest first)
  const sortedTransactions = useMemo(() => {
    if (!transactions) return [];
    return [...transactions].sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [transactions]);

  const handleOpenDialog = (supplierId?: string) => {
    if (supplierId) {
      setNewTransaction((prev) => ({ ...prev, supplierId }));
    }
    setIsDialogOpen(true);
  };

  const handleOpenDetails = (supplierId: string) => {
    setSelectedSupplierId(supplierId);
    setIsDetailsOpen(true);
  };

  const handleViewPdf = (transactionId: string) => {
    setSelectedTransactionId(transactionId);
    setIsPdfPreviewOpen(true);
  };

  const handleDownloadPdf = async (transactionId: string) => {
    try {
      const blob = await api.getTransactionReceiptBlob(transactionId, 'download');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${transactionId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download PDF:', error);
      toast({
        title: t('accounting.transaction.downloadError'),
        variant: 'destructive',
      });
    }
  };

  // Fetch PDF blob when preview dialog opens
  useEffect(() => {
    if (isPdfPreviewOpen && selectedTransactionId) {
      setIsPdfLoading(true);
      setPdfBlobUrl(null);
      
      api.getTransactionReceiptBlob(selectedTransactionId, 'view')
        .then(blob => {
          const url = URL.createObjectURL(blob);
          setPdfBlobUrl(url);
        })
        .catch(error => {
          console.error('Failed to load PDF:', error);
          toast({
            title: t('accounting.transaction.loadError'),
            variant: 'destructive',
          });
        })
        .finally(() => setIsPdfLoading(false));
    }
    
    // Cleanup blob URL when dialog closes
    return () => {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
    };
  }, [isPdfPreviewOpen, selectedTransactionId]);

  const handleAddTransaction = () => {
    if (!newTransaction.supplierId || !newTransaction.amount) {
      return;
    }

    const amount = parseFloat(newTransaction.amount);
    if (isNaN(amount) || amount <= 0) {
      return;
    }

    createTransaction.mutate(
      {
        supplierId: newTransaction.supplierId,
        type: newTransaction.type,
        amount,
        note: newTransaction.note,
        date: newTransaction.date,
        file: newTransaction.file || undefined,
      },
      {
        onSuccess: () => {
          setNewTransaction({
            supplierId: '',
            type: 'sortie',
            amount: '',
            note: '',
            date: format(new Date(), 'yyyy-MM-dd'),
            file: null,
          });
          setIsDialogOpen(false);
        },
      }
    );
  };

  const getSupplierName = (supplierId: string) => {
    return suppliers?.find((s) => s.id === supplierId)?.name ?? 'N/A';
  };

  const getBalanceStyle = (remaining: number) => {
    if (remaining > 0) return 'text-destructive font-bold';
    return 'text-success font-semibold';
  };

  const getBalanceDisplay = (remaining: number) => {
    if (remaining < 0) {
      return `${tCommon('credit')}: ${formatDZD(Math.abs(remaining))}`;
    }
    return formatDZD(remaining);
  };

  if (isLoading) {
    return (
      <DashboardLayout title={t('accounting.title')} subtitle={t('accounting.subtitle')}>
        <SupplierAccountingSkeleton />
      </DashboardLayout>
    );
  }

  if (suppliersError) {
    return (
      <DashboardLayout title={t('accounting.title')} subtitle={t('accounting.subtitle')}>
        <ErrorState message={error?.message} onRetry={refetch} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={t('accounting.title')} subtitle={t('accounting.subtitle')}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t('accounting.title')}</h1>
            <p className="text-muted-foreground">
              {t('accounting.subtitle')}
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
                {tCommon('actions.newTransaction')}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{tCommon('actions.newTransaction')}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="supplier">{t('table.supplier')} *</Label>
                  <Select
                    value={newTransaction.supplierId}
                    onValueChange={(value) =>
                      setNewTransaction({ ...newTransaction, supplierId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={tCommon('select.supplier')} />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers?.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-4 space-y-2">
                          <p className="text-sm text-muted-foreground text-center">
                            {t('empty.title')}
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
                            {tCommon('actions.addSupplier')}
                          </Button>
                        </div>
                      ) : (
                        suppliers?.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">{tCommon('transactionType')} *</Label>
                  <Select
                    value={newTransaction.type}
                    onValueChange={(value) =>
                      setNewTransaction({
                        ...newTransaction,
                        type: value as SupplierTransactionType,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sortie">
                        <div className="flex items-center gap-2">
                          <ArrowUpCircle className="h-4 w-4 text-destructive" />
                          {t('accounting.transaction.payment')}
                        </div>
                      </SelectItem>
                      <SelectItem value="entree">
                        <div className="flex items-center gap-2">
                          <ArrowDownCircle className="h-4 w-4 text-success" />
                          {t('accounting.transaction.refund')}
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="amount">{tCommon('amount')} (DZD) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="0"
                    value={newTransaction.amount}
                    onChange={(e) =>
                      setNewTransaction({ ...newTransaction, amount: e.target.value })
                    }
                    placeholder="Ex: 50000"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="date">{tCommon('date')}</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newTransaction.date}
                    onChange={(e) =>
                      setNewTransaction({ ...newTransaction, date: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="note">{tCommon('note')}</Label>
                  <Textarea
                    id="note"
                    value={newTransaction.note}
                    onChange={(e) =>
                      setNewTransaction({ ...newTransaction, note: e.target.value })
                    }
                    placeholder={tCommon('notePlaceholder')}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="receipt">{t('accounting.transaction.receipt')}</Label>
                  <Input
                    id="receipt"
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setNewTransaction({ ...newTransaction, file });
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                    {t('accounting.transaction.receiptHint')}
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  {tCommon('actions.cancel')}
                </Button>
                <Button onClick={handleAddTransaction} disabled={createTransaction.isPending}>
                  {createTransaction.isPending ? tCommon('actions.saving') : tCommon('actions.save')}
                </Button>
              </DialogFooter>
            </DialogContent>

          </Dialog>

          {/* Supplier Details Dialog */}
          <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{tCommon('purchaseHistory')} - {getSupplierName(selectedSupplierId || '')}</DialogTitle>
              </DialogHeader>
              <div className="mt-4">
                {!supplierCommands ? (
                  <div className="text-center py-4">{tCommon('loading')}</div>
                ) : supplierCommands.data.length === 0 ? (
                  <EmptyState
                    title={tCommon('noPurchases')}
                    description={tCommon('noOrdersForSupplier')}
                    icon={CreditCard}
                  />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{tCommon('date')}</TableHead>
                        <TableHead>{tCommon('client')}</TableHead>
                        <TableHead>{tCommon('destination')}</TableHead>
                        <TableHead className="text-right">{tCommon('buyingPrice')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {supplierCommands.data.map((cmd) => (
                        <TableRow key={cmd.id}>
                          <TableCell>
                            {format(new Date(cmd.createdAt), 'dd MMM yyyy', { locale: dateLocale })}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{cmd.data.clientFullName}</div>
                          </TableCell>
                          <TableCell>{cmd.destination}</TableCell>
                          <TableCell className="text-right font-bold text-destructive">
                            {formatDZD(cmd.buyingPrice)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </DialogContent>
          </Dialog>

          {/* PDF Preview Dialog */}
          <Dialog open={isPdfPreviewOpen} onOpenChange={(open) => {
            setIsPdfPreviewOpen(open);
            if (!open) {
              // Cleanup blob URL when dialog closes
              if (pdfBlobUrl) {
                URL.revokeObjectURL(pdfBlobUrl);
                setPdfBlobUrl(null);
              }
              setSelectedTransactionId(null);
            }
          }}>
            <DialogContent className="max-w-4xl h-[80vh]">
              <DialogHeader>
                <DialogTitle>{t('accounting.transaction.viewReceipt')}</DialogTitle>
              </DialogHeader>
              <div className="flex-1 h-full min-h-[500px]">
                {isPdfLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : pdfBlobUrl ? (
                  <iframe
                    src={pdfBlobUrl}
                    className="w-full h-full border-0 rounded-md"
                    title="PDF Receipt"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    {t('accounting.transaction.loadError')}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('accounting.balance.totalDue')}</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatDZD(globalTotals.totalPurchased)}</div>
              <p className="text-xs text-muted-foreground">
                {tCommon('totalOwedToSuppliers')}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('accounting.balance.totalPaid')}</CardTitle>
              <CreditCard className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {formatDZD(globalTotals.totalPaid)}
              </div>
              <p className="text-xs text-muted-foreground">
                {tCommon('paymentsMadeToSuppliers')}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('accounting.balance.currentBalance')}</CardTitle>
              <TrendingDown className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${globalTotals.totalRemaining > 0 ? 'text-destructive' : 'text-success'}`}>
                {globalTotals.totalRemaining < 0
                  ? `${tCommon('credit')}: ${formatDZD(Math.abs(globalTotals.totalRemaining))}`
                  : formatDZD(globalTotals.totalRemaining)}
              </div>
              <p className="text-xs text-muted-foreground">
                {tCommon('globalSupplierBalance')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="situation" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
            <TabsTrigger value="situation">{t('accounting.tabs.situation')}</TabsTrigger>
            <TabsTrigger value="historique">{t('accounting.tabs.history')}</TabsTrigger>
            <TabsTrigger value="commandes">{t('accounting.tabs.orders')}</TabsTrigger>
            <TabsTrigger value="recus">{t('accounting.tabs.receipts')}</TabsTrigger>
            <TabsTrigger value="factures">{t('accounting.tabs.invoices')}</TabsTrigger>
          </TabsList>

          {/* Supplier Situation Tab */}
          <TabsContent value="situation">
            <Card>
              <CardHeader>
                <CardTitle>{tCommon('balanceBySupplier')}</CardTitle>
              </CardHeader>
              <CardContent>
                {supplierBalances.length === 0 ? (
                  <EmptyState
                    title={tCommon('noTransactions')}
                    description={tCommon('supplierBalancesAppearHere')}
                    icon={Wallet}
                  />
                ) : (
                  <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('table.supplier')}</TableHead>
                        <TableHead className="text-right">{t('accounting.balance.totalDue')}</TableHead>
                        <TableHead className="text-right">{t('accounting.balance.totalPaid')}</TableHead>
                        <TableHead className="text-right">{t('accounting.balance.currentBalance')}</TableHead>
                        <TableHead className="text-right">{tCommon('actions.label')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {supplierBalances.map((item) => (
                        <TableRow key={item.supplier.id}>
                          <TableCell className="font-medium">{item.supplier.name}</TableCell>
                          <TableCell className="text-right">{formatDZD(item.totalPurchased)}</TableCell>
                          <TableCell className="text-right text-success">{formatDZD(item.totalPaid)}</TableCell>
                          <TableCell className={`text-right ${getBalanceStyle(item.remainingBalance)}`}>
                            {getBalanceDisplay(item.remainingBalance)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenDetails(item.supplier.id)}
                              >
                                {tCommon('details')}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenDialog(item.supplier.id)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transaction History Tab */}
          <TabsContent value="historique">
            <Card>
              <CardHeader>
                <CardTitle>{t('accounting.tabs.history')}</CardTitle>
              </CardHeader>
              <CardContent>
                {sortedTransactions.length === 0 ? (
                  <EmptyState
                    title={tCommon('noTransactions')}
                    description={tCommon('transactionsAppearHere')}
                    icon={Wallet}
                  />
                ) : (
                  <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{tCommon('date')}</TableHead>
                        <TableHead>{t('table.supplier')}</TableHead>
                        <TableHead>{tCommon('type')}</TableHead>
                        <TableHead className="text-right">{tCommon('amount')}</TableHead>
                        <TableHead>{tCommon('note')}</TableHead>
                        <TableHead>{t('accounting.transaction.receipt')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedTransactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            {format(new Date(transaction.date), 'dd MMM yyyy', { locale: dateLocale })}
                          </TableCell>
                          <TableCell className="font-medium">
                            {getSupplierName(transaction.supplierId)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {transaction.type === 'sortie' ? (
                                <ArrowUpCircle className="h-4 w-4 text-destructive" />
                              ) : (
                                <ArrowDownCircle className="h-4 w-4 text-success" />
                              )}
                              {transaction.type === 'sortie' ? t('accounting.transaction.payment') : t('accounting.transaction.refund')}
                            </div>
                          </TableCell>
                          <TableCell className={`text-right font-medium ${transaction.type === 'sortie' ? 'text-destructive' : 'text-success'}`}>
                            {transaction.type === 'sortie' ? '-' : '+'}{formatDZD(transaction.amount)}
                          </TableCell>
                          <TableCell className="text-muted-foreground max-w-[200px] truncate">
                            {transaction.note || '-'}
                          </TableCell>
                          <TableCell>
                            {transaction.receiptUrl ? (
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewPdf(transaction.id)}
                                  title={t('accounting.transaction.viewReceipt')}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDownloadPdf(transaction.id)}
                                  title={t('accounting.transaction.downloadReceipt')}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="commandes">
            <SupplierOrdersTab suppliers={suppliers || []} />
          </TabsContent>

          {/* Receipts Tab */}
          <TabsContent value="recus">
            <SupplierReceiptsTab suppliers={suppliers || []} />
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="factures">
            <SupplierInvoicesTab suppliers={suppliers || []} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default SupplierAccountingPage;
