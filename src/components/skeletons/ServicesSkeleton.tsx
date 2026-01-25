import { CardGridSkeleton } from '@/components/ui/skeletons';
import { Skeleton } from '@/components/ui/skeleton';

export function ServicesSkeleton() {
  return (
    <>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-10 w-40" />
      </div>

      {/* Services Grid */}
      <CardGridSkeleton count={6} />
    </>
  );
}
