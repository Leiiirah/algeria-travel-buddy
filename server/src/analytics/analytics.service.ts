import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Command } from '../commands/entities/command.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Supplier } from '../suppliers/entities/supplier.entity';
import { SupplierTransaction } from '../supplier-transactions/entities/supplier-transaction.entity';
import { OmraOrder } from '../omra/entities/omra-order.entity';
import { OmraVisa } from '../omra/entities/omra-visa.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Command) private commandsRepo: Repository<Command>,
    @InjectRepository(Payment) private paymentsRepo: Repository<Payment>,
    @InjectRepository(Supplier) private suppliersRepo: Repository<Supplier>,
    @InjectRepository(SupplierTransaction) private transactionsRepo: Repository<SupplierTransaction>,
    @InjectRepository(OmraOrder) private omraOrdersRepo: Repository<OmraOrder>,
    @InjectRepository(OmraVisa) private omraVisasRepo: Repository<OmraVisa>,
    @InjectRepository(User) private usersRepo: Repository<User>,
  ) { }

  async getDashboardStats(userId?: string, isAdmin?: boolean) {
    // Build query based on role
    let queryBuilder = this.commandsRepo.createQueryBuilder('command')
      .leftJoinAndSelect('command.service', 'service')
      .orderBy('command.createdAt', 'DESC');
    
    // Filter by user for non-admin
    if (!isAdmin && userId) {
      queryBuilder = queryBuilder.where('command.createdBy = :userId', { userId });
    }
    
    const commands = await queryBuilder.getMany();

    const totalRevenue = commands.reduce((sum, c) => sum + Number(c.sellingPrice || 0), 0);
    const totalProfit = commands.reduce((sum, c) => sum + (Number(c.sellingPrice || 0) - Number(c.buyingPrice || 0)), 0);
    const pendingAmount = commands
      .reduce((sum, c) => {
        const selling = Number(c.sellingPrice || 0);
        const paid = Number(c.amountPaid || 0);
        return sum + Math.max(0, selling - paid);
      }, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayCommands = commands.filter(c => {
      const d = new Date(c.createdAt);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === today.getTime();
    }).length;

    const inProgressCommands = commands.filter(c => c.status === 'en_traitement').length;

    // Weekly Revenue Data
    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const dayName = d.toLocaleDateString('fr-FR', { weekday: 'short' });
      const formattedName = dayName.charAt(0).toUpperCase() + dayName.slice(1);
      const dayRevenue = commands
        .filter(c => {
          const cd = new Date(c.createdAt);
          cd.setHours(0, 0, 0, 0);
          return cd.getTime() === d.getTime();
        })
        .reduce((sum, c) => sum + Number(c.sellingPrice || 0), 0);
      weeklyData.push({ name: formattedName, revenue: dayRevenue });
    }

    // Service Distribution Data
    const serviceCounts: Record<string, number> = {};
    let totalServiceCommands = 0;
    commands.forEach(c => {
      if (c.service?.type) {
        serviceCounts[c.service.type] = (serviceCounts[c.service.type] || 0) + 1;
        totalServiceCommands++;
      }
    });

    const serviceColors: Record<string, string> = {
      visa: 'hsl(var(--chart-1))',
      residence: 'hsl(var(--chart-2))',
      ticket: 'hsl(var(--chart-3))',
      dossier: 'hsl(var(--chart-4))',
      unknown: 'hsl(var(--chart-5))'
    };
    const serviceNames: Record<string, string> = {
      visa: 'Visa',
      residence: 'Résidence',
      ticket: 'Billets',
      dossier: 'Dossiers',
      unknown: 'Autre'
    };
    const serviceData = Object.entries(serviceCounts).map(([type, count]) => ({
      name: serviceNames[type] || type,
      value: totalServiceCommands > 0 ? Math.round((count / totalServiceCommands) * 100) : 0,
      color: serviceColors[type] || serviceColors.unknown
    }));
    serviceData.sort((a, b) => b.value - a.value);

    return {
      totalCommands: commands.length,
      totalRevenue,
      totalProfit,
      pendingAmount,
      todayCommands,
      inProgressCommands,
      commandsByStatus: {
        en_attente: commands.filter(c => c.status === 'dossier_incomplet').length,
        en_cours: inProgressCommands,
        termine: commands.filter(c => c.status === 'retire').length,
        annule: commands.filter(c => c.status === 'refuse').length
      },
      weeklyData,
      serviceData
    };
  }

  async getRevenueStats(fromDate: string, toDate: string) {
    const commands = await this.commandsRepo.find({ where: { createdAt: Between(new Date(fromDate), new Date(toDate)) } });
    const grouped: Record<string, number> = {};
    commands.forEach(c => { const d = c.createdAt.toISOString().split('T')[0]; grouped[d] = (grouped[d] || 0) + Number(c.sellingPrice || 0); });
    return Object.entries(grouped).map(([date, revenue]) => ({ date, revenue })).sort((a, b) => a.date.localeCompare(b.date));
  }

  async getSupplierStats() {
    const suppliers = await this.suppliersRepo.find();
    return Promise.all(suppliers.map(async s => {
      const cmds = await this.commandsRepo.find({ where: { supplierId: s.id } });
      const txs = await this.transactionsRepo.find({ where: { supplierId: s.id } });
      const totalBuying = cmds.reduce((sum, c) => sum + Number(c.buyingPrice || 0), 0);
      const totalSortie = txs.filter(t => t.type === 'sortie').reduce((sum, t) => sum + Number(t.amount), 0);
      return { supplierId: s.id, name: s.name, balance: { totalBuyingPrice: totalBuying, totalTransactionsSortie: totalSortie, balance: totalBuying - totalSortie } };
    }));
  }

  async getServiceStats() {
    const commands = await this.commandsRepo.find({ relations: ['service'] });
    const stats: Record<string, { count: number; revenue: number }> = {};
    commands.forEach(c => { const type = c.service?.type || 'unknown'; if (!stats[type]) stats[type] = { count: 0, revenue: 0 }; stats[type].count++; stats[type].revenue += Number(c.sellingPrice || 0); });
    return Object.entries(stats).map(([serviceType, data]) => ({ serviceType, ...data }));
  }

  async getEmployeeCommandStats(userId: string) {
    const commands = await this.commandsRepo.find({
      where: { createdBy: userId },
      relations: ['service'],
    });

    const totalRevenue = commands.reduce(
      (sum, c) => sum + Number(c.sellingPrice || 0), 0
    );
    const totalProfit = commands.reduce(
      (sum, c) => sum + (Number(c.sellingPrice || 0) - Number(c.buyingPrice || 0)), 0
    );
    const pendingAmount = commands.reduce(
      (sum, c) => sum + Math.max(0, Number(c.sellingPrice || 0) - Number(c.amountPaid || 0)), 0
    );

    return {
      totalCommands: commands.length,
      totalRevenue,
      totalProfit,
      pendingAmount,
      byStatus: {
        en_attente: commands.filter(c => c.status === 'dossier_incomplet').length,
        en_cours: commands.filter(c => c.status === 'en_traitement').length,
        termine: commands.filter(c => c.status === 'retire').length,
      },
    };
  }

  async getEmployeeCaisseStats(lastResetDates?: Record<string, { resetDate: Date; newCaisse: number; newImpayes: number; newBenefices: number }>) {
    // Fetch all active employees
    const employees = await this.usersRepo.find({ where: { isActive: true } });
    
    // Fetch all data sources with assignedTo
    const [commands, omraOrders, omraVisas] = await Promise.all([
      this.commandsRepo.find(),
      this.omraOrdersRepo.find(),
      this.omraVisasRepo.find(),
    ]);

    // Calculate stats per employee
    const employeeStats = employees.map(employee => {
      // Filter items assigned to this employee
      const assignedCommands = commands.filter(c => c.assignedTo === employee.id);
      const assignedOmraOrders = omraOrders.filter(o => o.assignedTo === employee.id);
      const assignedOmraVisas = omraVisas.filter(v => v.assignedTo === employee.id);

      // Get last reset date for this employee
      const resetInfo = lastResetDates?.[employee.id];
      const resetDate = resetInfo ? new Date(resetInfo.resetDate) : null;

      // Filter by reset date if exists
      const filterByDate = <T extends { createdAt: Date }>(items: T[]): T[] => {
        if (!resetDate) return items;
        return items.filter(item => new Date(item.createdAt) > resetDate);
      };

      const filteredCommands = filterByDate(assignedCommands);
      const filteredOmraOrders = filterByDate(assignedOmraOrders);
      const filteredOmraVisas = filterByDate(assignedOmraVisas);

      // Calculate totals from filtered sources
      const commandCaisse = filteredCommands.reduce((sum, c) => sum + Number(c.amountPaid || 0), 0);
      const omraOrderCaisse = filteredOmraOrders.reduce((sum, o) => sum + Number(o.amountPaid || 0), 0);
      const omraVisaCaisse = filteredOmraVisas.reduce((sum, v) => sum + Number(v.amountPaid || 0), 0);

      const commandImpayes = filteredCommands.reduce((sum, c) => 
        sum + Math.max(0, Number(c.sellingPrice || 0) - Number(c.amountPaid || 0)), 0);
      const omraOrderImpayes = filteredOmraOrders.reduce((sum, o) => 
        sum + Math.max(0, Number(o.sellingPrice || 0) - Number(o.amountPaid || 0)), 0);
      const omraVisaImpayes = filteredOmraVisas.reduce((sum, v) => 
        sum + Math.max(0, Number(v.sellingPrice || 0) - Number(v.amountPaid || 0)), 0);

      const commandBenefices = filteredCommands.reduce((sum, c) => 
        sum + (Number(c.sellingPrice || 0) - Number(c.buyingPrice || 0)), 0);
      const omraOrderBenefices = filteredOmraOrders.reduce((sum, o) => 
        sum + (Number(o.sellingPrice || 0) - Number(o.buyingPrice || 0)), 0);
      const omraVisaBenefices = filteredOmraVisas.reduce((sum, v) => 
        sum + (Number(v.sellingPrice || 0) - Number(v.buyingPrice || 0)), 0);

      return {
        employeeId: employee.id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        totalCaisse: commandCaisse + omraOrderCaisse + omraVisaCaisse,
        totalImpayes: commandImpayes + omraOrderImpayes + omraVisaImpayes,
        totalBenefices: commandBenefices + omraOrderBenefices + omraVisaBenefices,
        commandCount: filteredCommands.length + filteredOmraOrders.length + filteredOmraVisas.length,
      };
    });

    // Filter out employees with no assigned items AND no settlement history
    const activeEmployeeStats = employeeStats.filter(e => 
      e.commandCount > 0 || (lastResetDates && lastResetDates[e.employeeId])
    );

    // Calculate global totals
    const global = {
      totalCaisse: activeEmployeeStats.reduce((sum, e) => sum + e.totalCaisse, 0),
      totalImpayes: activeEmployeeStats.reduce((sum, e) => sum + e.totalImpayes, 0),
      totalBenefices: activeEmployeeStats.reduce((sum, e) => sum + e.totalBenefices, 0),
      totalCommands: activeEmployeeStats.reduce((sum, e) => sum + e.commandCount, 0),
    };

    return {
      employees: activeEmployeeStats,
      global,
    };
  }
}
