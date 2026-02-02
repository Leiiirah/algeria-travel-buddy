import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Command } from '../commands/entities/command.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Supplier } from '../suppliers/entities/supplier.entity';
import { SupplierTransaction } from '../supplier-transactions/entities/supplier-transaction.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Command) private commandsRepo: Repository<Command>,
    @InjectRepository(Payment) private paymentsRepo: Repository<Payment>,
    @InjectRepository(Supplier) private suppliersRepo: Repository<Supplier>,
    @InjectRepository(SupplierTransaction) private transactionsRepo: Repository<SupplierTransaction>,
  ) { }

  async getDashboardStats() {
    const commands = await this.commandsRepo.find({
      relations: ['service'],
      order: { createdAt: 'DESC' }
    });

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
}
