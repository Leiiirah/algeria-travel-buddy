import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { formatDZD } from '@/lib/utils';
import { useCreateCaisseSettlement } from '@/hooks/useCaisseHistory';

interface EmployeeData {
  employeeId: string;
  firstName: string;
  lastName: string;
  totalCaisse: number;
  totalImpayes: number;
  totalBenefices: number;
  commandCount: number;
}

interface CaisseSettleDialogProps {
  employee: EmployeeData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CaisseSettleDialog = ({ employee, open, onOpenChange }: CaisseSettleDialogProps) => {
  const { t } = useTranslation('accounting');
  const [newBalance, setNewBalance] = useState(0);
  const [notes, setNotes] = useState('');
  const settleMutation = useCreateCaisseSettlement();

  const handleConfirm = () => {
    if (!employee) return;
    settleMutation.mutate(
      {
        employeeId: employee.employeeId,
        newBalance,
        notes: notes || undefined,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          setNewBalance(0);
          setNotes('');
        },
      },
    );
  };

  const handleOpenChange = (value: boolean) => {
    if (!value) {
      setNewBalance(0);
      setNotes('');
    }
    onOpenChange(value);
  };

  if (!employee) return null;

  const fullName = `${employee.firstName} ${employee.lastName}`;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('caisses.settleDialog.title')}</DialogTitle>
          <DialogDescription>
            {t('caisses.settleDialog.subtitle', { name: fullName })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current stats display */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">{t('caisses.settleDialog.currentCaisse')}</p>
              <p className="text-lg font-bold text-green-600">{formatDZD(employee.totalCaisse)}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">{t('caisses.settleDialog.currentImpayes')}</p>
              <p className="text-lg font-bold text-destructive">{formatDZD(employee.totalImpayes)}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">{t('caisses.settleDialog.currentBenefices')}</p>
              <p className="text-lg font-bold text-blue-600">{formatDZD(employee.totalBenefices)}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">{t('caisses.settleDialog.currentCommands')}</p>
              <p className="text-lg font-bold text-muted-foreground">{employee.commandCount}</p>
            </div>
          </div>

          {/* New balance input */}
          <div className="space-y-2">
            <Label htmlFor="newBalance">{t('caisses.settleDialog.newBalance')} (DZD)</Label>
            <Input
              id="newBalance"
              type="number"
              value={newBalance}
              onChange={(e) => setNewBalance(Number(e.target.value))}
              min={0}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">{t('caisses.settleDialog.notes')}</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('caisses.settleDialog.notesPlaceholder')}
              rows={3}
              maxLength={500}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            {t('cancel', { ns: 'common' })}
          </Button>
          <Button onClick={handleConfirm} disabled={settleMutation.isPending}>
            {settleMutation.isPending
              ? t('caisses.settleDialog.saving')
              : t('caisses.settleDialog.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CaisseSettleDialog;
