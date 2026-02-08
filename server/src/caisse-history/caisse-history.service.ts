import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CaisseHistory } from './entities/caisse-history.entity';
import { CreateCaisseSettlementDto } from './dto/create-caisse-settlement.dto';
import { Command } from '../commands/entities/command.entity';
import { OmraOrder } from '../omra/entities/omra-order.entity';
import { OmraVisa } from '../omra/entities/omra-visa.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class CaisseHistoryService {
  constructor(
    @InjectRepository(CaisseHistory) private historyRepo: Repository<CaisseHistory>,
    @InjectRepository(Command) private commandsRepo: Repository<Command>,
    @InjectRepository(OmraOrder) private omraOrdersRepo: Repository<OmraOrder>,
    @InjectRepository(OmraVisa) private omraVisasRepo: Repository<OmraVisa>,
    @InjectRepository(User) private usersRepo: Repository<User>,
  ) {}

  async createSettlement(dto: CreateCaisseSettlementDto, adminId: string): Promise<CaisseHistory> {
    // Verify employee exists
    const employee = await this.usersRepo.findOne({ where: { id: dto.employeeId } });
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    // Get current active stats for this employee
    const lastResetDate = await this.getLastResetDate(dto.employeeId);
    const stats = await this.calculateEmployeeStats(dto.employeeId, lastResetDate);

    const settlement = this.historyRepo.create({
      employeeId: dto.employeeId,
      caisseAmount: stats.totalCaisse,
      impayesAmount: stats.totalImpayes,
      beneficesAmount: stats.totalBenefices,
      commandCount: stats.commandCount,
      newBalance: dto.newBalance || 0,
      adminId,
      notes: dto.notes || null,
      resetDate: new Date(),
    });

    return this.historyRepo.save(settlement);
  }

  async getSettlementsByEmployee(employeeId: string): Promise<CaisseHistory[]> {
    return this.historyRepo.find({
      where: { employeeId },
      relations: ['admin'],
      order: { resetDate: 'DESC' },
    });
  }

  async getLastResetDate(employeeId: string): Promise<Date | null> {
    const lastSettlement = await this.historyRepo.findOne({
      where: { employeeId },
      order: { resetDate: 'DESC' },
    });
    return lastSettlement ? lastSettlement.resetDate : null;
  }

  async getLastSettlement(employeeId: string): Promise<CaisseHistory | null> {
    return this.historyRepo.findOne({
      where: { employeeId },
      order: { resetDate: 'DESC' },
    });
  }

  async getAllLastResetDates(): Promise<Record<string, { resetDate: Date; newBalance: number }>> {
    // Get the latest settlement for each employee using a subquery approach
    const allSettlements = await this.historyRepo.find({
      order: { resetDate: 'DESC' },
    });

    const result: Record<string, { resetDate: Date; newBalance: number }> = {};
    for (const s of allSettlements) {
      if (!result[s.employeeId]) {
        result[s.employeeId] = {
          resetDate: s.resetDate,
          newBalance: Number(s.newBalance),
        };
      }
    }
    return result;
  }

  private async calculateEmployeeStats(employeeId: string, lastResetDate: Date | null) {
    const [commands, omraOrders, omraVisas] = await Promise.all([
      this.commandsRepo.find({ where: { assignedTo: employeeId } }),
      this.omraOrdersRepo.find({ where: { assignedTo: employeeId } }),
      this.omraVisasRepo.find({ where: { assignedTo: employeeId } }),
    ]);

    // Filter by reset date if exists
    const filterByDate = <T extends { createdAt: Date }>(items: T[]): T[] => {
      if (!lastResetDate) return items;
      return items.filter(item => new Date(item.createdAt) > lastResetDate);
    };

    const filteredCommands = filterByDate(commands);
    const filteredOmraOrders = filterByDate(omraOrders);
    const filteredOmraVisas = filterByDate(omraVisas);

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
      totalCaisse: commandCaisse + omraOrderCaisse + omraVisaCaisse,
      totalImpayes: commandImpayes + omraOrderImpayes + omraVisaImpayes,
      totalBenefices: commandBenefices + omraOrderBenefices + omraVisaBenefices,
      commandCount: filteredCommands.length + filteredOmraOrders.length + filteredOmraVisas.length,
    };
  }
}
