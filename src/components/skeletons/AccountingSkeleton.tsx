import {
  StatsCardSkeleton,
  TableSkeleton,
  ChartSkeleton,
} from '@/components/ui/skeletons';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function AccountingSkeleton() {
  return (
    <>
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>

      {/* Tabs */}
      <div className="mt-6">
        <Tabs defaultValue="payments" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="payments">Paiements</TabsTrigger>
            <TabsTrigger value="unpaid">Impayés</TabsTrigger>
            <TabsTrigger value="reports">Rapports</TabsTrigger>
          </TabsList>

          <TabsContent value="payments" className="mt-4">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <Skeleton className="h-6 w-48" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-10 w-40" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <TableSkeleton
                  rows={6}
                  columns={6}
                  headers={[
                    'Date',
                    'Client',
                    'Service',
                    'Montant',
                    'Méthode',
                    'Actions',
                  ]}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="unpaid" className="mt-4">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <TableSkeleton
                  rows={5}
                  columns={5}
                  headers={['Client', 'Service', 'Total', 'Restant', 'Actions']}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="mt-4">
            <div className="grid gap-6 lg:grid-cols-2">
              <ChartSkeleton />
              <ChartSkeleton />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
