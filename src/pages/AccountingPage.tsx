import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Receipt,
  Plus,
  Search,
  Download,
  Calendar,
} from 'lucide-react';
import {
  mockCommands,
  mockPayments,
  mockServices,
  mockUsers,
  formatDZD,
  getPaymentMethodLabel,
} from '@/lib/mock-data';
import { Payment, PaymentMethod, Command } from '@/types';
import { useToast } from '@/hooks/use-toast';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

const AccountingPage = () => {
  const { toast } = useToast();
  const [payments, setPayments] = useState<Payment[]>(mockPayments);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCommand, setSelectedCommand] = useState<string>('');
  const [newPayment, setNewPayment] = useState({
    amount: '',
    method: 'especes' as PaymentMethod,
    notes: '',
  });

  // Calculate stats
  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
  const pendingPayments = mockCommands.reduce(
    (sum, cmd) => sum + (cmd.data.price - cmd.paidAmount),
    0
  );
  const todayPayments = payments.filter(
    (p) => p.createdAt.toDateString() === new Date().toDateString()
  );
  const todayTotal = todayPayments.reduce((sum, p) => sum + p.amount, 0);

  // Get unpaid commands
  const unpaidCommands = mockCommands.filter(
    (cmd) => cmd.paymentStatus !== 'paye'
  );

  // Monthly data for chart
  const monthlyData = [
    { mois: 'Jan', revenus: 850000, depenses: 320000 },
    { mois: 'Fév', revenus: 920000, depenses: 280000 },
    { mois: 'Mar', revenus: 780000, depenses: 350000 },
    { mois: 'Avr', revenus: 1050000, depenses: 290000 },
    { mois: 'Mai', revenus: 890000, depenses: 310000 },
    { mois: 'Juin', revenus: 1150000, depenses: 340000 },
  ];

  const filteredPayments = payments.filter((payment) => {
    const command = mockCommands.find((c) => c.id === payment.commandId);
    const matchesSearch =
      payment.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      command?.data.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleAddPayment = () => {
    if (!selectedCommand || !newPayment.amount) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs obligatoires',
        variant: 'destructive',
      });
      return;
    }

    const payment: Payment = {
      id: String(payments.length + 1),
      commandId: selectedCommand,
      amount: Number(newPayment.amount),
      method: newPayment.method,
      recordedBy: '1',
      createdAt: new Date(),
      notes: newPayment.notes || undefined,
    };

    setPayments([payment, ...payments]);
    setNewPayment({ amount: '', method: 'especes', notes: '' });
    setSelectedCommand('');
    setIsDialogOpen(false);
    toast({
      title: 'Paiement enregistré',
      description: `Paiement de ${formatDZD(payment.amount)} enregistré avec succès`,
    });
  };

  const getCommandLabel = (command: Command): string => {
    const service = mockServices.find((s) => s.id === command.serviceId);
    let clientName = '';
    if (command.data.type === 'visa') {
      clientName = `${command.data.firstName} ${command.data.lastName}`;
    } else if (command.data.type === 'residence') {
      clientName = command.data.hotelName;
    } else if ('clientFullName' in command.data) {
      clientName = command.data.clientFullName;
    }
    return `${service?.name || 'Service'} - ${clientName}`;
  };

  return (
    <DashboardLayout
      title="Comptabilité"
      subtitle="Suivi financier et traçabilité des paiements"
    >
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total encaissé"
          value={formatDZD(totalRevenue)}
          icon={DollarSign}
          variant="success"
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="Encaissements du jour"
          value={formatDZD(todayTotal)}
          description={`${todayPayments.length} paiement(s)`}
          icon={CreditCard}
          variant="primary"
        />
        <StatsCard
          title="Impayés"
          value={formatDZD(pendingPayments)}
          description={`${unpaidCommands.length} commande(s)`}
          icon={Receipt}
          variant="warning"
        />
        <StatsCard
          title="Marge bénéficiaire"
          value="32%"
          description="Ce mois"
          icon={TrendingUp}
          variant="info"
        />
      </div>

      <Tabs defaultValue="payments" className="mt-6">
        <TabsList className="bg-muted">
          <TabsTrigger value="payments">Paiements</TabsTrigger>
          <TabsTrigger value="unpaid">Impayés</TabsTrigger>
          <TabsTrigger value="reports">Rapports</TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="mt-4">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>Historique des paiements</CardTitle>
                  <CardDescription>
                    Tous les paiements enregistrés
                  </CardDescription>
                </div>
                <div className="flex gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-48 pl-9"
                    />
                  </div>
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Enregistrer un paiement
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-card">
                      <DialogHeader>
                        <DialogTitle>Nouveau paiement</DialogTitle>
                        <DialogDescription>
                          Enregistrez un paiement pour une commande
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Commande</Label>
                          <Select
                            value={selectedCommand}
                            onValueChange={setSelectedCommand}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner une commande" />
                            </SelectTrigger>
                            <SelectContent className="bg-popover">
                              {unpaidCommands.map((command) => (
                                <SelectItem key={command.id} value={command.id}>
                                  <div className="flex items-center justify-between gap-4">
                                    <span>{getCommandLabel(command)}</span>
                                    <span className="text-muted-foreground">
                                      Reste: {formatDZD(command.data.price - command.paidAmount)}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Montant (DZD)</Label>
                            <Input
                              type="number"
                              value={newPayment.amount}
                              onChange={(e) =>
                                setNewPayment({ ...newPayment, amount: e.target.value })
                              }
                              placeholder="25000"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Mode de paiement</Label>
                            <Select
                              value={newPayment.method}
                              onValueChange={(value: PaymentMethod) =>
                                setNewPayment({ ...newPayment, method: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-popover">
                                <SelectItem value="especes">Espèces</SelectItem>
                                <SelectItem value="virement">Virement</SelectItem>
                                <SelectItem value="cheque">Chèque</SelectItem>
                                <SelectItem value="carte">Carte bancaire</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Notes (optionnel)</Label>
                          <Input
                            value={newPayment.notes}
                            onChange={(e) =>
                              setNewPayment({ ...newPayment, notes: e.target.value })
                            }
                            placeholder="Notes sur ce paiement..."
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                          Annuler
                        </Button>
                        <Button onClick={handleAddPayment}>Enregistrer</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Commande</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead>Enregistré par</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => {
                    const command = mockCommands.find((c) => c.id === payment.commandId);
                    const user = mockUsers.find((u) => u.id === payment.recordedBy);
                    return (
                      <TableRow key={payment.id}>
                        <TableCell>
                          {payment.createdAt.toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </TableCell>
                        <TableCell>
                          {command ? getCommandLabel(command) : 'N/A'}
                        </TableCell>
                        <TableCell className="font-medium text-success">
                          +{formatDZD(payment.amount)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {getPaymentMethodLabel(payment.method)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user?.firstName} {user?.lastName}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {payment.notes || '-'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="unpaid" className="mt-4">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Commandes impayées</CardTitle>
              <CardDescription>
                Commandes en attente de paiement ou partiellement payées
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Commande</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Montant total</TableHead>
                    <TableHead>Payé</TableHead>
                    <TableHead>Reste à payer</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {unpaidCommands.map((command) => {
                    const service = mockServices.find((s) => s.id === command.serviceId);
                    const remaining = command.data.price - command.paidAmount;
                    return (
                      <TableRow key={command.id}>
                        <TableCell className="font-medium">
                          {command.data.type === 'visa'
                            ? `${command.data.firstName} ${command.data.lastName}`
                            : command.data.type === 'residence'
                            ? command.data.hotelName
                            : 'clientFullName' in command.data
                            ? command.data.clientFullName
                            : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{service?.name}</Badge>
                        </TableCell>
                        <TableCell>{formatDZD(command.data.price)}</TableCell>
                        <TableCell className="text-success">
                          {formatDZD(command.paidAmount)}
                        </TableCell>
                        <TableCell className="font-medium text-destructive">
                          {formatDZD(remaining)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              command.paymentStatus === 'partiel'
                                ? 'secondary'
                                : 'destructive'
                            }
                          >
                            {command.paymentStatus === 'partiel' ? 'Partiel' : 'Non payé'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedCommand(command.id);
                              setNewPayment({
                                amount: String(remaining),
                                method: 'especes',
                                notes: '',
                              });
                              setIsDialogOpen(true);
                            }}
                          >
                            Encaisser
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="mt-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Revenus vs Dépenses</CardTitle>
                    <CardDescription>Comparaison mensuelle</CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Exporter
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="mois" className="text-xs" />
                    <YAxis
                      className="text-xs"
                      tickFormatter={(v) => `${v / 1000}k`}
                    />
                    <Tooltip
                      formatter={(value: number) => formatDZD(value)}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar
                      dataKey="revenus"
                      fill="hsl(var(--success))"
                      radius={[4, 4, 0, 0]}
                      name="Revenus"
                    />
                    <Bar
                      dataKey="depenses"
                      fill="hsl(var(--destructive))"
                      radius={[4, 4, 0, 0]}
                      name="Dépenses"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle>Résumé financier</CardTitle>
                <CardDescription>Période actuelle</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between rounded-lg bg-success/10 p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-8 w-8 text-success" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total des revenus</p>
                      <p className="text-2xl font-bold text-success">
                        {formatDZD(5640000)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg bg-destructive/10 p-4">
                  <div className="flex items-center gap-3">
                    <TrendingDown className="h-8 w-8 text-destructive" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total des dépenses</p>
                      <p className="text-2xl font-bold text-destructive">
                        {formatDZD(1890000)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg bg-primary/10 p-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-8 w-8 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Bénéfice net</p>
                      <p className="text-2xl font-bold text-primary">
                        {formatDZD(3750000)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1">
                    <Download className="mr-2 h-4 w-4" />
                    Rapport PDF
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Calendar className="mr-2 h-4 w-4" />
                    Période
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default AccountingPage;
