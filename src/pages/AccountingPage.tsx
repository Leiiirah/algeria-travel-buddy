import { useState, useMemo, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  DollarSign,
  TrendingUp,
  CreditCard,
  Receipt,
  Plus,
} from 'lucide-react';
import {
  formatDZD,
  getPaymentMethodLabel,
  getPaymentStatusFromAmounts,
} from '@/lib/utils';
import { PaymentMethod, calculateRemainingBalance, calculateNetProfit } from '@/types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { usePayments, useCreatePayment } from '@/hooks/usePayments';
import { PaymentFilters } from '@/lib/api';
import { AdvancedFilter } from '@/components/search/AdvancedFilter';
import { useCommands } from '@/hooks/useCommands';
import { useServices } from '@/hooks/useServices';
import { AccountingSkeleton } from '@/components/skeletons/AccountingSkeleton';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
import { useAuth } from '@/contexts/AuthContext';
import EmployeeCaisseTable from '@/components/accounting/EmployeeCaisseTable';
import { useExpenses } from '@/hooks/useExpenses';

const AccountingPage = () => {
  const { t, i18n } = useTranslation('accounting');
  const { t: tCommon } = useTranslation('common');
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<PaymentFilters>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCommand, setSelectedCommand] = useState<string>('');
  const [newPayment, setNewPayment] = useState({
    amount: '',
    method: 'especes' as PaymentMethod,
    notes: '',
  });

  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString(
      i18n.language === 'ar' ? 'ar-DZ' : 'fr-FR',
      { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }
    );
  };

  // React Query hooks
  const { data: payments, isLoading: paymentsLoading, isError: paymentsError, error, refetch } = usePayments({
    ...filters,
    search: searchQuery || undefined
  });
  const { data: commandsData } = useCommands({});
  const { data: services } = useServices();
  const createPayment = useCreatePayment();
  const { data: expensesData } = useExpenses();

  const commands = commandsData?.data ?? [];
  const allPayments = payments ?? [];
  const allExpenses = expensesData ?? [];

  // Calculate stats
  const totalRevenue = allPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const pendingPayments = commands.reduce(
    (sum, cmd) => sum + calculateRemainingBalance(Number(cmd.sellingPrice || 0), Number(cmd.amountPaid || 0)),
    0
  );
  const totalProfit = commands.reduce(
    (sum, cmd) => sum + calculateNetProfit(Number(cmd.sellingPrice || 0), Number(cmd.buyingPrice || 0)),
    0
  );
  const todayPayments = allPayments.filter(
    (p) => new Date(p.createdAt).toDateString() === new Date().toDateString()
  );
  const todayTotal = todayPayments.reduce((sum, p) => sum + p.amount, 0);

  // Get unpaid commands
  const unpaidCommands = commands.filter(
    (cmd) => calculateRemainingBalance(cmd.sellingPrice, cmd.amountPaid) > 0
  );

  // Monthly data for chart - last 6 months from real data
  const monthlyData = useMemo(() => {
    const now = new Date();
    const months: { mois: string; revenus: number; depenses: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth();
      const label = d.toLocaleDateString(i18n.language === 'ar' ? 'ar-DZ' : 'fr-FR', { month: 'short' });
      const revenus = allPayments
        .filter((p) => { const pd = new Date(p.createdAt); return pd.getFullYear() === year && pd.getMonth() === month; })
        .reduce((sum, p) => sum + Number(p.amount || 0), 0);
      const depenses = allExpenses
        .filter((e) => { const ed = new Date(e.date); return ed.getFullYear() === year && ed.getMonth() === month; })
        .reduce((sum, e) => sum + Number(e.amount || 0), 0);
      months.push({ mois: label, revenus, depenses });
    }
    return months;
  }, [allPayments, allExpenses, i18n.language]);

  const dialogOpenRequestedAtRef = useRef<number>(0);

  const openPaymentDialog = (commandId?: string) => {
    if (commandId) {
      setSelectedCommand(commandId);
    }

    dialogOpenRequestedAtRef.current = Date.now();
    console.log('[AccountingPage] openPaymentDialog requested', {
      commandId: commandId ?? null,
      at: dialogOpenRequestedAtRef.current,
    });

    window.setTimeout(() => {
      console.log('[AccountingPage] setting dialog open=true');
      setIsDialogOpen(true);
    }, 0);
  };

  const handleDialogOpenChange = (open: boolean) => {
    const elapsedSinceOpenRequest = Date.now() - dialogOpenRequestedAtRef.current;

    if (!open && elapsedSinceOpenRequest < 250) {
      console.log('[AccountingPage] ignored immediate dialog close', {
        elapsedSinceOpenRequest,
      });
      return;
    }

    console.log('[AccountingPage] onOpenChange', { open, elapsedSinceOpenRequest });
    setIsDialogOpen(open);
  };

  useEffect(() => {
    console.log('[AccountingPage] dialog state changed', {
      isDialogOpen,
      selectedCommand,
    });
  }, [isDialogOpen, selectedCommand]);

  const handleAddPayment = () => {
    if (!selectedCommand || !newPayment.amount) {
      return;
    }

    createPayment.mutate(
      {
        commandId: selectedCommand,
        amount: Number(newPayment.amount),
        method: newPayment.method,
        notes: newPayment.notes || undefined,
      },
      {
        onSuccess: () => {
          setNewPayment({ amount: '', method: 'especes', notes: '' });
          setSelectedCommand('');
          setIsDialogOpen(false);
        },
      }
    );
  };

  const getCommandLabel = (commandId: string): string => {
    const command = commands.find((c) => c.id === commandId);
    if (!command) return 'N/A';
    const service = services?.find((s) => s.id === command.serviceId);
    return `${service?.name || tCommon('service')} - ${command.data.clientFullName}`;
  };

  if (paymentsLoading) {
    return (
      <DashboardLayout title={t('title')} subtitle={t('subtitle')}>
        <AccountingSkeleton />
      </DashboardLayout>
    );
  }

  if (paymentsError) {
    return (
      <DashboardLayout title={t('title')} subtitle={t('subtitle')}>
        <ErrorState message={error?.message} onRetry={refetch} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={t('title')}
      subtitle={t('subtitle')}
    >
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title={t('stats.totalCollected')}
          value={formatDZD(totalRevenue)}
          icon={DollarSign}
          variant="success"
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title={t('stats.todayPayments')}
          value={formatDZD(todayTotal)}
          description={t('stats.todayPaymentsDesc', { count: todayPayments.length })}
          icon={CreditCard}
          variant="primary"
        />
        <StatsCard
          title={t('stats.unpaid')}
          value={formatDZD(pendingPayments)}
          description={t('stats.unpaidDesc', { count: unpaidCommands.length })}
          icon={Receipt}
          variant="warning"
        />
        <StatsCard
          title={t('stats.totalProfit')}
          value={formatDZD(totalProfit)}
          description={t('stats.totalProfitDesc')}
          icon={TrendingUp}
          variant="info"
        />
      </div>

      <Tabs defaultValue="payments" className="mt-6">
        <TabsList className="bg-muted w-full overflow-x-auto justify-start">
          <TabsTrigger value="payments">{t('tabs.payments')}</TabsTrigger>
          <TabsTrigger value="unpaid">{t('tabs.unpaid')}</TabsTrigger>
          <TabsTrigger value="reports">{t('tabs.reports')}</TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="caisses">{t('tabs.caisses')}</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="payments" className="mt-4">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>{t('payments.title')}</CardTitle>
                  <CardDescription>
                    {t('payments.subtitle')}
                  </CardDescription>
                </div>
                <div className="flex gap-3 items-center">
                  <div className="w-[450px]">
                    <AdvancedFilter
                      searchQuery={searchQuery}
                      onSearchChange={setSearchQuery}
                      filters={filters}
                      onFilterChange={setFilters}
                      filterConfig={[
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
                      ]}
                    />
                  </div>
                  <Button onClick={() => openPaymentDialog()}>
                        <Plus className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
                        {t('actions.newPayment')}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {allPayments.length === 0 ? (
                <EmptyState
                  title={t('payments.empty.title')}
                  description={t('payments.empty.description')}
                  icon={Receipt}
                />
              ) : (
                <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('payments.table.date')}</TableHead>
                      <TableHead>{t('payments.table.command')}</TableHead>
                      <TableHead>{t('payments.table.amount')}</TableHead>
                      <TableHead>{t('payments.table.method')}</TableHead>
                      <TableHead>{t('payments.table.recordedBy')}</TableHead>
                      <TableHead>{t('payments.table.notes')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          {formatDate(payment.createdAt)}
                        </TableCell>
                        <TableCell>
                          {getCommandLabel(payment.commandId)}
                        </TableCell>
                        <TableCell className="font-medium text-green-600">
                          +{formatDZD(payment.amount)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {getPaymentMethodLabel(payment.method)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {payment.recordedBy}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {payment.notes || '-'}
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

        <TabsContent value="unpaid" className="mt-4">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>{t('unpaidCommands.title')}</CardTitle>
              <CardDescription>
                {t('unpaidCommands.subtitle')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {unpaidCommands.length === 0 ? (
                <EmptyState
                  title={t('unpaidCommands.empty.title')}
                  description={t('unpaidCommands.empty.description')}
                  icon={CreditCard}
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('unpaidCommands.table.client')}</TableHead>
                      <TableHead>{t('unpaidCommands.table.service')}</TableHead>
                      <TableHead>{t('unpaidCommands.table.totalAmount')}</TableHead>
                      <TableHead>{t('unpaidCommands.table.paid')}</TableHead>
                      <TableHead>{t('unpaidCommands.table.remaining')}</TableHead>
                      <TableHead>{t('unpaidCommands.table.status')}</TableHead>
                      <TableHead className="text-right">{t('unpaidCommands.table.action')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {unpaidCommands.map((command) => {
                      const service = services?.find((s) => s.id === command.serviceId);
                      const remaining = calculateRemainingBalance(command.sellingPrice, command.amountPaid);
                      const paymentInfo = getPaymentStatusFromAmounts(command.sellingPrice, command.amountPaid);
                      return (
                        <TableRow key={command.id}>
                          <TableCell className="font-medium">
                            {command.data.clientFullName}
                          </TableCell>
                          <TableCell>{service?.name || '-'}</TableCell>
                          <TableCell>{formatDZD(command.sellingPrice)}</TableCell>
                          <TableCell className="text-green-600">
                            {formatDZD(command.amountPaid)}
                          </TableCell>
                        <TableCell className="text-destructive font-medium">
                            {formatDZD(remaining)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={paymentInfo.status === 'paye' ? 'default' : paymentInfo.status === 'partiel' ? 'secondary' : 'destructive'}>
                              {paymentInfo.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              onClick={() => openPaymentDialog(command.id)}
                            >
                              {t('unpaidCommands.addPayment')}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="mt-4">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>{t('reports.chartTitle')}</CardTitle>
              <CardDescription>{t('reports.chartSubtitle')}</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mois" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) => formatDZD(value)}
                    labelStyle={{ color: 'var(--foreground)' }}
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                    }}
                  />
                  <Bar dataKey="revenus" fill="hsl(var(--success))" name={t('reports.revenues')} />
                  <Bar dataKey="depenses" fill="hsl(var(--destructive))" name={t('reports.expenses')} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="caisses" className="mt-4">
            <EmployeeCaisseTable />
          </TabsContent>
        )}
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="bg-card">
          <DialogHeader>
            <DialogTitle>{t('dialog.title')}</DialogTitle>
            <DialogDescription>{t('dialog.subtitle')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t('dialog.form.command')}</Label>
              <Select value={selectedCommand} onValueChange={setSelectedCommand}>
                <SelectTrigger>
                  <SelectValue placeholder={t('dialog.form.selectCommand')} />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {unpaidCommands.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-4 space-y-2">
                      <p className="text-sm text-muted-foreground text-center">
                        {t('dialog.form.noUnpaidCommands')}
                      </p>
                      <Button variant="secondary" size="sm" className="w-full" onClick={() => { setIsDialogOpen(false); navigate('/commandes'); }}>
                        {t('dialog.form.addCommand')}
                      </Button>
                    </div>
                  ) : (
                    unpaidCommands.map((command) => {
                      const remaining = calculateRemainingBalance(command.sellingPrice, command.amountPaid);
                      return (
                        <SelectItem key={command.id} value={command.id}>
                          <div className="flex items-center justify-between gap-4">
                            <span>{getCommandLabel(command.id)}</span>
                            <span className="text-muted-foreground">{t('dialog.form.remaining')}: {formatDZD(remaining)}</span>
                          </div>
                        </SelectItem>
                      );
                    })
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('dialog.form.amount')}</Label>
                <Input type="number" value={newPayment.amount} onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })} placeholder="25000" />
              </div>
              <div className="space-y-2">
                <Label>{t('dialog.form.method')}</Label>
                <Select value={newPayment.method} onValueChange={(value: PaymentMethod) => setNewPayment({ ...newPayment, method: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="especes">{tCommon('paymentMethods.especes')}</SelectItem>
                    <SelectItem value="virement">{tCommon('paymentMethods.virement')}</SelectItem>
                    <SelectItem value="cheque">{tCommon('paymentMethods.cheque')}</SelectItem>
                    <SelectItem value="carte">{tCommon('paymentMethods.carte')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t('dialog.form.notes')}</Label>
              <Input value={newPayment.notes} onChange={(e) => setNewPayment({ ...newPayment, notes: e.target.value })} placeholder={t('dialog.form.notesPlaceholder')} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>{tCommon('actions.cancel')}</Button>
            <Button onClick={handleAddPayment} disabled={createPayment.isPending}>{createPayment.isPending ? t('actions.saving') : tCommon('actions.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AccountingPage;
