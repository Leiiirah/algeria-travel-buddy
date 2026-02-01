import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Plus, Receipt, Calendar, TrendingDown, Trash2, Pencil } from 'lucide-react';
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
import {
  useExpenses,
  useExpenseStats,
  useCreateExpense,
  useUpdateExpense,
  useDeleteExpense,
} from '@/hooks/useExpenses';
import { ExpenseCategory, PaymentMethod, Expense, expenseCategoryLabels } from '@/types';
import { AdvancedFilter, FilterConfig } from '@/components/search/AdvancedFilter';
import { useDebounce } from '@/hooks/useDebounce';
import { ExpensesSkeleton } from '@/components/skeletons';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const paymentMethodLabels: Record<PaymentMethod, string> = {
  especes: 'Espèces',
  virement: 'Virement',
  cheque: 'Chèque',
  carte: 'Carte',
};

const categoryColors: Record<ExpenseCategory, string> = {
  fournitures: '#3b82f6',
  equipement: '#8b5cf6',
  factures: '#f59e0b',
  transport: '#10b981',
  maintenance: '#6366f1',
  marketing: '#ec4899',
  autre: '#6b7280',
};

export default function ExpensesPage() {
  const { data: expenses, isLoading: loadingExpenses } = useExpenses();
  const { data: stats, isLoading: loadingStats } = useExpenseStats();
  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();
  const deleteExpense = useDeleteExpense();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [formData, setFormData] = useState({
    category: 'fournitures' as ExpenseCategory,
    description: '',
    amount: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    paymentMethod: 'especes' as PaymentMethod,
    vendor: '',
    note: '',
  });

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, any>>({});
  const debouncedSearch = useDebounce(searchQuery, 300);

  const isLoading = loadingExpenses || loadingStats;

  // Filter configuration
  const filterConfig: FilterConfig[] = useMemo(() => [
    {
      key: 'category',
      label: 'Catégorie',
      type: 'select',
      options: Object.entries(expenseCategoryLabels).map(([value, label]) => ({ value, label })),
    },
    {
      key: 'paymentMethod',
      label: 'Mode de paiement',
      type: 'select',
      options: Object.entries(paymentMethodLabels).map(([value, label]) => ({ value, label })),
    },
    {
      key: 'fromDate',
      label: 'Date début',
      type: 'date-range',
    },
    {
      key: 'toDate',
      label: 'Date fin',
      type: 'date-range',
    },
  ], []);

  // Filtered expenses
  const filteredExpenses = useMemo(() => {
    if (!expenses) return [];

    return expenses.filter(expense => {
      // Search filter
      if (debouncedSearch) {
        const searchLower = debouncedSearch.toLowerCase();
        const descMatch = expense.description.toLowerCase().includes(searchLower);
        const vendorMatch = expense.vendor?.toLowerCase().includes(searchLower);
        const noteMatch = expense.note?.toLowerCase().includes(searchLower);
        if (!descMatch && !vendorMatch && !noteMatch) return false;
      }

      // Category filter
      if (filters.category && expense.category !== filters.category) return false;

      // Payment method filter
      if (filters.paymentMethod && expense.paymentMethod !== filters.paymentMethod) return false;

      // Date range filter
      if (filters.fromDate) {
        const fromDate = new Date(filters.fromDate);
        fromDate.setHours(0, 0, 0, 0);
        if (new Date(expense.date) < fromDate) return false;
      }
      if (filters.toDate) {
        const toDate = new Date(filters.toDate);
        toDate.setHours(23, 59, 59, 999);
        if (new Date(expense.date) > toDate) return false;
      }

      return true;
    });
  }, [expenses, debouncedSearch, filters]);

  const resetForm = () => {
    setFormData({
      category: 'fournitures',
      description: '',
      amount: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      paymentMethod: 'especes',
      vendor: '',
      note: '',
    });
    setEditingExpense(null);
  };

  const handleOpenDialog = (expense?: Expense) => {
    if (expense) {
      setEditingExpense(expense);
      setFormData({
        category: expense.category,
        description: expense.description,
        amount: String(expense.amount),
        date: format(new Date(expense.date), 'yyyy-MM-dd'),
        paymentMethod: expense.paymentMethod,
        vendor: expense.vendor || '',
        note: expense.note || '',
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      category: formData.category,
      description: formData.description,
      amount: parseFloat(formData.amount),
      date: formData.date,
      paymentMethod: formData.paymentMethod,
      vendor: formData.vendor || undefined,
      note: formData.note || undefined,
    };

    if (editingExpense) {
      await updateExpense.mutateAsync({ id: editingExpense.id, data });
    } else {
      await createExpense.mutateAsync(data);
    }

    handleCloseDialog();
  };

  const handleDelete = async (id: string) => {
    await deleteExpense.mutateAsync(id);
  };

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!stats?.byCategory) return [];
    return stats.byCategory.map(item => ({
      name: expenseCategoryLabels[item.category as ExpenseCategory] || item.category,
      value: item.total,
      color: categoryColors[item.category as ExpenseCategory] || '#6b7280',
    }));
  }, [stats]);

  if (isLoading) {
    return (
      <DashboardLayout title="Dépenses">
        <ExpensesSkeleton />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Dépenses" subtitle="Gestion des dépenses de l'entreprise">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Dépenses</h1>
          <Dialog open={isDialogOpen} onOpenChange={(open) => open ? handleOpenDialog() : handleCloseDialog()}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle Dépense
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingExpense ? 'Modifier la dépense' : 'Ajouter une dépense'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Catégorie</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value as ExpenseCategory })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(expenseCategoryLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Mode de paiement</Label>
                    <Select
                      value={formData.paymentMethod}
                      onValueChange={(value) => setFormData({ ...formData, paymentMethod: value as PaymentMethod })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(paymentMethodLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Description de la dépense"
                    required
                    maxLength={255}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                </div>

                <div className="space-y-2">
                  <Label>Fournisseur (optionnel)</Label>
                  <Input
                    value={formData.vendor}
                    onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                    placeholder="Nom du fournisseur"
                    maxLength={255}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Note (optionnel)</Label>
                  <Textarea
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    placeholder="Ajouter une note..."
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={handleCloseDialog}>
                    Annuler
                  </Button>
                  <Button type="submit" disabled={createExpense.isPending || updateExpense.isPending}>
                    {createExpense.isPending || updateExpense.isPending ? 'Enregistrement...' : 'Enregistrer'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Ce Mois</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {(stats?.totalThisMonth || 0).toLocaleString('fr-DZ')} DZD
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Cette Année</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {(stats?.totalThisYear || 0).toLocaleString('fr-DZ')} DZD
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Global</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(stats?.totalAll || 0).toLocaleString('fr-DZ')} DZD
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="list">
          <TabsList>
            <TabsTrigger value="list">Liste</TabsTrigger>
            <TabsTrigger value="stats">Statistiques</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <AdvancedFilter
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  filters={filters}
                  onFilterChange={setFilters}
                  filterConfig={filterConfig}
                  placeholder="Rechercher par description, fournisseur..."
                />
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Catégorie</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Fournisseur</TableHead>
                      <TableHead>Mode</TableHead>
                      <TableHead className="text-right">Montant</TableHead>
                      <TableHead className="w-[100px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredExpenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell>
                          {format(new Date(expense.date), 'dd/MM/yyyy', { locale: fr })}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            style={{ borderColor: categoryColors[expense.category], color: categoryColors[expense.category] }}
                          >
                            {expenseCategoryLabels[expense.category]}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium max-w-[200px] truncate">
                          {expense.description}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {expense.vendor || '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {paymentMethodLabels[expense.paymentMethod]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium text-destructive">
                          {Number(expense.amount).toLocaleString('fr-DZ')} DZD
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenDialog(expense)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Supprimer la dépense ?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Cette action est irréversible. La dépense sera définitivement supprimée.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(expense.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Supprimer
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredExpenses.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                          {debouncedSearch || Object.keys(filters).length > 0
                            ? 'Aucune dépense ne correspond aux filtres'
                            : 'Aucune dépense enregistrée'}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Répartition par catégorie</CardTitle>
              </CardHeader>
              <CardContent>
                {chartData.length > 0 ? (
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          outerRadius={150}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => [`${value.toLocaleString('fr-DZ')} DZD`, 'Montant']}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-12">
                    Aucune donnée disponible pour afficher le graphique
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
