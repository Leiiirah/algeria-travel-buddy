import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, FileText, Building2, Banknote, TrendingUp, CreditCard, Calendar } from 'lucide-react';
import { formatDZD } from '@/lib/utils';
import { useOmraStats } from '@/hooks/useOmra';
import { OmraOrdersTab } from '@/components/omra/OmraOrdersTab';
import { OmraVisasTab } from '@/components/omra/OmraVisasTab';
import { OmraHotelsTab } from '@/components/omra/OmraHotelsTab';
import { OmraProgramsTab } from '@/components/omra/OmraProgramsTab';
import { OmraSkeleton } from '@/components/skeletons/OmraSkeleton';
import { ErrorState } from '@/components/ui/error-state';

const OmraPage = () => {
  const { t } = useTranslation('omra');
  const { data: stats, isLoading, isError, error, refetch } = useOmraStats();

  if (isLoading) {
    return (
      <DashboardLayout title={t('title')} subtitle={t('subtitle')}>
        <OmraSkeleton />
      </DashboardLayout>
    );
  }

  if (isError) {
    return (
      <DashboardLayout title={t('title')} subtitle={t('subtitle')}>
        <ErrorState message={error?.message} onRetry={refetch} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={t('title')} subtitle={t('subtitle')}>
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card className="border-none shadow-sm bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('stats.totalPayments')}</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                  {formatDZD(stats?.combined.totalPaid ?? 0)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-200/50 dark:bg-blue-800/50 flex items-center justify-center">
                <Banknote className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('stats.totalCredit')}</p>
                <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">
                  {formatDZD((stats?.combined.totalRevenue ?? 0) - (stats?.combined.totalPaid ?? 0))}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-orange-200/50 dark:bg-orange-800/50 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('stats.netProfit')}</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                  {formatDZD(stats?.combined.totalProfit ?? 0)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-200/50 dark:bg-green-800/50 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="orders" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:w-[550px]">
          <TabsTrigger value="orders" className="gap-2">
            <Package className="h-4 w-4" />
            {t('tabs.orders')}
          </TabsTrigger>
          <TabsTrigger value="visas" className="gap-2">
            <FileText className="h-4 w-4" />
            {t('tabs.visas')}
          </TabsTrigger>
          <TabsTrigger value="hotels" className="gap-2">
            <Building2 className="h-4 w-4" />
            {t('tabs.hotels')}
          </TabsTrigger>
          <TabsTrigger value="programs" className="gap-2">
            <Calendar className="h-4 w-4" />
            {t('tabs.programs')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          <OmraOrdersTab />
        </TabsContent>

        <TabsContent value="visas">
          <OmraVisasTab />
        </TabsContent>

        <TabsContent value="hotels">
          <OmraHotelsTab />
        </TabsContent>

        <TabsContent value="programs">
          <OmraProgramsTab />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default OmraPage;
