import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { fr, ar } from 'date-fns/locale';
import { Plus, Wallet, CreditCard, Banknote, Trash2, Eye, FileText, TrendingUp, AlertCircle, ClipboardList } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useUsers } from '@/hooks/useUsers';
import {
  useEmployeeTransactions,
  useAllEmployeeBalances,
  useCreateEmployeeTransaction,
  useDeleteEmployeeTransaction,
  useEmployeeCommands,
  useEmployeeStatsById,
} from '@/hooks/useEmployeeTransactions';
import { useEmployeeStats } from '@/hooks/useAnalytics';
import { useCommands } from '@/hooks/useCommands';
import { EmployeeTransactionType } from '@/types';
import { AdvancedFilter, FilterConfig } from '@/components/search/AdvancedFilter';
import { useDebounce } from '@/hooks/useDebounce';
import { StatsCard } from '@/components/dashboard/StatsCard';

export default function EmployeeAccountingPage() {
  const { t, i18n } = useTranslation('employees');
  const { t: tCommon } = useTranslation('common');
  const { isAdmin } = useAuth();
  const { data: transactions, isLoading: loadingTransactions, isError: isTransactionsError } = useEmployeeTransactions();
  const { data: balances, isLoading: loadingBalances } = useAllEmployeeBalances();
  const { data: users } = useUsers();
  const { data: employeeStats, isLoading: loadingStats, isError: statsError, refetch: refetchStats } = useEmployeeStats();
  const { data: commandsData, isLoading: loadingCommands } = useCommands();
  const createTransaction = useCreateEmployeeTransaction();
  const deleteTransaction = useDeleteEmployeeTransaction();

  // Commands list for employees (API already filters by createdBy for non-admins)
  const myCommands = !isAdmin ? (commandsData?.data || []) : [];

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [employeeDetailTab, setEmployeeDetailTab] = useState<'sales' | 'transactions'>('sales');
  const [formData, setFormData] = useState({
    employeeId: '',
    type: 'avance' as EmployeeTransactionType,
    amount: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    month: format(new Date(), 'yyyy-MM'),
    note: '',
  });

  // Admin: fetch selected employee's commands and stats
  const { data: employeeCommandsData, isLoading: loadingEmployeeCommands } = useEmployeeCommands(selectedEmployeeId || '');
  const { data: selectedEmployeeStats, isLoading: loadingSelectedStats } = useEmployeeStatsById(selectedEmployeeId || '');
  const employeeCommands = employeeCommandsData?.data || [];

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, any>>({});
  const debouncedSearch = useDebounce(searchQuery, 300);

  const isLoading = loadingTransactions || loadingBalances || loadingStats;
  const dateLocale = i18n.language === 'ar' ? ar : fr;

  // Calculate totals
  const totals = {
    avances: transactions?.filter(t => t.type === 'avance').reduce((sum, t) => sum + Number(t.amount), 0) || 0,
    credits: transactions?.filter(t => t.type === 'credit').reduce((sum, t) => sum + Number(t.amount), 0) || 0,
    salaires: transactions?.filter(t => t.type === 'salaire').reduce((sum, t) => sum + Number(t.amount), 0) || 0,
  };

  // Filter employees (exclude admin)
  const employees = users?.filter(u => u.role === 'employee' && u.isActive) || [];

  // Filter configuration for AdvancedFilter component
  const filterConfig: FilterConfig[] = useMemo(() => [
    {
      key: 'employeeId',
      label: t('table.employee'),
      type: 'select',
      options: employees.map(e => ({ value: e.id, label: `${e.firstName} ${e.lastName}` })),
    },
    {
      key: 'type',
      label: t('accounting.dialog.type'),
      type: 'select',
      options: [
        { value: 'avance', label: t('accounting.transactionTypes.avance') },
        { value: 'credit', label: t('accounting.transactionTypes.credit') },
        { value: 'salaire', label: t('accounting.transactionTypes.salaire') },
      ],
    },
    {
      key: 'fromDate',
      label: tCommon('filters.fromDate'),
      type: 'date-range',
    },
    {
      key: 'toDate',
      label: tCommon('filters.toDate'),
      type: 'date-range',
    },
  ], [employees, t, tCommon]);

  // Filtered transactions based on search and filters
  const filteredTransactions = useMemo(() => {
    if (!transactions) return [];

    return transactions.filter(t => {
      // Search filter
      if (debouncedSearch) {
        const searchLower = debouncedSearch.toLowerCase();
        const employeeName = `${t.employee?.firstName || ''} ${t.employee?.lastName || ''}`.toLowerCase();
        const noteMatch = t.note?.toLowerCase().includes(searchLower);
        if (!employeeName.includes(searchLower) && !noteMatch) return false;
      }

      // Employee filter
      if (filters.employeeId && t.employeeId !== filters.employeeId) return false;

      // Type filter
      if (filters.type && t.type !== filters.type) return false;

      // Date range filter
      if (filters.fromDate) {
        const fromDate = new Date(filters.fromDate);
        fromDate.setHours(0, 0, 0, 0);
        if (new Date(t.date) < fromDate) return false;
      }
      if (filters.toDate) {
        const toDate = new Date(filters.toDate);
        toDate.setHours(23, 59, 59, 999);
        if (new Date(t.date) > toDate) return false;
      }

      return true;
    });
  }, [transactions, debouncedSearch, filters]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await createTransaction.mutateAsync({
      employeeId: formData.employeeId,
      type: formData.type,
      amount: parseFloat(formData.amount),
      date: formData.date,
      month: formData.type === 'salaire' ? formData.month : undefined,
      note: formData.note || undefined,
    });

    setIsDialogOpen(false);
    setFormData({
      employeeId: '',
      type: 'avance',
      amount: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      month: format(new Date(), 'yyyy-MM'),
      note: '',
    });
  };

  const handleDelete = async (id: string) => {
    await deleteTransaction.mutateAsync(id);
  };

  const getTypeBadgeVariant = (type: EmployeeTransactionType) => {
    switch (type) {
      case 'avance':
        return 'default';
      case 'credit':
        return 'destructive';
      case 'salaire':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  // Get transactions for selected employee
  const selectedEmployeeTransactions = selectedEmployeeId 
    ? transactions?.filter(t => t.employeeId === selectedEmployeeId) 
    : [];

  const selectedEmployee = selectedEmployeeId 
    ? users?.find(u => u.id === selectedEmployeeId) 
    : null;

  if (isLoading) {
    return (
      <DashboardLayout title={t('accounting.title')}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-10 w-48" />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Skeleton className="h-10 w-80" />
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-4 flex-1" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={t('accounting.title')} subtitle={t('accounting.subtitle')}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">{t('accounting.title')}</h1>
          {isAdmin && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
                  {t('accounting.newTransaction')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('accounting.dialog.title')}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>{t('table.employee')}</Label>
                    <Select
                      value={formData.employeeId}
                      onValueChange={(value) => setFormData({ ...formData, employeeId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('accounting.dialog.selectEmployee')} />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map((emp) => (
                          <SelectItem key={emp.id} value={emp.id}>
                            {emp.firstName} {emp.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>{t('accounting.dialog.type')}</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData({ ...formData, type: value as EmployeeTransactionType })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="avance">{t('accounting.transactionTypes.avance')}</SelectItem>
                        <SelectItem value="credit">{t('accounting.transactionTypes.credit')}</SelectItem>
                        <SelectItem value="salaire">{t('accounting.transactionTypes.salaire')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>{t('accounting.dialog.amount')}</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{t('accounting.dialog.date')}</Label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>

                  {formData.type === 'salaire' && (
                    <div className="space-y-2">
                      <Label>{t('accounting.dialog.month')}</Label>
                      <Input
                        type="month"
                        value={formData.month}
                        onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>{t('accounting.dialog.note')}</Label>
                    <Textarea
                      value={formData.note}
                      onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                      placeholder={t('accounting.dialog.notePlaceholder')}
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      {tCommon('actions.cancel')}
                    </Button>
                    <Button type="submit" disabled={createTransaction.isPending}>
                      {createTransaction.isPending ? tCommon('actions.saving') : tCommon('actions.save')}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* My Performance Section - For non-admin users */}
        {!isAdmin && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">{t('accounting.myPerformance.title')}</h2>
            
            {loadingStats ? (
              <div className="grid gap-4 md:grid-cols-4">
                {[1, 2, 3, 4].map(i => (
                  <Card key={i}>
                    <CardContent className="pt-6">
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-8 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : statsError ? (
              <Card className="border-destructive/50 bg-destructive/5">
                <CardContent className="pt-6 text-center">
                  <AlertCircle className="h-8 w-8 mx-auto text-destructive mb-2" />
                  <p className="text-muted-foreground">{tCommon('errors.loadFailed')}</p>
                  <Button variant="outline" size="sm" className="mt-4" onClick={() => refetchStats()}>
                    {tCommon('actions.retry')}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-4">
                <StatsCard
                  title={t('accounting.myPerformance.myCommands')}
                  value={employeeStats?.totalCommands ?? 0}
                  icon={ClipboardList}
                  variant="info"
                />
                <StatsCard
                  title={t('accounting.myPerformance.myRevenue')}
                  value={`${(employeeStats?.totalRevenue ?? 0).toLocaleString(i18n.language === 'ar' ? 'ar-DZ' : 'fr-DZ')} DZD`}
                  icon={FileText}
                  variant="primary"
                />
                <StatsCard
                  title={t('accounting.myPerformance.myProfit')}
                  value={`${(employeeStats?.totalProfit ?? 0).toLocaleString(i18n.language === 'ar' ? 'ar-DZ' : 'fr-DZ')} DZD`}
                  icon={TrendingUp}
                  variant="success"
                />
                <StatsCard
                  title={t('accounting.myPerformance.clientPending')}
                  value={`${(employeeStats?.pendingAmount ?? 0).toLocaleString(i18n.language === 'ar' ? 'ar-DZ' : 'fr-DZ')} DZD`}
                  icon={AlertCircle}
                  variant="warning"
                />
              </div>
            )}
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('accounting.stats.totalAdvances')}</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totals.avances.toLocaleString(i18n.language === 'ar' ? 'ar-DZ' : 'fr-DZ')} DZD</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('accounting.stats.totalCredits')}</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{totals.credits.toLocaleString(i18n.language === 'ar' ? 'ar-DZ' : 'fr-DZ')} DZD</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('accounting.stats.totalSalaries')}</CardTitle>
              <Banknote className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{totals.salaires.toLocaleString(i18n.language === 'ar' ? 'ar-DZ' : 'fr-DZ')} DZD</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="balances">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="balances">{t('accounting.tabs.balances')}</TabsTrigger>
            <TabsTrigger value="history">{t('accounting.tabs.history')}</TabsTrigger>
          </TabsList>

          <TabsContent value="balances" className="mt-4">
            <Card>
              <CardContent className="pt-6">
                <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('accounting.table.employee')}</TableHead>
                      <TableHead className="text-right">{t('accounting.table.advances')}</TableHead>
                      <TableHead className="text-right">{t('accounting.table.credits')}</TableHead>
                      <TableHead className="text-right">{t('accounting.table.salaries')}</TableHead>
                      <TableHead className="text-right">{t('accounting.table.balance')}</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {balances?.map((balance) => (
                      <TableRow key={balance.employeeId}>
                        <TableCell className="font-medium">
                          {balance.firstName} {balance.lastName}
                        </TableCell>
                        <TableCell className="text-right">
                          {balance.totalAvances.toLocaleString(i18n.language === 'ar' ? 'ar-DZ' : 'fr-DZ')} DZD
                        </TableCell>
                        <TableCell className="text-right text-destructive">
                          {balance.totalCredits.toLocaleString(i18n.language === 'ar' ? 'ar-DZ' : 'fr-DZ')} DZD
                        </TableCell>
                        <TableCell className="text-right text-primary">
                          {balance.totalSalaires.toLocaleString(i18n.language === 'ar' ? 'ar-DZ' : 'fr-DZ')} DZD
                        </TableCell>
                        <TableCell className={`text-right font-bold ${balance.balance >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                          {balance.balance.toLocaleString(i18n.language === 'ar' ? 'ar-DZ' : 'fr-DZ')} DZD
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedEmployeeId(balance.employeeId)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!balances || balances.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          {tCommon('noData')}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="mt-4 space-y-6">
            {/* My Commands Section - For employees only */}
            {!isAdmin && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('accounting.commandHistory.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingCommands ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-4">
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-4 flex-1" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      ))}
                    </div>
                  ) : myCommands.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">{t('accounting.commandHistory.empty')}</p>
                  ) : (
                    <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('accounting.commandHistory.date')}</TableHead>
                          <TableHead>{t('accounting.commandHistory.client')}</TableHead>
                          <TableHead>{t('accounting.commandHistory.service')}</TableHead>
                          <TableHead className="text-right">{t('accounting.commandHistory.sellingPrice')}</TableHead>
                          <TableHead className="text-right">{t('accounting.commandHistory.amountPaid')}</TableHead>
                          <TableHead className="text-right">{t('accounting.commandHistory.remaining')}</TableHead>
                          <TableHead className="text-right">{t('accounting.commandHistory.profit')}</TableHead>
                          <TableHead>{t('accounting.commandHistory.status')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {myCommands.map((command) => {
                          const sellingPrice = Number(command.sellingPrice || 0);
                          const amountPaid = Number(command.amountPaid || 0);
                          const buyingPrice = Number(command.buyingPrice || 0);
                          const remaining = sellingPrice - amountPaid;
                          const profit = sellingPrice - buyingPrice;
                          // Extract client name from command data - check multiple possible field names
                          const commandData = command.data as unknown as Record<string, unknown>;
                          const clientName = (commandData?.clientFullName || commandData?.nomPrenom || commandData?.clientName || '-') as string;
                          // Get service name from the populated relation (returned by API)
                          const serviceName = ((command as unknown as { service?: { name: string } }).service?.name) || '-';

                          return (
                            <TableRow key={command.id}>
                              <TableCell>
{format(new Date(command.commandDate || command.createdAt), 'dd MMM yyyy', { locale: dateLocale })}
                              </TableCell>
                              <TableCell className="font-medium">{clientName}</TableCell>
                              <TableCell>{serviceName}</TableCell>
                              <TableCell className="text-right">
                                {sellingPrice.toLocaleString(i18n.language === 'ar' ? 'ar-DZ' : 'fr-DZ')} DZD
                              </TableCell>
                              <TableCell className="text-right text-primary">
                                {amountPaid.toLocaleString(i18n.language === 'ar' ? 'ar-DZ' : 'fr-DZ')} DZD
                              </TableCell>
                              <TableCell className={`text-right ${remaining > 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                                {remaining.toLocaleString(i18n.language === 'ar' ? 'ar-DZ' : 'fr-DZ')} DZD
                              </TableCell>
                              <TableCell className={`text-right font-medium ${profit >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                                {profit.toLocaleString(i18n.language === 'ar' ? 'ar-DZ' : 'fr-DZ')} DZD
                              </TableCell>
                              <TableCell>
                                <Badge variant={command.status === 'refuse' ? 'destructive' : command.status === 'retire' || command.status === 'visa_delivre' ? 'default' : 'secondary'}>
                                  {command.status?.replace(/_/g, ' ')}
                                </Badge>
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
            )}

            {/* Transactions Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{!isAdmin ? t('accounting.transactionHistory.title') : t('accounting.tabs.history')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <AdvancedFilter
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  filters={filters}
                  onFilterChange={setFilters}
                  filterConfig={filterConfig}
                  placeholder={tCommon('search.placeholder')}
                />
                <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('accounting.dialog.date')}</TableHead>
                      <TableHead>{t('accounting.table.employee')}</TableHead>
                      <TableHead>{t('accounting.dialog.type')}</TableHead>
                      <TableHead className="text-right">{t('accounting.dialog.amount')}</TableHead>
                      <TableHead>{t('accounting.dialog.note')}</TableHead>
                      {isAdmin && <TableHead className="w-[50px]"></TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          {format(new Date(transaction.date), 'dd MMM yyyy', { locale: dateLocale })}
                        </TableCell>
                        <TableCell className="font-medium">
                          {transaction.employee?.firstName} {transaction.employee?.lastName}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getTypeBadgeVariant(transaction.type)}>
                            {t(`accounting.transactionTypes.${transaction.type}`)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {Number(transaction.amount).toLocaleString(i18n.language === 'ar' ? 'ar-DZ' : 'fr-DZ')} DZD
                        </TableCell>
                        <TableCell className="text-muted-foreground max-w-[200px] truncate">
                          {transaction.note || '-'}
                        </TableCell>
                        {isAdmin && (
                          <TableCell>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>{tCommon('confirmDelete.title')}</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {tCommon('confirmDelete.description')}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>{tCommon('actions.cancel')}</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(transaction.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    {tCommon('actions.delete')}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                    {filteredTransactions.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={isAdmin ? 6 : 5} className="text-center text-muted-foreground py-8">
                          {tCommon('noData')}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Employee Details Dialog - Enhanced with tabs for sales and transactions */}
        <Dialog open={!!selectedEmployeeId} onOpenChange={(open) => {
          if (!open) {
            setSelectedEmployeeId(null);
            setEmployeeDetailTab('sales');
          }
        }}>
          <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>
                {selectedEmployee ? `${selectedEmployee.firstName} ${selectedEmployee.lastName}` : t('accounting.table.employee')}
              </DialogTitle>
            </DialogHeader>
            
            {/* Performance Stats Cards */}
            <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
              {loadingSelectedStats ? (
                <>
                  {[1, 2, 3, 4].map(i => (
                    <Card key={i} className="p-3">
                      <Skeleton className="h-4 w-16 mb-2" />
                      <Skeleton className="h-6 w-24" />
                    </Card>
                  ))}
                </>
              ) : (
                <>
                  <Card className="p-3">
                    <p className="text-xs text-muted-foreground">{t('accounting.employeeDetails.stats.commands')}</p>
                    <p className="text-lg font-bold">{selectedEmployeeStats?.totalCommands ?? 0}</p>
                  </Card>
                  <Card className="p-3">
                    <p className="text-xs text-muted-foreground">{t('accounting.employeeDetails.stats.revenue')}</p>
                    <p className="text-lg font-bold text-primary">{(selectedEmployeeStats?.totalRevenue ?? 0).toLocaleString(i18n.language === 'ar' ? 'ar-DZ' : 'fr-DZ')} DZD</p>
                  </Card>
                  <Card className="p-3">
                    <p className="text-xs text-muted-foreground">{t('accounting.employeeDetails.stats.profit')}</p>
                    <p className="text-lg font-bold text-green-600">{(selectedEmployeeStats?.totalProfit ?? 0).toLocaleString(i18n.language === 'ar' ? 'ar-DZ' : 'fr-DZ')} DZD</p>
                  </Card>
                  <Card className="p-3">
                    <p className="text-xs text-muted-foreground">{t('accounting.employeeDetails.stats.pending')}</p>
                    <p className="text-lg font-bold text-destructive">{(selectedEmployeeStats?.pendingAmount ?? 0).toLocaleString(i18n.language === 'ar' ? 'ar-DZ' : 'fr-DZ')} DZD</p>
                  </Card>
                </>
              )}
            </div>

            {/* Tabs for Sales and Transactions */}
            <Tabs value={employeeDetailTab} onValueChange={(v) => setEmployeeDetailTab(v as 'sales' | 'transactions')} className="flex-1 overflow-hidden flex flex-col">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="sales">{t('accounting.employeeDetails.tabs.sales')}</TabsTrigger>
                <TabsTrigger value="transactions">{t('accounting.employeeDetails.tabs.transactions')}</TabsTrigger>
              </TabsList>

              <TabsContent value="sales" className="flex-1 overflow-y-auto mt-2">
                {loadingEmployeeCommands ? (
                  <div className="space-y-3 py-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-4">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 flex-1" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    ))}
                  </div>
                ) : employeeCommands.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">{t('accounting.employeeDetails.noSales')}</p>
                ) : (
                  <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('accounting.commandHistory.date')}</TableHead>
                        <TableHead>{t('accounting.commandHistory.client')}</TableHead>
                        <TableHead>{t('accounting.commandHistory.service')}</TableHead>
                        <TableHead className="text-right">{t('accounting.commandHistory.sellingPrice')}</TableHead>
                        <TableHead className="text-right">{t('accounting.commandHistory.amountPaid')}</TableHead>
                        <TableHead className="text-right">{t('accounting.commandHistory.remaining')}</TableHead>
                        <TableHead className="text-right">{t('accounting.commandHistory.profit')}</TableHead>
                        <TableHead>{t('accounting.commandHistory.status')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {employeeCommands.map((command) => {
                        const sellingPrice = Number(command.sellingPrice || 0);
                        const amountPaid = Number(command.amountPaid || 0);
                        const buyingPrice = Number(command.buyingPrice || 0);
                        const remaining = sellingPrice - amountPaid;
                        const profit = sellingPrice - buyingPrice;
                        const commandData = command.data as unknown as Record<string, unknown>;
                        const clientName = (commandData?.clientFullName || commandData?.nomPrenom || commandData?.clientName || '-') as string;
                        const serviceName = ((command as unknown as { service?: { name: string } }).service?.name) || '-';

                        return (
                          <TableRow key={command.id}>
                            <TableCell>
                              {format(new Date(command.commandDate || command.createdAt), 'dd MMM yyyy', { locale: dateLocale })}
                            </TableCell>
                            <TableCell className="font-medium">{clientName}</TableCell>
                            <TableCell>{serviceName}</TableCell>
                            <TableCell className="text-right">
                              {sellingPrice.toLocaleString(i18n.language === 'ar' ? 'ar-DZ' : 'fr-DZ')} DZD
                            </TableCell>
                            <TableCell className="text-right text-primary">
                              {amountPaid.toLocaleString(i18n.language === 'ar' ? 'ar-DZ' : 'fr-DZ')} DZD
                            </TableCell>
                            <TableCell className={`text-right ${remaining > 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                              {remaining.toLocaleString(i18n.language === 'ar' ? 'ar-DZ' : 'fr-DZ')} DZD
                            </TableCell>
                            <TableCell className={`text-right font-medium ${profit >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                              {profit.toLocaleString(i18n.language === 'ar' ? 'ar-DZ' : 'fr-DZ')} DZD
                            </TableCell>
                            <TableCell>
                              <Badge variant={command.status === 'refuse' ? 'destructive' : command.status === 'retire' || command.status === 'visa_delivre' ? 'default' : 'secondary'}>
                                {command.status?.replace(/_/g, ' ')}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="transactions" className="flex-1 overflow-y-auto mt-2">
                <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('accounting.dialog.date')}</TableHead>
                      <TableHead>{t('accounting.dialog.type')}</TableHead>
                      <TableHead className="text-right">{t('accounting.dialog.amount')}</TableHead>
                      <TableHead>{t('accounting.dialog.note')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedEmployeeTransactions?.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          {format(new Date(transaction.date), 'dd MMM yyyy', { locale: dateLocale })}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getTypeBadgeVariant(transaction.type)}>
                            {t(`accounting.transactionTypes.${transaction.type}`)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {Number(transaction.amount).toLocaleString(i18n.language === 'ar' ? 'ar-DZ' : 'fr-DZ')} DZD
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {transaction.note || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!selectedEmployeeTransactions || selectedEmployeeTransactions.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                          {tCommon('noData')}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
