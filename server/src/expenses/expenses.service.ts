import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Expense, ExpenseCategory } from './entities/expense.entity';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

export interface ExpenseStats {
  totalThisMonth: number;
  totalThisYear: number;
  totalAll: number;
  byCategory: { category: string; total: number; count: number }[];
}

export interface ExpenseFilters {
  category?: string;
  paymentMethod?: string;
  fromDate?: string;
  toDate?: string;
  search?: string;
}

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
  ) {}

  async findAll(filters?: ExpenseFilters): Promise<Expense[]> {
    const queryBuilder = this.expenseRepository
      .createQueryBuilder('expense')
      .leftJoinAndSelect('expense.recorder', 'recorder')
      .orderBy('expense.date', 'DESC')
      .addOrderBy('expense.createdAt', 'DESC');

    if (filters?.category) {
      queryBuilder.andWhere('expense.category = :category', { category: filters.category });
    }

    if (filters?.paymentMethod) {
      queryBuilder.andWhere('expense.paymentMethod = :paymentMethod', { paymentMethod: filters.paymentMethod });
    }

    if (filters?.fromDate) {
      queryBuilder.andWhere('expense.date >= :fromDate', { fromDate: filters.fromDate });
    }

    if (filters?.toDate) {
      queryBuilder.andWhere('expense.date <= :toDate', { toDate: filters.toDate });
    }

    if (filters?.search) {
      queryBuilder.andWhere(
        '(expense.description ILIKE :search OR expense.vendor ILIKE :search OR expense.note ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    return queryBuilder.getMany();
  }

  async findOne(id: string): Promise<Expense> {
    const expense = await this.expenseRepository.findOne({
      where: { id },
      relations: ['recorder'],
    });

    if (!expense) {
      throw new NotFoundException(`Expense with ID ${id} not found`);
    }

    return expense;
  }

  async getStats(): Promise<ExpenseStats> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Get all expenses
    const allExpenses = await this.expenseRepository.find();

    // Calculate totals
    const totalAll = allExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

    const totalThisMonth = allExpenses
      .filter(e => new Date(e.date) >= startOfMonth)
      .reduce((sum, e) => sum + Number(e.amount), 0);

    const totalThisYear = allExpenses
      .filter(e => new Date(e.date) >= startOfYear)
      .reduce((sum, e) => sum + Number(e.amount), 0);

    // Group by category
    const categoryMap = new Map<string, { total: number; count: number }>();
    
    for (const expense of allExpenses) {
      const existing = categoryMap.get(expense.category) || { total: 0, count: 0 };
      existing.total += Number(expense.amount);
      existing.count += 1;
      categoryMap.set(expense.category, existing);
    }

    const byCategory = Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category,
        total: data.total,
        count: data.count,
      }))
      .sort((a, b) => b.total - a.total);

    return {
      totalThisMonth,
      totalThisYear,
      totalAll,
      byCategory,
    };
  }

  async create(dto: CreateExpenseDto, recordedBy: string): Promise<Expense> {
    const expense = this.expenseRepository.create({
      ...dto,
      recordedBy,
    });
    return this.expenseRepository.save(expense);
  }

  async update(id: string, dto: UpdateExpenseDto): Promise<Expense> {
    const expense = await this.findOne(id);
    Object.assign(expense, dto);
    return this.expenseRepository.save(expense);
  }

  async remove(id: string): Promise<void> {
    const result = await this.expenseRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Expense with ID ${id} not found`);
    }
  }
}
