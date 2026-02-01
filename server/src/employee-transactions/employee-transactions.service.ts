import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmployeeTransaction, EmployeeTransactionType } from './entities/employee-transaction.entity';
import { CreateEmployeeTransactionDto } from './dto/create-employee-transaction.dto';

export interface EmployeeBalance {
  employeeId: string;
  firstName: string;
  lastName: string;
  totalAvances: number;
  totalCredits: number;
  totalSalaires: number;
  balance: number;
}

@Injectable()
export class EmployeeTransactionsService {
  constructor(
    @InjectRepository(EmployeeTransaction)
    private readonly transactionRepository: Repository<EmployeeTransaction>,
  ) {}

  async findAll(): Promise<EmployeeTransaction[]> {
    return this.transactionRepository.find({
      relations: ['employee', 'recorder'],
      order: { date: 'DESC', createdAt: 'DESC' },
    });
  }

  async findByEmployee(employeeId: string): Promise<EmployeeTransaction[]> {
    return this.transactionRepository.find({
      where: { employeeId },
      relations: ['employee', 'recorder'],
      order: { date: 'DESC', createdAt: 'DESC' },
    });
  }

  async getEmployeeBalance(employeeId: string): Promise<EmployeeBalance> {
    const transactions = await this.transactionRepository.find({
      where: { employeeId },
      relations: ['employee'],
    });

    if (transactions.length === 0) {
      throw new NotFoundException(`No transactions found for employee ${employeeId}`);
    }

    const employee = transactions[0].employee;

    const totalAvances = transactions
      .filter(t => t.type === EmployeeTransactionType.AVANCE)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalCredits = transactions
      .filter(t => t.type === EmployeeTransactionType.CREDIT)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalSalaires = transactions
      .filter(t => t.type === EmployeeTransactionType.SALAIRE)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    // Balance = what the company owes the employee (negative means employee owes company)
    // Salaires paid - (Avances given + Credits/debts)
    const balance = totalSalaires - (totalAvances + totalCredits);

    return {
      employeeId,
      firstName: employee.firstName,
      lastName: employee.lastName,
      totalAvances,
      totalCredits,
      totalSalaires,
      balance,
    };
  }

  async getAllBalances(): Promise<EmployeeBalance[]> {
    const transactions = await this.transactionRepository.find({
      relations: ['employee'],
    });

    const employeeMap = new Map<string, {
      employee: { firstName: string; lastName: string };
      avances: number;
      credits: number;
      salaires: number;
    }>();

    for (const t of transactions) {
      if (!employeeMap.has(t.employeeId)) {
        employeeMap.set(t.employeeId, {
          employee: t.employee,
          avances: 0,
          credits: 0,
          salaires: 0,
        });
      }

      const data = employeeMap.get(t.employeeId)!;
      const amount = Number(t.amount);

      if (t.type === EmployeeTransactionType.AVANCE) {
        data.avances += amount;
      } else if (t.type === EmployeeTransactionType.CREDIT) {
        data.credits += amount;
      } else if (t.type === EmployeeTransactionType.SALAIRE) {
        data.salaires += amount;
      }
    }

    return Array.from(employeeMap.entries()).map(([employeeId, data]) => ({
      employeeId,
      firstName: data.employee.firstName,
      lastName: data.employee.lastName,
      totalAvances: data.avances,
      totalCredits: data.credits,
      totalSalaires: data.salaires,
      balance: data.salaires - (data.avances + data.credits),
    }));
  }

  async create(dto: CreateEmployeeTransactionDto, recordedBy: string): Promise<EmployeeTransaction> {
    const transaction = this.transactionRepository.create({
      ...dto,
      recordedBy,
    });
    return this.transactionRepository.save(transaction);
  }

  async remove(id: string): Promise<void> {
    const result = await this.transactionRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }
  }
}
