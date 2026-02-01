import { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Plus, Wallet, CreditCard, Banknote, Trash2, Eye } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useUsers } from '@/hooks/useUsers';
import {
  useEmployeeTransactions,
  useAllEmployeeBalances,
  useCreateEmployeeTransaction,
  useDeleteEmployeeTransaction,
} from '@/hooks/useEmployeeTransactions';
import { EmployeeTransactionType, employeeTransactionTypeLabels } from '@/types';

export default function EmployeeAccountingPage() {
  const { isAdmin } = useAuth();
  const { data: transactions, isLoading: loadingTransactions, isError: isTransactionsError } = useEmployeeTransactions();
  const { data: balances, isLoading: loadingBalances } = useAllEmployeeBalances();
  const { data: users } = useUsers();
  const createTransaction = useCreateEmployeeTransaction();
  const deleteTransaction = useDeleteEmployeeTransaction();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    employeeId: '',
    type: 'avance' as EmployeeTransactionType,
    amount: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    month: format(new Date(), 'yyyy-MM'),
    note: '',
  });

  const isLoading = loadingTransactions || loadingBalances;

  // Calculate totals
  const totals = {
    avances: transactions?.filter(t => t.type === 'avance').reduce((sum, t) => sum + Number(t.amount), 0) || 0,
    credits: transactions?.filter(t => t.type === 'credit').reduce((sum, t) => sum + Number(t.amount), 0) || 0,
    salaires: transactions?.filter(t => t.type === 'salaire').reduce((sum, t) => sum + Number(t.amount), 0) || 0,
  };

  // Filter employees (exclude admin)
  const employees = users?.filter(u => u.role === 'employee' && u.isActive) || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await createTransaction.mutateAsync({
      employeeId: formData.employeeId,
      type: formData.type,
      amount: parseFloat(formData.amount),
      date: formData.date,
      month: formData.type === 'salaire' ? formData.month : undefined,
      note: formData.note || undefined,
    });

    setIsDialogOpen(false);
    setFormData({
      employeeId: '',
      type: 'avance',
      amount: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      month: format(new Date(), 'yyyy-MM'),
      note: '',
    });
  };

  const handleDelete = async (id: string) => {
    await deleteTransaction.mutateAsync(id);
  };

  const getTypeBadgeVariant = (type: EmployeeTransactionType) => {
    switch (type) {
      case 'avance':
        return 'default';
      case 'credit':
        return 'destructive';
      case 'salaire':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  // Get transactions for selected employee
  const selectedEmployeeTransactions = selectedEmployeeId 
    ? transactions?.filter(t => t.employeeId === selectedEmployeeId) 
    : [];

  const selectedEmployee = selectedEmployeeId 
    ? users?.find(u => u.id === selectedEmployeeId) 
    : null;

  if (isLoading) {
    return (
      <DashboardLayout title="Comptabilité Employés">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-10 w-48" />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Skeleton className="h-10 w-80" />
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-4 flex-1" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Comptabilité Employés" subtitle="Gestion des avances, crédits et salaires">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Comptabilité Employés</h1>
          {isAdmin && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nouvelle Transaction
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ajouter une Transaction</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Employé</Label>
                    <Select
                      value={formData.employeeId}
                      onValueChange={(value) => setFormData({ ...formData, employeeId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un employé" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map((emp) => (
                          <SelectItem key={emp.id} value={emp.id}>
                            {emp.firstName} {emp.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData({ ...formData, type: value as EmployeeTransactionType })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="avance">Avance</SelectItem>
                        <SelectItem value="credit">Crédit</SelectItem>
                        <SelectItem value="salaire">Salaire</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Montant (DZD)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>

                  {formData.type === 'salaire' && (
                    <div className="space-y-2">
                      <Label>Mois concerné</Label>
                      <Input
                        type="month"
                        value={formData.month}
                        onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Note (optionnel)</Label>
                    <Textarea
                      value={formData.note}
                      onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                      placeholder="Ajouter une note..."
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Annuler
                    </Button>
                    <Button type="submit" disabled={createTransaction.isPending}>
                      {createTransaction.isPending ? 'Enregistrement...' : 'Enregistrer'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Avances</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totals.avances.toLocaleString('fr-DZ')} DZD</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Crédits</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{totals.credits.toLocaleString('fr-DZ')} DZD</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Salaires</CardTitle>
              <Banknote className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{totals.salaires.toLocaleString('fr-DZ')} DZD</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="balances">
          <TabsList>
            <TabsTrigger value="balances">Situation Employés</TabsTrigger>
            <TabsTrigger value="history">Historique</TabsTrigger>
          </TabsList>

          <TabsContent value="balances" className="mt-4">
            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employé</TableHead>
                      <TableHead className="text-right">Avances</TableHead>
                      <TableHead className="text-right">Crédits</TableHead>
                      <TableHead className="text-right">Salaires</TableHead>
                      <TableHead className="text-right">Solde</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {balances?.map((balance) => (
                      <TableRow key={balance.employeeId}>
                        <TableCell className="font-medium">
                          {balance.firstName} {balance.lastName}
                        </TableCell>
                        <TableCell className="text-right">
                          {balance.totalAvances.toLocaleString('fr-DZ')} DZD
                        </TableCell>
                        <TableCell className="text-right text-destructive">
                          {balance.totalCredits.toLocaleString('fr-DZ')} DZD
                        </TableCell>
                        <TableCell className="text-right text-primary">
                          {balance.totalSalaires.toLocaleString('fr-DZ')} DZD
                        </TableCell>
                        <TableCell className={`text-right font-bold ${balance.balance >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                          {balance.balance.toLocaleString('fr-DZ')} DZD
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedEmployeeId(balance.employeeId)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!balances || balances.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          Aucune donnée disponible
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Employé</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Montant</TableHead>
                      <TableHead>Note</TableHead>
                      {isAdmin && <TableHead className="w-[50px]"></TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions?.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          {format(new Date(transaction.date), 'dd MMM yyyy', { locale: fr })}
                        </TableCell>
                        <TableCell className="font-medium">
                          {transaction.employee?.firstName} {transaction.employee?.lastName}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getTypeBadgeVariant(transaction.type)}>
                            {employeeTransactionTypeLabels[transaction.type]}
                            {transaction.type === 'salaire' && transaction.month && (
                              <span className="ml-1">({transaction.month})</span>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {Number(transaction.amount).toLocaleString('fr-DZ')} DZD
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate text-muted-foreground">
                          {transaction.note || '-'}
                        </TableCell>
                        {isAdmin && (
                          <TableCell>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Supprimer la transaction ?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Cette action est irréversible. La transaction sera définitivement supprimée.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(transaction.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Supprimer
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                    {(!transactions || transactions.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={isAdmin ? 6 : 5} className="text-center text-muted-foreground py-8">
                          Aucune transaction enregistrée
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Employee Detail Dialog */}
        <Dialog open={!!selectedEmployeeId} onOpenChange={() => setSelectedEmployeeId(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Historique - {selectedEmployee?.firstName} {selectedEmployee?.lastName}
              </DialogTitle>
            </DialogHeader>
            <div className="max-h-[400px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                    <TableHead>Note</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedEmployeeTransactions?.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        {format(new Date(transaction.date), 'dd MMM yyyy', { locale: fr })}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getTypeBadgeVariant(transaction.type)}>
                          {employeeTransactionTypeLabels[transaction.type]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {Number(transaction.amount).toLocaleString('fr-DZ')} DZD
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {transaction.note || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!selectedEmployeeTransactions || selectedEmployeeTransactions.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        Aucune transaction pour cet employé
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
