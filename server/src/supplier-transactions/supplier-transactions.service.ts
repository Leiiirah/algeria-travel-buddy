import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupplierTransaction } from './entities/supplier-transaction.entity';
import { CreateSupplierTransactionDto } from './dto/create-supplier-transaction.dto';

@Injectable()
export class SupplierTransactionsService {
  constructor(
    @InjectRepository(SupplierTransaction)
    private transactionsRepository: Repository<SupplierTransaction>,
  ) {}

  async findAll(): Promise<SupplierTransaction[]> {
    return this.transactionsRepository.find({
      relations: ['supplier', 'recorder'],
      order: { date: 'DESC', createdAt: 'DESC' },
    });
  }

  async findBySupplier(supplierId: string): Promise<SupplierTransaction[]> {
    return this.transactionsRepository.find({
      where: { supplierId },
      relations: ['recorder'],
      order: { date: 'DESC', createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<SupplierTransaction> {
    const transaction = await this.transactionsRepository.findOne({
      where: { id },
      relations: ['supplier', 'recorder'],
    });
    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }
    return transaction;
  }

  async create(
    createDto: CreateSupplierTransactionDto,
    userId: string,
  ): Promise<SupplierTransaction> {
    const transaction = this.transactionsRepository.create({
      ...createDto,
      date: new Date(createDto.date),
      recordedBy: userId,
    });
    return this.transactionsRepository.save(transaction);
  }

  async remove(id: string): Promise<void> {
    const transaction = await this.findOne(id);
    await this.transactionsRepository.remove(transaction);
  }
}
