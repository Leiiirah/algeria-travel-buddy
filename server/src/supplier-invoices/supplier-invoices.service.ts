import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { SupplierInvoice, InvoiceStatus } from './entities/supplier-invoice.entity';
import { CreateSupplierInvoiceDto } from './dto/create-supplier-invoice.dto';
import { UpdateSupplierInvoiceDto } from './dto/update-supplier-invoice.dto';

@Injectable()
export class SupplierInvoicesService {
  constructor(
    @InjectRepository(SupplierInvoice)
    private readonly invoiceRepository: Repository<SupplierInvoice>,
  ) {}

  private generateInternalRef(): string {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `INV-${dateStr}-${random}`;
  }

  async findAll(supplierId?: string, status?: string): Promise<SupplierInvoice[]> {
    const query = this.invoiceRepository.createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.supplier', 'supplier')
      .orderBy('invoice.createdAt', 'DESC');

    if (supplierId) {
      query.andWhere('invoice.supplierId = :supplierId', { supplierId });
    }
    if (status) {
      query.andWhere('invoice.status = :status', { status });
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<SupplierInvoice> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id },
      relations: ['supplier'],
    });
    if (!invoice) {
      throw new NotFoundException(`Supplier invoice with ID ${id} not found`);
    }
    return invoice;
  }

  async create(dto: CreateSupplierInvoiceDto, userId: string): Promise<SupplierInvoice> {
    const invoice = this.invoiceRepository.create({
      ...dto,
      internalRef: this.generateInternalRef(),
      createdBy: userId,
    });

    return this.invoiceRepository.save(invoice);
  }

  async update(id: string, dto: UpdateSupplierInvoiceDto): Promise<SupplierInvoice> {
    const invoice = await this.findOne(id);

    // Auto-update status based on paid amount
    let status: InvoiceStatus = dto.status ?? invoice.status;
    if (dto.paidAmount !== undefined && dto.status === undefined) {
      const amount = dto.amount ?? Number(invoice.amount);
      if (dto.paidAmount === 0) {
        status = 'non_paye';
      } else if (dto.paidAmount >= amount) {
        status = 'paye';
      } else {
        status = 'partiel';
      }
    }

    Object.assign(invoice, dto, { status });
    return this.invoiceRepository.save(invoice);
  }

  async remove(id: string): Promise<void> {
    const invoice = await this.findOne(id);
    await this.invoiceRepository.remove(invoice);
  }

  async getStats(): Promise<{
    totalInvoices: number;
    unpaidCount: number;
    overdueCount: number;
    totalDue: number;
  }> {
    const invoices = await this.invoiceRepository.find();
    
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    const unpaidInvoices = invoices.filter(i => i.status !== 'paye');
    const overdueInvoices = unpaidInvoices.filter(i => 
      i.dueDate && new Date(i.dueDate) < now
    );
    
    const totalDue = unpaidInvoices.reduce((sum, i) => 
      sum + (Number(i.amount) - Number(i.paidAmount)), 0
    );
    
    return {
      totalInvoices: invoices.length,
      unpaidCount: unpaidInvoices.length,
      overdueCount: overdueInvoices.length,
      totalDue,
    };
  }
}
