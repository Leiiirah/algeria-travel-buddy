import { useState, useEffect } from 'react';
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
  const [newCaisse, setNewCaisse] = useState(0);
  const [newImpayes, setNewImpayes] = useState(0);
  const [newBenefices, setNewBenefices] = useState(0);
  const [notes, setNotes] = useState('');
  const settleMutation = useCreateCaisseSettlement();

  // Pre-fill with current values when dialog opens
  useEffect(() => {
    if (employee && open) {
      setNewCaisse(employee.totalCaisse);
      setNewImpayes(employee.totalImpayes);
      setNewBenefices(employee.totalBenefices);
    }
  }, [employee, open]);

  const handleConfirm = () => {
    if (!employee) return;
    settleMutation.mutate(
      {
        employeeId: employee.employeeId,
        newCaisse,
        newImpayes,
        newBenefices,
        notes: notes || undefined,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          setNotes('');
        },
      },
    );
  };

  const handleOpenChange = (value: boolean) => {
    if (!value) {
      setNewCaisse(0);
      setNewImpayes(0);
      setNewBenefices(0);
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
          {/* Editable fields for caisse, impayes, benefices */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="newCaisse" className="text-green-600">
                {t('caisses.settleDialog.currentCaisse')} (DZD)
              </Label>
              <Input
                id="newCaisse"
                type="number"
                value={newCaisse}
                onChange={(e) => setNewCaisse(Number(e.target.value))}
                min={0}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newImpayes" className="text-destructive">
                {t('caisses.settleDialog.currentImpayes')} (DZD)
              </Label>
              <Input
                id="newImpayes"
                type="number"
                value={newImpayes}
                onChange={(e) => setNewImpayes(Number(e.target.value))}
                min={0}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newBenefices" className="text-blue-600">
                {t('caisses.settleDialog.currentBenefices')} (DZD)
              </Label>
              <Input
                id="newBenefices"
                type="number"
                value={newBenefices}
                onChange={(e) => setNewBenefices(Number(e.target.value))}
                min={0}
              />
            </div>
            {/* Commands count - read only */}
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">{t('caisses.settleDialog.currentCommands')}</p>
              <p className="text-lg font-bold text-muted-foreground">{employee.commandCount}</p>
            </div>
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
