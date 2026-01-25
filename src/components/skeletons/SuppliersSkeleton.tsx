import { TableSkeleton } from '@/components/ui/skeletons';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function SuppliersSkeleton() {
  return (
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
            'Fournisseur',
            'Contact',
            'Services',
            'Statut',
            'Ajouté le',
            'Actions',
          ]}
        />
      </CardContent>
    </Card>
  );
}
