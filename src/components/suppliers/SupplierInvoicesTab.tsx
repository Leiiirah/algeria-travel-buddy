import { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Plus, FileText, AlertTriangle, Trash2, Edit, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { formatDZD } from '@/lib/utils';
import { Supplier, supplierInvoiceStatusLabels, SupplierInvoiceStatus } from '@/types';
import {
  useSupplierInvoices,
  useSupplierInvoiceStats,
  useCreateSupplierInvoice,
  useUpdateSupplierInvoice,
  useDeleteSupplierInvoice,
} from '@/hooks/useSupplierInvoices';

interface SupplierInvoicesTabProps {
  suppliers: Supplier[];
}

export function SupplierInvoicesTab({ suppliers }: SupplierInvoicesTabProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [paymentInvoice, setPaymentInvoice] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [formData, setFormData] = useState({
    supplierId: '',
    invoiceNumber: '',
    description: '',
    amount: '',
    invoiceDate: format(new Date(), 'yyyy-MM-dd'),
    dueDate: '',
    notes: '',
  });

  const { data: invoices, isLoading } = useSupplierInvoices();
  const { data: stats } = useSupplierInvoiceStats();
  const createInvoice = useCreateSupplierInvoice();
  const updateInvoice = useUpdateSupplierInvoice();
  const deleteInvoice = useDeleteSupplierInvoice();

  const resetForm = () => {
    setFormData({
      supplierId: '',
      invoiceNumber: '',
      description: '',
      amount: '',
      invoiceDate: format(new Date(), 'yyyy-MM-dd'),
      dueDate: '',
      notes: '',
    });
    setEditingId(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (invoice: any) => {
    setFormData({
      supplierId: invoice.supplierId,
      invoiceNumber: invoice.invoiceNumber,
      description: invoice.description,
      amount: invoice.amount.toString(),
      invoiceDate: format(new Date(invoice.invoiceDate), 'yyyy-MM-dd'),
      dueDate: invoice.dueDate ? format(new Date(invoice.dueDate), 'yyyy-MM-dd') : '',
      notes: invoice.notes || '',
    });
    setEditingId(invoice.id);
    setIsDialogOpen(true);
  };

  const handleOpenPayment = (invoice: any) => {
    setPaymentInvoice(invoice);
    setPaymentAmount((Number(invoice.amount) - Number(invoice.paidAmount)).toString());
    setIsPaymentDialogOpen(true);
  };

  const handleSubmit = () => {
    const amount = parseFloat(formData.amount);

    if (!formData.supplierId || !formData.invoiceNumber || !formData.description || isNaN(amount)) {
      return;
    }

    if (editingId) {
      updateInvoice.mutate(
        {
          id: editingId,
          data: {
            invoiceNumber: formData.invoiceNumber,
            description: formData.description,
            amount,
            invoiceDate: formData.invoiceDate,
            dueDate: formData.dueDate || undefined,
            notes: formData.notes || undefined,
          },
        },
        {
          onSuccess: () => {
            setIsDialogOpen(false);
            resetForm();
          },
        }
      );
    } else {
      createInvoice.mutate(
        {
          supplierId: formData.supplierId,
          invoiceNumber: formData.invoiceNumber,
          description: formData.description,
          amount,
          invoiceDate: formData.invoiceDate,
          dueDate: formData.dueDate || undefined,
          notes: formData.notes || undefined,
        },
        {
          onSuccess: () => {
            setIsDialogOpen(false);
            resetForm();
          },
        }
      );
    }
  };

  const handlePayment = () => {
    if (!paymentInvoice || !paymentAmount) return;

    const newPaidAmount = Number(paymentInvoice.paidAmount) + parseFloat(paymentAmount);

    updateInvoice.mutate(
      {
        id: paymentInvoice.id,
        data: { paidAmount: newPaidAmount },
      },
      {
        onSuccess: () => {
          setIsPaymentDialogOpen(false);
          setPaymentInvoice(null);
          setPaymentAmount('');
        },
      }
    );
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteInvoice.mutate(deleteId, {
        onSuccess: () => setDeleteId(null),
      });
    }
  };

  const getStatusBadge = (status: SupplierInvoiceStatus) => {
    const variants: Record<SupplierInvoiceStatus, 'default' | 'secondary' | 'destructive'> = {
      non_paye: 'destructive',
      partiel: 'secondary',
      paye: 'default',
    };
    return <Badge variant={variants[status]}>{supplierInvoiceStatusLabels[status]}</Badge>;
  };

  const isOverdue = (dueDate: Date | string | undefined, status: SupplierInvoiceStatus) => {
    if (!dueDate || status === 'paye') return false;
    return new Date(dueDate) < new Date();
  };

  const getSupplierName = (supplierId: string) => {
    return suppliers.find((s) => s.id === supplierId)?.name ?? 'N/A';
  };

  if (isLoading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Non Payées</CardTitle>
            <FileText className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats?.unpaidCount || 0}</div>
            <p className="text-xs text-muted-foreground">factures</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Retard</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{stats?.overdueCount || 0}</div>
            <p className="text-xs text-muted-foreground">factures</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Dû</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDZD(stats?.totalDue || 0)}</div>
            <p className="text-xs text-muted-foreground">restant à payer</p>
          </CardContent>
        </Card>
      </div>

      {/* Invoices Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Factures Fournisseurs</CardTitle>
          <Button onClick={handleOpenCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle Facture
          </Button>
        </CardHeader>
        <CardContent>
          {!invoices || invoices.length === 0 ? (
            <EmptyState
              title="Aucune facture"
              description="Les factures fournisseurs apparaîtront ici"
              icon={FileText}
            />
          ) : (
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N° Facture</TableHead>
                  <TableHead>Fournisseur</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                  <TableHead>Échéance</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id} className={isOverdue(invoice.dueDate, invoice.status) ? 'bg-destructive/5' : ''}>
                    <TableCell className="font-mono text-sm">{invoice.invoiceNumber}</TableCell>
                    <TableCell>{invoice.supplier?.name || getSupplierName(invoice.supplierId)}</TableCell>
                    <TableCell className="max-w-xs truncate">{invoice.description}</TableCell>
                    <TableCell className="text-right">
                      <div className="font-medium">{formatDZD(invoice.amount)}</div>
                      {Number(invoice.paidAmount) > 0 && (
                        <div className="text-xs text-muted-foreground">
                          Payé: {formatDZD(invoice.paidAmount)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {invoice.dueDate ? (
                        <span className={isOverdue(invoice.dueDate, invoice.status) ? 'text-destructive font-medium' : ''}>
                          {format(new Date(invoice.dueDate), 'dd MMM yyyy', { locale: fr })}
                        </span>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                    <TableCell className="text-right space-x-1">
                      {invoice.status !== 'paye' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenPayment(invoice)}
                        >
                          Payer
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(invoice)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => setDeleteId(invoice.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Modifier la facture' : 'Nouvelle Facture Fournisseur'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Fournisseur *</Label>
              <Select
                value={formData.supplierId}
                onValueChange={(value) => setFormData({ ...formData, supplierId: value })}
                disabled={!!editingId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un fournisseur" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>N° Facture *</Label>
              <Input
                value={formData.invoiceNumber}
                onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                placeholder="Ex: FAC-2026-001"
              />
            </div>
            <div className="grid gap-2">
              <Label>Description *</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Ex: Achat billets janvier"
              />
            </div>
            <div className="grid gap-2">
              <Label>Montant (DZD) *</Label>
              <Input
                type="number"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Date Facture</Label>
                <Input
                  type="date"
                  value={formData.invoiceDate}
                  onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Date Échéance</Label>
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Notes additionnelles..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createInvoice.isPending || updateInvoice.isPending}
            >
              {createInvoice.isPending || updateInvoice.isPending ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Enregistrer un paiement</DialogTitle>
          </DialogHeader>
          {paymentInvoice && (
            <div className="grid gap-4 py-4">
              <div className="rounded-lg bg-muted p-3">
                <p className="text-sm text-muted-foreground">Facture: {paymentInvoice.invoiceNumber}</p>
                <p className="text-sm">
                  Montant total: <strong>{formatDZD(paymentInvoice.amount)}</strong>
                </p>
                <p className="text-sm">
                  Déjà payé: <strong>{formatDZD(paymentInvoice.paidAmount)}</strong>
                </p>
                <p className="text-sm text-primary">
                  Reste à payer: <strong>{formatDZD(Number(paymentInvoice.amount) - Number(paymentInvoice.paidAmount))}</strong>
                </p>
              </div>
              <div className="grid gap-2">
                <Label>Montant du paiement (DZD)</Label>
                <Input
                  type="number"
                  min="0"
                  max={Number(paymentInvoice.amount) - Number(paymentInvoice.paidAmount)}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handlePayment} disabled={updateInvoice.isPending}>
              {updateInvoice.isPending ? 'Enregistrement...' : 'Enregistrer le paiement'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette facture ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. La facture sera définitivement supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
