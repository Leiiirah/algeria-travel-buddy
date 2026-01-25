import { useState, useMemo } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import {
  mockSuppliers,
  mockCommands,
  mockSupplierTransactions,
  formatDZD,
  calculateSupplierBalance,
  getSupplierName,
  getTransactionTypeLabel,
} from '@/lib/mock-data';
import { SupplierTransaction, SupplierTransactionType } from '@/types';

const SupplierAccountingPage = () => {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<SupplierTransaction[]>(mockSupplierTransactions);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
  const [newTransaction, setNewTransaction] = useState({
    supplierId: '',
    type: 'sortie' as SupplierTransactionType,
    amount: '',
    note: '',
    date: format(new Date(), 'yyyy-MM-dd'),
  });

  // Calculate totals for all suppliers
  const globalTotals = useMemo(() => {
    return mockSuppliers.reduce(
      (acc, supplier) => {
        const balance = calculateSupplierBalance(supplier.id, mockCommands, transactions);
        return {
          totalPurchased: acc.totalPurchased + balance.totalPurchased,
          totalPaid: acc.totalPaid + balance.totalPaid,
          totalRemaining: acc.totalRemaining + balance.remainingBalance,
        };
      },
      { totalPurchased: 0, totalPaid: 0, totalRemaining: 0 }
    );
  }, [transactions]);

  // Get supplier balances for the table
  const supplierBalances = useMemo(() => {
    return mockSuppliers
      .map((supplier) => ({
        supplier,
        ...calculateSupplierBalance(supplier.id, mockCommands, transactions),
      }))
      .filter((item) => item.totalPurchased > 0 || item.totalPaid > 0);
  }, [transactions]);

  // Sort transactions by date (newest first)
  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [transactions]);

  const handleOpenDialog = (supplierId?: string) => {
    if (supplierId) {
      setNewTransaction((prev) => ({ ...prev, supplierId }));
    }
    setIsDialogOpen(true);
  };

  const handleAddTransaction = () => {
    if (!newTransaction.supplierId || !newTransaction.amount) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs obligatoires.',
        variant: 'destructive',
      });
      return;
    }

    const amount = parseFloat(newTransaction.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: 'Erreur',
        description: 'Le montant doit être un nombre positif.',
        variant: 'destructive',
      });
      return;
    }

    const transaction: SupplierTransaction = {
      id: Date.now().toString(),
      supplierId: newTransaction.supplierId,
      type: newTransaction.type,
      amount,
      note: newTransaction.note,
      date: new Date(newTransaction.date),
      recordedBy: '1',
      createdAt: new Date(),
    };

    setTransactions([...transactions, transaction]);
    setNewTransaction({
      supplierId: '',
      type: 'sortie',
      amount: '',
      note: '',
      date: format(new Date(), 'yyyy-MM-dd'),
    });
    setIsDialogOpen(false);

    toast({
      title: 'Transaction enregistrée',
      description: `${getTransactionTypeLabel(newTransaction.type)} de ${formatDZD(amount)} pour ${getSupplierName(newTransaction.supplierId)}`,
    });
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
                      {mockSuppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </SelectItem>
                      ))}
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
                <Button onClick={handleAddTransaction}>Enregistrer</Button>
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
                    {supplierBalances.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          Aucune transaction enregistrée
                        </TableCell>
                      </TableRow>
                    ) : (
                      supplierBalances.map((item) => (
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
                      ))
                    )}
                  </TableBody>
                </Table>
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
                    {sortedTransactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          Aucune transaction enregistrée
                        </TableCell>
                      </TableRow>
                    ) : (
                      sortedTransactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            {format(transaction.date, 'dd MMM yyyy', { locale: fr })}
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
                            className={`text-right font-medium ${
                              transaction.type === 'sortie'
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
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default SupplierAccountingPage;
