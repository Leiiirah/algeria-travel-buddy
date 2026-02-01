import { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Plus, Package, Clock, CheckCircle, Trash2, Edit } from 'lucide-react';
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
import { Supplier, supplierOrderStatusLabels, SupplierOrderStatus } from '@/types';
import {
  useSupplierOrders,
  useSupplierOrderStats,
  useCreateSupplierOrder,
  useUpdateSupplierOrder,
  useDeleteSupplierOrder,
} from '@/hooks/useSupplierOrders';

interface SupplierOrdersTabProps {
  suppliers: Supplier[];
}

export function SupplierOrdersTab({ suppliers }: SupplierOrdersTabProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    supplierId: '',
    description: '',
    quantity: '',
    unitPrice: '',
    orderDate: format(new Date(), 'yyyy-MM-dd'),
    notes: '',
  });

  const { data: orders, isLoading } = useSupplierOrders();
  const { data: stats } = useSupplierOrderStats();
  const createOrder = useCreateSupplierOrder();
  const updateOrder = useUpdateSupplierOrder();
  const deleteOrder = useDeleteSupplierOrder();

  const resetForm = () => {
    setFormData({
      supplierId: '',
      description: '',
      quantity: '',
      unitPrice: '',
      orderDate: format(new Date(), 'yyyy-MM-dd'),
      notes: '',
    });
    setEditingId(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (order: any) => {
    setFormData({
      supplierId: order.supplierId,
      description: order.description,
      quantity: order.quantity.toString(),
      unitPrice: order.unitPrice.toString(),
      orderDate: format(new Date(order.orderDate), 'yyyy-MM-dd'),
      notes: order.notes || '',
    });
    setEditingId(order.id);
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    const quantity = parseInt(formData.quantity);
    const unitPrice = parseFloat(formData.unitPrice);

    if (!formData.supplierId || !formData.description || isNaN(quantity) || isNaN(unitPrice)) {
      return;
    }

    if (editingId) {
      updateOrder.mutate(
        {
          id: editingId,
          data: {
            description: formData.description,
            quantity,
            unitPrice,
            orderDate: formData.orderDate,
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
      createOrder.mutate(
        {
          supplierId: formData.supplierId,
          description: formData.description,
          quantity,
          unitPrice,
          orderDate: formData.orderDate,
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

  const handleDelete = () => {
    if (deleteId) {
      deleteOrder.mutate(deleteId, {
        onSuccess: () => setDeleteId(null),
      });
    }
  };

  const getStatusBadge = (status: SupplierOrderStatus) => {
    const variants: Record<SupplierOrderStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      en_attente: 'secondary',
      partiel: 'outline',
      livre: 'default',
      annule: 'destructive',
    };
    return <Badge variant={variants[status]}>{supplierOrderStatusLabels[status]}</Badge>;
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
            <CardTitle className="text-sm font-medium">En Attente</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingCount || 0}</div>
            <p className="text-xs text-muted-foreground">commandes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Livrées</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats?.deliveredCount || 0}</div>
            <p className="text-xs text-muted-foreground">commandes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valeur Totale</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDZD(stats?.totalValue || 0)}</div>
            <p className="text-xs text-muted-foreground">{stats?.totalOrders || 0} commandes</p>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Commandes Fournisseurs</CardTitle>
          <Button onClick={handleOpenCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle Commande
          </Button>
        </CardHeader>
        <CardContent>
          {!orders || orders.length === 0 ? (
            <EmptyState
              title="Aucune commande"
              description="Les commandes fournisseurs apparaîtront ici"
              icon={Package}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N° Commande</TableHead>
                  <TableHead>Fournisseur</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-center">Qté</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-sm">{order.orderNumber}</TableCell>
                    <TableCell>{order.supplier?.name || getSupplierName(order.supplierId)}</TableCell>
                    <TableCell className="max-w-xs truncate">{order.description}</TableCell>
                    <TableCell className="text-center">
                      {order.deliveredQuantity}/{order.quantity}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatDZD(order.totalAmount)}
                    </TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(order)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => setDeleteId(order.id)}
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

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Modifier la commande' : 'Nouvelle Commande Fournisseur'}
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
              <Label>Description *</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Ex: 10 billets Istanbul"
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
              <Label>Date de Commande</Label>
              <Input
                type="date"
                value={formData.orderDate}
                onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
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
                <p className="text-sm text-muted-foreground">Total estimé</p>
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
            <Button
              onClick={handleSubmit}
              disabled={createOrder.isPending || updateOrder.isPending}
            >
              {createOrder.isPending || updateOrder.isPending ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette commande ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. La commande sera définitivement supprimée.
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
