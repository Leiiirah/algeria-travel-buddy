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
import { formatDZD, getCommandStatusLabel, getPaymentStatusFromAmounts } from '@/lib/mock-data';
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
  const { data: stats, isLoading: statsLoading, isError: statsError, error, refetch: refetchStats } = useDashboardStats();
  const { data: commandsData, isLoading: commandsLoading } = useCommands({ limit: 5 });
  const { data: services } = useServices();

  const isLoading = statsLoading || commandsLoading;

  if (isLoading) {
    return (
      <DashboardLayout title="Tableau de bord" subtitle="Vue d'ensemble de votre agence">
        <DashboardSkeleton />
      </DashboardLayout>
    );
  }

  if (statsError) {
    return (
      <DashboardLayout title="Tableau de bord" subtitle="Vue d'ensemble de votre agence">
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
    { name: 'Lun', revenue: 45000 },
    { name: 'Mar', revenue: 62000 },
    { name: 'Mer', revenue: 38000 },
    { name: 'Jeu', revenue: 71000 },
    { name: 'Ven', revenue: 55000 },
    { name: 'Sam', revenue: 89000 },
    { name: 'Dim', revenue: 23000 },
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
    <DashboardLayout title="Tableau de bord" subtitle="Vue d'ensemble de votre agence">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Chiffre d'affaires"
          value={formatDZD(totalRevenue)}
          icon={DollarSign}
          variant="success"
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Commandes du jour"
          value={todayCommands}
          description="Nouvelles commandes aujourd'hui"
          icon={Package}
          variant="primary"
        />
        <StatsCard
          title="En cours"
          value={inProgressCommands}
          description="Commandes en traitement"
          icon={Clock}
          variant="warning"
        />
        <StatsCard
          title="Impayés"
          value={formatDZD(pendingAmount)}
          description="Montant restant à percevoir"
          icon={AlertCircle}
          variant="info"
        />
      </div>

      {/* Charts Row */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Revenus de la semaine</CardTitle>
            <CardDescription>Évolution des revenus sur 7 jours</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip
                  formatter={(value: number) => [formatDZD(value), 'Revenus']}
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
            <CardTitle className="text-lg font-semibold">Répartition par service</CardTitle>
            <CardDescription>Distribution des commandes par type</CardDescription>
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
                  formatter={(value: number) => [`${value}%`, 'Part']}
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
            <CardTitle className="text-lg font-semibold">Commandes récentes</CardTitle>
            <CardDescription>Les 5 dernières commandes enregistrées</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentCommands.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Aucune commande récente</p>
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
                            {service?.name} • {new Date(command.createdAt).toLocaleDateString('fr-FR')}
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
