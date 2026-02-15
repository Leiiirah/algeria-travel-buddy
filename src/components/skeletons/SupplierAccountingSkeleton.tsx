import { StatsCardSkeleton, TableSkeleton } from '@/components/ui/skeletons';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function SupplierAccountingSkeleton() {
  return (
    <>
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 mb-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="balances" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="balances">Situation Fournisseurs</TabsTrigger>
          <TabsTrigger value="transactions">Historique Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="balances" className="mt-4">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-10 w-44" />
              </div>
            </CardHeader>
            <CardContent>
              <TableSkeleton
                rows={5}
                columns={5}
                headers={[
                  'Fournisseur',
                  'Total achats',
                  'Total versé',
                  'Solde restant',
                  'Actions',
                ]}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="mt-4">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <TableSkeleton
                rows={8}
                columns={6}
                headers={[
                  'Date',
                  'Fournisseur',
                  'Type',
                  'Montant',
                  'Note',
                  'Actions',
                ]}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
