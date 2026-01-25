import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Plus, ArrowDownCircle, ArrowUpCircle, Wallet, TrendingDown, CreditCard } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { formatDZD, getTransactionTypeLabel } from '@/lib/mock-data';
import { SupplierTransactionType } from '@/types';
import { useSuppliers, useSupplierBalance } from '@/hooks/useSuppliers';
import { useSupplierTransactions, useCreateSupplierTransaction } from '@/hooks/useSupplierTransactions';
import { SupplierAccountingSkeleton } from '@/components/skeletons/SupplierAccountingSkeleton';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';

const SupplierAccountingPage = () => {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    supplierId: '',
    type: 'sortie' as SupplierTransactionType,
    amount: '',
    note: '',
    date: format(new Date(), 'yyyy-MM-dd'),
  });

  // React Query hooks
  const { data: suppliers, isLoading: suppliersLoading, isError: suppliersError, error, refetch } = useSuppliers();
  const { data: transactions, isLoading: transactionsLoading } = useSupplierTransactions();
  const createTransaction = useCreateSupplierTransaction();

  const isLoading = suppliersLoading || transactionsLoading;

  // Calculate totals for all suppliers
  const globalTotals = useMemo(() => {
    if (!suppliers || !transactions) {
      return { totalPurchased: 0, totalPaid: 0, totalRemaining: 0 };
    }

    // Simple calculation based on transactions
    const totalPaid = transactions
      .filter((t) => t.type === 'sortie')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalRefunds = transactions
      .filter((t) => t.type === 'entree')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalPurchased: 0, // This would come from commands data
      totalPaid: totalPaid - totalRefunds,
      totalRemaining: 0,
    };
  }, [suppliers, transactions]);

  // Get supplier balances for the table
  const supplierBalances = useMemo(() => {
    if (!suppliers || !transactions) return [];

    return suppliers.map((supplier) => {
      const supplierTransactions = transactions.filter((t) => t.supplierId === supplier.id);
      const totalPaid = supplierTransactions
        .filter((t) => t.type === 'sortie')
        .reduce((sum, t) => sum + t.amount, 0);
      const totalRefunds = supplierTransactions
        .filter((t) => t.type === 'entree')
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        supplier,
        totalPurchased: 0,
        totalPaid: totalPaid - totalRefunds,
        remainingBalance: 0,
      };
    }).filter((item) => item.totalPaid > 0);
  }, [suppliers, transactions]);

  // Sort transactions by date (newest first)
  const sortedTransactions = useMemo(() => {
    if (!transactions) return [];
    return [...transactions].sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [transactions]);

  const handleOpenDialog = (supplierId?: string) => {
    if (supplierId) {
      setNewTransaction((prev) => ({ ...prev, supplierId }));
    }
    setIsDialogOpen(true);
  };

  const handleAddTransaction = () => {
    if (!newTransaction.supplierId || !newTransaction.amount) {
      return;
    }

    const amount = parseFloat(newTransaction.amount);
    if (isNaN(amount) || amount <= 0) {
      return;
    }

    createTransaction.mutate(
      {
        supplierId: newTransaction.supplierId,
        type: newTransaction.type,
        amount,
        note: newTransaction.note,
        date: newTransaction.date,
      },
      {
        onSuccess: () => {
          setNewTransaction({
            supplierId: '',
            type: 'sortie',
            amount: '',
            note: '',
            date: format(new Date(), 'yyyy-MM-dd'),
          });
          setIsDialogOpen(false);
        },
      }
    );
  };

  const getSupplierName = (supplierId: string) => {
    return suppliers?.find((s) => s.id === supplierId)?.name ?? 'N/A';
  };

  const getBalanceStyle = (remaining: number) => {
    if (remaining > 0) return 'text-destructive font-bold';
    return 'text-success font-semibold';
  };

  const getBalanceDisplay = (remaining: number) => {
    if (remaining < 0) {
      return `Crédit: ${formatDZD(Math.abs(remaining))}`;
    }
    return formatDZD(remaining);
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Situation Fournisseurs" subtitle="Suivi des paiements et soldes fournisseurs">
        <SupplierAccountingSkeleton />
      </DashboardLayout>
    );
  }

  if (suppliersError) {
    return (
      <DashboardLayout title="Situation Fournisseurs" subtitle="Suivi des paiements et soldes fournisseurs">
        <ErrorState message={error?.message} onRetry={refetch} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Situation Fournisseurs" subtitle="Suivi des paiements et soldes fournisseurs">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Situation Fournisseurs</h1>
            <p className="text-muted-foreground">
              Suivi des paiements et soldes fournisseurs
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Nouvelle Transaction Fournisseur</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="supplier">Fournisseur *</Label>
                  <Select
                    value={newTransaction.supplierId}
                    onValueChange={(value) =>
                      setNewTransaction({ ...newTransaction, supplierId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un fournisseur" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers?.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-4 space-y-2">
                          <p className="text-sm text-muted-foreground text-center">
                            Aucun fournisseur disponible
                          </p>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="w-full"
                            onClick={() => {
                              setIsDialogOpen(false);
                              navigate('/fournisseurs');
                            }}
                          >
                            Ajouter un fournisseur
                          </Button>
                        </div>
                      ) : (
                        suppliers?.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">Type de Transaction *</Label>
                  <Select
                    value={newTransaction.type}
                    onValueChange={(value) =>
                      setNewTransaction({
                        ...newTransaction,
                        type: value as SupplierTransactionType,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sortie">
                        <div className="flex items-center gap-2">
                          <ArrowUpCircle className="h-4 w-4 text-destructive" />
                          Paiement envoyé (Sortie)
                        </div>
                      </SelectItem>
                      <SelectItem value="entree">
                        <div className="flex items-center gap-2">
                          <ArrowDownCircle className="h-4 w-4 text-success" />
                          Remboursement reçu (Entrée)
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="amount">Montant (DZD) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="0"
                    value={newTransaction.amount}
                    onChange={(e) =>
                      setNewTransaction({ ...newTransaction, amount: e.target.value })
                    }
                    placeholder="Ex: 50000"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newTransaction.date}
                    onChange={(e) =>
                      setNewTransaction({ ...newTransaction, date: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="note">Note</Label>
                  <Textarea
                    id="note"
                    value={newTransaction.note}
                    onChange={(e) =>
                      setNewTransaction({ ...newTransaction, note: e.target.value })
                    }
                    placeholder="Ex: Versé en espèces, Virement bancaire..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleAddTransaction} disabled={createTransaction.isPending}>
                  {createTransaction.isPending ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Achats</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatDZD(globalTotals.totalPurchased)}</div>
              <p className="text-xs text-muted-foreground">
                Montant total dû aux fournisseurs
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Versé</CardTitle>
              <CreditCard className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {formatDZD(globalTotals.totalPaid)}
              </div>
              <p className="text-xs text-muted-foreground">
                Paiements effectués aux fournisseurs
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reste à Payer</CardTitle>
              <TrendingDown className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${globalTotals.totalRemaining > 0 ? 'text-destructive' : 'text-success'}`}>
                {globalTotals.totalRemaining < 0
                  ? `Crédit: ${formatDZD(Math.abs(globalTotals.totalRemaining))}`
                  : formatDZD(globalTotals.totalRemaining)}
              </div>
              <p className="text-xs text-muted-foreground">
                Solde global fournisseurs
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="situation" className="space-y-4">
          <TabsList>
            <TabsTrigger value="situation">Situation Fournisseurs</TabsTrigger>
            <TabsTrigger value="historique">Historique Transactions</TabsTrigger>
          </TabsList>

          {/* Supplier Situation Tab */}
          <TabsContent value="situation">
            <Card>
              <CardHeader>
                <CardTitle>Solde par Fournisseur</CardTitle>
              </CardHeader>
              <CardContent>
                {supplierBalances.length === 0 ? (
                  <EmptyState
                    title="Aucune transaction"
                    description="Les soldes fournisseurs apparaîtront ici"
                    icon={Wallet}
                  />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fournisseur</TableHead>
                        <TableHead className="text-right">Total Achats</TableHead>
                        <TableHead className="text-right">Total Versé</TableHead>
                        <TableHead className="text-right">Reste à Payer</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {supplierBalances.map((item) => (
                        <TableRow key={item.supplier.id}>
                          <TableCell className="font-medium">{item.supplier.name}</TableCell>
                          <TableCell className="text-right">
                            {formatDZD(item.totalPurchased)}
                          </TableCell>
                          <TableCell className="text-right text-success">
                            {formatDZD(item.totalPaid)}
                          </TableCell>
                          <TableCell className={`text-right ${getBalanceStyle(item.remainingBalance)}`}>
                            {getBalanceDisplay(item.remainingBalance)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenDialog(item.supplier.id)}
                            >
                              Verser
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transaction History Tab */}
          <TabsContent value="historique">
            <Card>
              <CardHeader>
                <CardTitle>Historique des Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                {sortedTransactions.length === 0 ? (
                  <EmptyState
                    title="Aucune transaction"
                    description="Les transactions apparaîtront ici"
                    icon={CreditCard}
                  />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Fournisseur</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Montant</TableHead>
                        <TableHead>Note</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedTransactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            {format(new Date(transaction.date), 'dd MMM yyyy', { locale: fr })}
                          </TableCell>
                          <TableCell className="font-medium">
                            {getSupplierName(transaction.supplierId)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {transaction.type === 'sortie' ? (
                                <ArrowUpCircle className="h-4 w-4 text-destructive" />
                              ) : (
                                <ArrowDownCircle className="h-4 w-4 text-success" />
                              )}
                              <span
                                className={
                                  transaction.type === 'sortie'
                                    ? 'text-destructive'
                                    : 'text-success'
                                }
                              >
                                {getTransactionTypeLabel(transaction.type)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell
                            className={`text-right font-medium ${transaction.type === 'sortie'
                              ? 'text-destructive'
                              : 'text-success'
                              }`}
                          >
                            {transaction.type === 'sortie' ? '-' : '+'}
                            {formatDZD(transaction.amount)}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {transaction.note || '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default SupplierAccountingPage;
