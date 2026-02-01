import { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Plus, Receipt, Calendar, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { Supplier, SupplierOrder } from '@/types';
import {
  useSupplierReceipts,
  useSupplierReceiptStats,
  useCreateSupplierReceipt,
  useDeleteSupplierReceipt,
} from '@/hooks/useSupplierReceipts';
import { useSupplierOrders } from '@/hooks/useSupplierOrders';

interface SupplierReceiptsTabProps {
  suppliers: Supplier[];
}

export function SupplierReceiptsTab({ suppliers }: SupplierReceiptsTabProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    supplierId: '',
    orderId: '',
    description: '',
    quantity: '',
    unitPrice: '',
    receiptDate: format(new Date(), 'yyyy-MM-dd'),
    notes: '',
  });

  const { data: receipts, isLoading } = useSupplierReceipts();
  const { data: stats } = useSupplierReceiptStats();
  const { data: orders } = useSupplierOrders();
  const createReceipt = useCreateSupplierReceipt();
  const deleteReceipt = useDeleteSupplierReceipt();

  // Filter orders that are not fully delivered
  const pendingOrders = orders?.filter(
    (o) => o.status === 'en_attente' || o.status === 'partiel'
  );

  const resetForm = () => {
    setFormData({
      supplierId: '',
      orderId: '',
      description: '',
      quantity: '',
      unitPrice: '',
      receiptDate: format(new Date(), 'yyyy-MM-dd'),
      notes: '',
    });
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleOrderSelect = (orderId: string) => {
    const order = orders?.find((o) => o.id === orderId);
    if (order) {
      const remainingQty = order.quantity - order.deliveredQuantity;
      setFormData({
        ...formData,
        orderId,
        supplierId: order.supplierId,
        description: order.description,
        quantity: remainingQty.toString(),
        unitPrice: order.unitPrice.toString(),
      });
    }
  };

  const handleSubmit = () => {
    const quantity = parseInt(formData.quantity);
    const unitPrice = parseFloat(formData.unitPrice);

    if (!formData.supplierId || !formData.description || isNaN(quantity) || isNaN(unitPrice)) {
      return;
    }

    createReceipt.mutate(
      {
        supplierId: formData.supplierId,
        orderId: formData.orderId || undefined,
        description: formData.description,
        quantity,
        unitPrice,
        receiptDate: formData.receiptDate,
        notes: formData.notes || undefined,
      },
      {
        onSuccess: () => {
          setIsDialogOpen(false);
          resetForm();
        },
      }
    );
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteReceipt.mutate(deleteId, {
        onSuccess: () => setDeleteId(null),
      });
    }
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
            <CardTitle className="text-sm font-medium">Total Reçus</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalReceipts || 0}</div>
            <p className="text-xs text-muted-foreground">reçus enregistrés</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ce Mois</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.thisMonthCount || 0}</div>
            <p className="text-xs text-muted-foreground">reçus</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valeur Totale</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDZD(stats?.totalValue || 0)}</div>
            <p className="text-xs text-muted-foreground">achats reçus</p>
          </CardContent>
        </Card>
      </div>

      {/* Receipts Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Reçus Fournisseurs</CardTitle>
          <Button onClick={handleOpenCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau Reçu
          </Button>
        </CardHeader>
        <CardContent>
          {!receipts || receipts.length === 0 ? (
            <EmptyState
              title="Aucun reçu"
              description="Les reçus fournisseurs apparaîtront ici"
              icon={Receipt}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N° Reçu</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Fournisseur</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-center">Qté</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {receipts.map((receipt) => (
                  <TableRow key={receipt.id}>
                    <TableCell className="font-mono text-sm">{receipt.receiptNumber}</TableCell>
                    <TableCell>
                      {format(new Date(receipt.receiptDate), 'dd MMM yyyy', { locale: fr })}
                    </TableCell>
                    <TableCell>{receipt.supplier?.name || getSupplierName(receipt.supplierId)}</TableCell>
                    <TableCell className="max-w-xs truncate">{receipt.description}</TableCell>
                    <TableCell className="text-center">{receipt.quantity}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatDZD(receipt.totalAmount)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => setDeleteId(receipt.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Nouveau Reçu Fournisseur</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {pendingOrders && pendingOrders.length > 0 && (
              <div className="grid gap-2">
                <Label>Lier à une commande (optionnel)</Label>
                <Select
                  value={formData.orderId}
                  onValueChange={handleOrderSelect}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une commande" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Aucune commande</SelectItem>
                    {pendingOrders.map((order) => (
                      <SelectItem key={order.id} value={order.id}>
                        {order.orderNumber} - {order.description} ({order.quantity - order.deliveredQuantity} restants)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid gap-2">
              <Label>Fournisseur *</Label>
              <Select
                value={formData.supplierId}
                onValueChange={(value) => setFormData({ ...formData, supplierId: value })}
                disabled={!!formData.orderId}
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
              <Label>Description *</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Ex: 5 billets Istanbul reçus"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Quantité *</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Prix Unitaire (DZD) *</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.unitPrice}
                  onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Date de Réception</Label>
              <Input
                type="date"
                value={formData.receiptDate}
                onChange={(e) => setFormData({ ...formData, receiptDate: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Notes additionnelles..."
              />
            </div>
            {formData.quantity && formData.unitPrice && (
              <div className="rounded-lg bg-muted p-3">
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-lg font-bold">
                  {formatDZD(parseInt(formData.quantity || '0') * parseFloat(formData.unitPrice || '0'))}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSubmit} disabled={createReceipt.isPending}>
              {createReceipt.isPending ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce reçu ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le reçu sera définitivement supprimé.
              {formData.orderId && ' La quantité livrée de la commande sera mise à jour.'}
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
