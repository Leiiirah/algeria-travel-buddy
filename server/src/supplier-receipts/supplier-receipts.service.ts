import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupplierReceipt } from './entities/supplier-receipt.entity';
import { CreateSupplierReceiptDto } from './dto/create-supplier-receipt.dto';
import { SupplierOrdersService } from '../supplier-orders/supplier-orders.service';

@Injectable()
export class SupplierReceiptsService {
  constructor(
    @InjectRepository(SupplierReceipt)
    private readonly receiptRepository: Repository<SupplierReceipt>,
    private readonly ordersService: SupplierOrdersService,
  ) {}

  private generateReceiptNumber(): string {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `REC-${dateStr}-${random}`;
  }

  async findAll(supplierId?: string, orderId?: string): Promise<SupplierReceipt[]> {
    const query = this.receiptRepository.createQueryBuilder('receipt')
      .leftJoinAndSelect('receipt.supplier', 'supplier')
      .leftJoinAndSelect('receipt.order', 'order')
      .orderBy('receipt.createdAt', 'DESC');

    if (supplierId) {
      query.andWhere('receipt.supplierId = :supplierId', { supplierId });
    }
    if (orderId) {
      query.andWhere('receipt.orderId = :orderId', { orderId });
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<SupplierReceipt> {
    const receipt = await this.receiptRepository.findOne({
      where: { id },
      relations: ['supplier', 'order'],
    });
    if (!receipt) {
      throw new NotFoundException(`Supplier receipt with ID ${id} not found`);
    }
    return receipt;
  }

  async create(dto: CreateSupplierReceiptDto, userId: string): Promise<SupplierReceipt> {
    const totalAmount = dto.quantity * dto.unitPrice;
    
    const receipt = this.receiptRepository.create({
      ...dto,
      receiptNumber: this.generateReceiptNumber(),
      totalAmount,
      createdBy: userId,
    });

    const savedReceipt = await this.receiptRepository.save(receipt);

    // If linked to an order, update the order's delivered quantity
    if (dto.orderId) {
      await this.ordersService.updateDeliveredQuantity(dto.orderId, dto.quantity);
    }

    return savedReceipt;
  }

  async remove(id: string): Promise<void> {
    const receipt = await this.findOne(id);
    
    // If linked to an order, reverse the delivered quantity
    if (receipt.orderId) {
      await this.ordersService.updateDeliveredQuantity(receipt.orderId, -receipt.quantity);
    }

    await this.receiptRepository.remove(receipt);
  }

  async getStats(): Promise<{
    totalReceipts: number;
    thisMonthCount: number;
    totalValue: number;
  }> {
    const receipts = await this.receiptRepository.find();
    
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const thisMonthReceipts = receipts.filter(r => new Date(r.receiptDate) >= startOfMonth);
    
    return {
      totalReceipts: receipts.length,
      thisMonthCount: thisMonthReceipts.length,
      totalValue: receipts.reduce((sum, r) => sum + Number(r.totalAmount), 0),
    };
  }
}
