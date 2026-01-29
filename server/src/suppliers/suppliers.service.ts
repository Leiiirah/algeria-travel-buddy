import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Supplier } from './entities/supplier.entity';
import { Command } from '../commands/entities/command.entity';
import { SupplierTransaction } from '../supplier-transactions/entities/supplier-transaction.entity';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

export interface SupplierBalance {
  totalBuyingPrice: number;
  totalTransactionsSortie: number;
  totalTransactionsEntree: number;
  balance: number;
}

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(Supplier)
    private suppliersRepository: Repository<Supplier>,
    @InjectRepository(Command)
    private commandsRepository: Repository<Command>,
    @InjectRepository(SupplierTransaction)
    private transactionsRepository: Repository<SupplierTransaction>,
  ) { }

  async findAll(): Promise<Supplier[]> {
    return this.suppliersRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findAllWithBalance(): Promise<(Supplier & SupplierBalance)[]> {
    const suppliers = await this.findAll();
    const suppliersWithBalance = await Promise.all(
      suppliers.map(async (supplier) => {
        const balance = await this.getBalance(supplier.id);
        return { ...supplier, ...balance };
      }),
    );
    return suppliersWithBalance;
  }

  async findOne(id: string): Promise<Supplier> {
    const supplier = await this.suppliersRepository.findOne({ where: { id } });
    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }
    return supplier;
  }

  async getBalance(id: string): Promise<SupplierBalance> {
    await this.findOne(id); // Verify supplier exists

    // Get total buying price from commands
    const commandsResult = await this.commandsRepository
      .createQueryBuilder('command')
      .select('COALESCE(SUM(command.buyingPrice), 0)', 'total')
      .where('command.supplierId = :id', { id })
      .getRawOne();

    // Get total sortie transactions
    const sortieResult = await this.transactionsRepository
      .createQueryBuilder('transaction')
      .select('COALESCE(SUM(transaction.amount), 0)', 'total')
      .where('transaction.supplierId = :id', { id })
      .andWhere('transaction.type = :type', { type: 'sortie' })
      .getRawOne();

    // Get total entree transactions
    const entreeResult = await this.transactionsRepository
      .createQueryBuilder('transaction')
      .select('COALESCE(SUM(transaction.amount), 0)', 'total')
      .where('transaction.supplierId = :id', { id })
      .andWhere('transaction.type = :type', { type: 'entree' })
      .getRawOne();

    const totalBuyingPrice = parseFloat(commandsResult.total) || 0;
    const totalTransactionsSortie = parseFloat(sortieResult.total) || 0;
    const totalTransactionsEntree = parseFloat(entreeResult.total) || 0;

    // Balance = what we owe - what we paid + what we received back
    const balance = totalBuyingPrice - totalTransactionsSortie + totalTransactionsEntree;

    return {
      totalBuyingPrice,
      totalTransactionsSortie,
      totalTransactionsEntree,
      balance,
    };
  }

  async create(createSupplierDto: CreateSupplierDto): Promise<Supplier> {
    const supplier = this.suppliersRepository.create({
      ...createSupplierDto,
      serviceTypes: createSupplierDto.serviceTypes || [],
    });
    return this.suppliersRepository.save(supplier);
  }

  async update(id: string, updateSupplierDto: UpdateSupplierDto): Promise<Supplier> {
    const supplier = await this.findOne(id);
    Object.assign(supplier, updateSupplierDto);
    return this.suppliersRepository.save(supplier);
  }

  async remove(id: string): Promise<void> {
    const supplier = await this.findOne(id);
    await this.suppliersRepository.remove(supplier);
  }
}
