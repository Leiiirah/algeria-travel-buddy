import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { formatDZD } from '@/lib/utils';
import { useEmployeeCaisseStats } from '@/hooks/useAnalytics';
import { Users } from 'lucide-react';

const EmployeeCaisseTable = () => {
  const { t } = useTranslation('accounting');
  const { data, isLoading, isError, refetch } = useEmployeeCaisseStats();

  if (isLoading) {
    return (
      <Card className="border-none shadow-sm">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="border-none shadow-sm">
        <CardContent className="pt-6">
          <ErrorState onRetry={refetch} />
        </CardContent>
      </Card>
    );
  }

  const { employees, global } = data || { employees: [], global: { totalCaisse: 0, totalImpayes: 0, totalBenefices: 0, totalCommands: 0 } };

  if (employees.length === 0) {
    return (
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle>{t('caisses.title')}</CardTitle>
          <CardDescription>{t('caisses.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            title={t('caisses.empty.title')}
            description={t('caisses.empty.description')}
            icon={Users}
          />
        </CardContent>
      </Card>
    );
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Generate consistent colors based on employee id
  const getAvatarColor = (id: string) => {
    const colors = [
      'bg-orange-100 text-orange-800',
      'bg-amber-100 text-amber-800',
      'bg-pink-100 text-pink-800',
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-purple-100 text-purple-800',
      'bg-teal-100 text-teal-800',
    ];
    const index = id.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <Card className="border-none shadow-sm">
      <CardHeader>
        <CardTitle>{t('caisses.title')}</CardTitle>
        <CardDescription>{t('caisses.subtitle')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('caisses.table.employee')}</TableHead>
              <TableHead>{t('caisses.table.commands')}</TableHead>
              <TableHead className="text-green-600">{t('caisses.table.caisse')}</TableHead>
              <TableHead className="text-destructive">{t('caisses.table.impayes')}</TableHead>
              <TableHead className="text-blue-600">{t('caisses.table.benefices')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((employee) => (
              <TableRow key={employee.employeeId}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className={getAvatarColor(employee.employeeId)}>
                        {getInitials(employee.firstName, employee.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">
                      {employee.firstName} {employee.lastName}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {employee.commandCount}
                </TableCell>
                <TableCell className="font-medium text-green-600">
                  {formatDZD(employee.totalCaisse)}
                </TableCell>
                <TableCell className="font-medium text-destructive">
                  {formatDZD(employee.totalImpayes)}
                </TableCell>
                <TableCell className="font-medium text-blue-600">
                  {formatDZD(employee.totalBenefices)}
                </TableCell>
              </TableRow>
            ))}
            {/* Global summary row */}
            <TableRow className="bg-muted/50 font-semibold border-t-2">
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Users className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <span className="font-bold">{t('caisses.global.title')}</span>
                    <p className="text-xs text-muted-foreground font-normal">
                      {t('caisses.global.description')}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground font-semibold">
                {global.totalCommands}
              </TableCell>
              <TableCell className="font-bold text-green-600">
                {formatDZD(global.totalCaisse)}
              </TableCell>
              <TableCell className="font-bold text-destructive">
                {formatDZD(global.totalImpayes)}
              </TableCell>
              <TableCell className="font-bold text-blue-600">
                {formatDZD(global.totalBenefices)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default EmployeeCaisseTable;