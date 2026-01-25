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
  ) {}

  async getDashboardStats() {
    const commands = await this.commandsRepo.find();
    const totalRevenue = commands.reduce((sum, c) => sum + Number(c.sellingPrice || 0), 0);
    const totalProfit = commands.reduce((sum, c) => sum + (Number(c.sellingPrice || 0) - Number(c.buyingPrice || 0)), 0);
    return { totalCommands: commands.length, totalRevenue, totalProfit, commandsByStatus: { en_attente: commands.filter(c => c.status === 'en_attente').length, en_cours: commands.filter(c => c.status === 'en_cours').length, termine: commands.filter(c => c.status === 'termine').length, annule: commands.filter(c => c.status === 'annule').length } };
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
