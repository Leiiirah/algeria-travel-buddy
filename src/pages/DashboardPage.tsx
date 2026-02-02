import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Package,
  DollarSign,
  Clock,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { formatDZD, getCommandStatusLabel, getPaymentStatusFromAmounts } from '@/lib/utils';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { useDashboardStats } from '@/hooks/useAnalytics';
import { useCommands } from '@/hooks/useCommands';
import { useServices } from '@/hooks/useServices';
import { DashboardSkeleton } from '@/components/skeletons/DashboardSkeleton';
import { ErrorState } from '@/components/ui/error-state';

const DashboardPage = () => {
  const { t, i18n } = useTranslation('dashboard');
  const { data: stats, isLoading: statsLoading, isError: statsError, error, refetch: refetchStats } = useDashboardStats();
  const { data: commandsData, isLoading: commandsLoading } = useCommands({ limit: 5 });
  const { data: services } = useServices();

  const isLoading = statsLoading || commandsLoading;

  if (isLoading) {
    return (
      <DashboardLayout title={t('title')} subtitle={t('subtitle')}>
        <DashboardSkeleton />
      </DashboardLayout>
    );
  }

  if (statsError) {
    return (
      <DashboardLayout title={t('title')} subtitle={t('subtitle')}>
        <ErrorState message={error?.message} onRetry={refetchStats} />
      </DashboardLayout>
    );
  }

  // Extract stats with defaults
  const totalRevenue = stats?.totalRevenue ?? 0;
  const pendingAmount = stats?.pendingAmount ?? 0;
  const todayCommands = stats?.todayCommands ?? 0;
  const inProgressCommands = stats?.inProgressCommands ?? 0;

  // Chart data
  const pieData = stats?.serviceData ?? [
    { name: 'Visa', value: 45, color: 'hsl(var(--chart-1))' },
    { name: 'Résidence', value: 25, color: 'hsl(var(--chart-2))' },
    { name: 'Billets', value: 20, color: 'hsl(var(--chart-3))' },
    { name: 'Dossiers', value: 10, color: 'hsl(var(--chart-4))' },
  ];

  const weeklyData = stats?.weeklyData ?? [
    { name: t('weekDays.mon'), revenue: 45000 },
    { name: t('weekDays.tue'), revenue: 62000 },
    { name: t('weekDays.wed'), revenue: 38000 },
    { name: t('weekDays.thu'), revenue: 71000 },
    { name: t('weekDays.fri'), revenue: 55000 },
    { name: t('weekDays.sat'), revenue: 89000 },
    { name: t('weekDays.sun'), revenue: 23000 },
  ];

  const recentCommands = commandsData?.data ?? [];

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'termine':
        return 'default';
      case 'en_cours':
        return 'secondary';
      case 'en_attente':
        return 'outline';
      case 'annule':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getPaymentBadgeVariant = (status: string) => {
    switch (status) {
      case 'paye':
        return 'default';
      case 'partiel':
        return 'secondary';
      case 'non_paye':
        return 'destructive';
      default:
        return 'default';
    }
  };

  return (
    <DashboardLayout title={t('title')} subtitle={t('subtitle')}>
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title={t('stats.revenue')}
          value={formatDZD(totalRevenue)}
          icon={DollarSign}
          variant="success"
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title={t('stats.todayCommands')}
          value={todayCommands}
          description={t('stats.todayCommandsDesc')}
          icon={Package}
          variant="primary"
        />
        <StatsCard
          title={t('stats.inProgress')}
          value={inProgressCommands}
          description={t('stats.inProgressDesc')}
          icon={Clock}
          variant="warning"
        />
        <StatsCard
          title={t('stats.unpaid')}
          value={formatDZD(pendingAmount)}
          description={t('stats.unpaidDesc')}
          icon={AlertCircle}
          variant="info"
        />
      </div>

      {/* Charts Row */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">{t('charts.weeklyRevenue')}</CardTitle>
            <CardDescription>{t('charts.weeklyRevenueDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis
                  className="text-xs"
                  tickFormatter={(value) => {
                    if (value === 0) return '0';
                    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                    if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
                    return value.toString();
                  }}
                />
                <Tooltip
                  formatter={(value: number) => [formatDZD(value), t('charts.revenues')]}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Service Distribution */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">{t('charts.serviceDistribution')}</CardTitle>
            <CardDescription>{t('charts.serviceDistributionDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`${value}%`, t('charts.share')]}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 flex flex-wrap justify-center gap-4">
              {pieData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-muted-foreground">
                    {item.name} ({item.value}%)
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Commands */}
      <div className="mt-6">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">{t('recentCommands.title')}</CardTitle>
            <CardDescription>{t('recentCommands.subtitle')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentCommands.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">{t('recentCommands.empty')}</p>
              ) : (
                recentCommands.map((command) => {
                  const service = services?.find((s) => s.id === command.serviceId);
                  const paymentInfo = getPaymentStatusFromAmounts(command.sellingPrice, command.amountPaid);
                  return (
                    <div
                      key={command.id}
                      className="flex items-center justify-between rounded-lg border bg-card p-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{command.data.clientFullName}</p>
                          <p className="text-sm text-muted-foreground">
                            {service?.name} • {new Date(command.createdAt).toLocaleDateString(i18n.language === 'ar' ? 'ar-DZ' : 'fr-FR')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-medium">{formatDZD(command.sellingPrice)}</p>
                          <div className="flex gap-2">
                            <Badge variant={getStatusBadgeVariant(command.status)}>
                              {getCommandStatusLabel(command.status)}
                            </Badge>
                            <Badge variant={getPaymentBadgeVariant(paymentInfo.status)}>
                              {paymentInfo.label}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
