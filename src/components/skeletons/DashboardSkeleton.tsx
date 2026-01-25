import {
  StatsCardSkeleton,
  ChartSkeleton,
  PieChartSkeleton,
  CommandItemSkeleton,
} from '@/components/ui/skeletons';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function DashboardSkeleton() {
  return (
    <>
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <ChartSkeleton />
        <PieChartSkeleton />
      </div>

      {/* Recent Commands */}
      <div className="mt-6">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-56" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <CommandItemSkeleton key={i} />
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
