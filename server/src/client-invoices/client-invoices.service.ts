import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientInvoice, ClientInvoiceType, ClientInvoiceStatus } from './entities/client-invoice.entity';
import { CreateClientInvoiceDto } from './dto/create-client-invoice.dto';
import { UpdateClientInvoiceDto } from './dto/update-client-invoice.dto';
import { Command } from '../commands/entities/command.entity';
import { User } from '../users/entities/user.entity';

export interface ClientInvoiceFilters {
  type?: ClientInvoiceType;
  status?: ClientInvoiceStatus;
  search?: string;
  fromDate?: string;
  toDate?: string;
}

export interface ClientInvoiceStats {
  total: number;
  pending: number;
  paid: number;
  cancelled: number;
  totalAmount: number;
  totalPaid: number;
  totalRemaining: number;
}

@Injectable()
export class ClientInvoicesService {
  constructor(
    @InjectRepository(ClientInvoice)
    private readonly invoiceRepository: Repository<ClientInvoice>,
    @InjectRepository(Command)
    private readonly commandRepository: Repository<Command>,
  ) {}

  private async generateInvoiceNumber(type: ClientInvoiceType): Promise<string> {
    const prefix = type === 'proforma' ? 'PRO' : 'FAC';
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');

    // Find the last invoice of this type for today
    const lastInvoice = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .where('invoice.invoiceNumber LIKE :pattern', {
        pattern: `${prefix}-${dateStr}-%`,
      })
      .orderBy('invoice.invoiceNumber', 'DESC')
      .getOne();

    let sequence = 1;
    if (lastInvoice) {
      const lastSequence = parseInt(
        lastInvoice.invoiceNumber.split('-')[2],
        10,
      );
      sequence = lastSequence + 1;
    }

    return `${prefix}-${dateStr}-${sequence.toString().padStart(3, '0')}`;
  }

  async findAll(user: User, filters?: ClientInvoiceFilters): Promise<ClientInvoice[]> {
    const query = this.invoiceRepository
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.creator', 'creator')
      .leftJoinAndSelect('invoice.command', 'command');

    // Data isolation: employees only see their own invoices
    if (user.role !== 'admin') {
      query.andWhere('invoice.createdBy = :userId', { userId: user.id });
    }

    if (filters?.type) {
      query.andWhere('invoice.type = :type', { type: filters.type });
    }

    if (filters?.status) {
      query.andWhere('invoice.status = :status', { status: filters.status });
    }

    if (filters?.search) {
      query.andWhere(
        '(invoice.clientName ILIKE :search OR invoice.invoiceNumber ILIKE :search OR invoice.serviceName ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    if (filters?.fromDate) {
      query.andWhere('invoice.invoiceDate >= :fromDate', { fromDate: filters.fromDate });
    }

    if (filters?.toDate) {
      query.andWhere('invoice.invoiceDate <= :toDate', { toDate: filters.toDate });
    }

    query.orderBy('invoice.createdAt', 'DESC');

    return query.getMany();
  }

  async findOne(id: string, user: User): Promise<ClientInvoice> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id },
      relations: ['creator', 'command'],
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    // Data isolation check
    if (user.role !== 'admin' && invoice.createdBy !== user.id) {
      throw new ForbiddenException('Access denied');
    }

    return invoice;
  }

  async findByCommand(commandId: string, user: User): Promise<ClientInvoice[]> {
    const query = this.invoiceRepository
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.creator', 'creator')
      .where('invoice.commandId = :commandId', { commandId });

    // Data isolation
    if (user.role !== 'admin') {
      query.andWhere('invoice.createdBy = :userId', { userId: user.id });
    }

    query.orderBy('invoice.createdAt', 'DESC');

    return query.getMany();
  }

  async create(dto: CreateClientInvoiceDto, userId: string): Promise<ClientInvoice> {
    const invoiceNumber = await this.generateInvoiceNumber(dto.type);

    const invoice = this.invoiceRepository.create({
      ...dto,
      invoiceNumber,
      paidAmount: dto.paidAmount || 0,
      invoiceDate: dto.invoiceDate ? new Date(dto.invoiceDate) : new Date(),
      dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      createdBy: userId,
    });

    return this.invoiceRepository.save(invoice);
  }

  async createFromCommand(
    commandId: string,
    type: ClientInvoiceType,
    userId: string,
    user: User,
  ): Promise<ClientInvoice> {
    const command = await this.commandRepository.findOne({
      where: { id: commandId },
      relations: ['service', 'supplier'],
    });

    if (!command) {
      throw new NotFoundException('Command not found');
    }

    // Data isolation: employees can only create invoices from their own commands
    if (user.role !== 'admin' && command.createdBy !== user.id) {
      throw new ForbiddenException('Access denied');
    }

    const invoiceNumber = await this.generateInvoiceNumber(type);

    const invoice = this.invoiceRepository.create({
      invoiceNumber,
      type,
      commandId,
      clientName: command.data.clientFullName || 'N/A',
      clientPhone: command.data.phone || null,
      serviceName: command.service?.name || 'Service',
      serviceType: command.service?.type || null,
      destination: command.destination || null,
      totalAmount: command.sellingPrice,
      paidAmount: command.amountPaid,
      createdBy: userId,
    });

    return this.invoiceRepository.save(invoice);
  }

  async update(
    id: string,
    dto: UpdateClientInvoiceDto,
    user: User,
  ): Promise<ClientInvoice> {
    const invoice = await this.findOne(id, user);

    // Employees can only update their own invoices
    if (user.role !== 'admin' && invoice.createdBy !== user.id) {
      throw new ForbiddenException('Access denied');
    }

    Object.assign(invoice, {
      ...dto,
      invoiceDate: dto.invoiceDate ? new Date(dto.invoiceDate) : invoice.invoiceDate,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : invoice.dueDate,
    });

    return this.invoiceRepository.save(invoice);
  }

  async remove(id: string): Promise<void> {
    const result = await this.invoiceRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Invoice not found');
    }
  }

  async getStats(user: User): Promise<ClientInvoiceStats> {
    const query = this.invoiceRepository.createQueryBuilder('invoice');

    // Data isolation
    if (user.role !== 'admin') {
      query.where('invoice.createdBy = :userId', { userId: user.id });
    }

    const invoices = await query.getMany();

    const stats: ClientInvoiceStats = {
      total: invoices.length,
      pending: invoices.filter((i) => i.status === 'brouillon' || i.status === 'envoyee').length,
      paid: invoices.filter((i) => i.status === 'payee').length,
      cancelled: invoices.filter((i) => i.status === 'annulee').length,
      totalAmount: invoices.reduce((sum, i) => sum + Number(i.totalAmount), 0),
      totalPaid: invoices.reduce((sum, i) => sum + Number(i.paidAmount), 0),
      totalRemaining: invoices.reduce(
        (sum, i) => sum + (Number(i.totalAmount) - Number(i.paidAmount)),
        0,
      ),
    };

    return stats;
  }
}
