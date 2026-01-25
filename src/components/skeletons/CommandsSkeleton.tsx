import { StatsCardSkeleton, TableSkeleton } from '@/components/ui/skeletons';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function CommandsSkeleton() {
  return (
    <>
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>

      {/* Table Card */}
      <Card className="border-none shadow-sm">
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <Skeleton className="h-6 w-48" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-40" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <TableSkeleton
            rows={8}
            columns={7}
            headers={[
              'Client',
              'Service',
              'Prix vente',
              'Prix achat',
              'Statut',
              'Paiement',
              'Actions',
            ]}
          />
        </CardContent>
      </Card>
    </>
  );
}
