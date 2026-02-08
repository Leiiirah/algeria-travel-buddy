import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { formatDZD } from '@/lib/utils';
import { useCaisseSettlements } from '@/hooks/useCaisseHistory';
import { History } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface CaisseHistoryDialogProps {
  employeeId: string | null;
  employeeName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CaisseHistoryDialog = ({ employeeId, employeeName, open, onOpenChange }: CaisseHistoryDialogProps) => {
  const { t } = useTranslation('accounting');
  const { data: settlements, isLoading } = useCaisseSettlements(open ? employeeId : null);

  // Calculate cumulative totals
  const cumulative = (settlements || []).reduce(
    (acc, s) => ({
      caisse: acc.caisse + Number(s.caisseAmount),
      impayes: acc.impayes + Number(s.impayesAmount),
      benefices: acc.benefices + Number(s.beneficesAmount),
      commands: acc.commands + Number(s.commandCount),
    }),
    { caisse: 0, impayes: 0, benefices: 0, commands: 0 },
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('caisses.historyDialog.title')}</DialogTitle>
          <DialogDescription>
            {t('caisses.historyDialog.subtitle', { name: employeeName })}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-3 py-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : !settlements || settlements.length === 0 ? (
          <div className="py-8">
            <EmptyState
              title={t('caisses.historyDialog.empty.title')}
              description={t('caisses.historyDialog.empty.description')}
              icon={History}
            />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('caisses.historyDialog.table.date')}</TableHead>
                <TableHead className="text-green-600">{t('caisses.historyDialog.table.caisse')}</TableHead>
                <TableHead className="text-destructive">{t('caisses.historyDialog.table.impayes')}</TableHead>
                <TableHead className="text-blue-600">{t('caisses.historyDialog.table.benefices')}</TableHead>
                <TableHead>{t('caisses.historyDialog.table.commands')}</TableHead>
                <TableHead>{t('caisses.historyDialog.table.newBalance')}</TableHead>
                <TableHead>{t('caisses.historyDialog.table.notes')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {settlements.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="whitespace-nowrap">
                    {format(new Date(s.resetDate), 'dd/MM/yyyy HH:mm', { locale: fr })}
                  </TableCell>
                  <TableCell className="font-medium text-green-600">
                    {formatDZD(Number(s.caisseAmount))}
                  </TableCell>
                  <TableCell className="font-medium text-destructive">
                    {formatDZD(Number(s.impayesAmount))}
                  </TableCell>
                  <TableCell className="font-medium text-blue-600">
                    {formatDZD(Number(s.beneficesAmount))}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{s.commandCount}</TableCell>
                  <TableCell className="font-medium">{formatDZD(Number(s.newBalance))}</TableCell>
                  <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                    {s.notes || '—'}
                  </TableCell>
                </TableRow>
              ))}
              {/* Cumulative row */}
              <TableRow className="bg-muted/50 font-semibold border-t-2">
                <TableCell className="font-bold">{t('caisses.historyDialog.cumulative')}</TableCell>
                <TableCell className="font-bold text-green-600">{formatDZD(cumulative.caisse)}</TableCell>
                <TableCell className="font-bold text-destructive">{formatDZD(cumulative.impayes)}</TableCell>
                <TableCell className="font-bold text-blue-600">{formatDZD(cumulative.benefices)}</TableCell>
                <TableCell className="font-bold text-muted-foreground">{cumulative.commands}</TableCell>
                <TableCell colSpan={2} />
              </TableRow>
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CaisseHistoryDialog;
