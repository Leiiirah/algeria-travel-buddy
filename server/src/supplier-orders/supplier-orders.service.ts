import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupplierOrder } from './entities/supplier-order.entity';
import { CreateSupplierOrderDto } from './dto/create-supplier-order.dto';
import { UpdateSupplierOrderDto } from './dto/update-supplier-order.dto';

@Injectable()
export class SupplierOrdersService {
  constructor(
    @InjectRepository(SupplierOrder)
    private readonly orderRepository: Repository<SupplierOrder>,
  ) {}

  private generateOrderNumber(): string {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `SO-${dateStr}-${random}`;
  }

  async findAll(supplierId?: string): Promise<SupplierOrder[]> {
    const query = this.orderRepository.createQueryBuilder('order')
      .leftJoinAndSelect('order.supplier', 'supplier')
      .orderBy('order.createdAt', 'DESC');

    if (supplierId) {
      query.where('order.supplierId = :supplierId', { supplierId });
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<SupplierOrder> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['supplier'],
    });
    if (!order) {
      throw new NotFoundException(`Supplier order with ID ${id} not found`);
    }
    return order;
  }

  async create(dto: CreateSupplierOrderDto, userId: string): Promise<SupplierOrder> {
    const totalAmount = dto.quantity * dto.unitPrice;
    
    const order = this.orderRepository.create({
      ...dto,
      orderNumber: this.generateOrderNumber(),
      totalAmount,
      createdBy: userId,
    });

    return this.orderRepository.save(order);
  }

  async update(id: string, dto: UpdateSupplierOrderDto): Promise<SupplierOrder> {
    const order = await this.findOne(id);

    // Recalculate totalAmount if quantity or unitPrice changed
    let totalAmount = order.totalAmount;
    const quantity = dto.quantity ?? order.quantity;
    const unitPrice = dto.unitPrice ?? Number(order.unitPrice);
    if (dto.quantity !== undefined || dto.unitPrice !== undefined) {
      totalAmount = quantity * unitPrice;
    }

    // Auto-update status based on delivered quantity
    let status = dto.status ?? order.status;
    const deliveredQuantity = dto.deliveredQuantity ?? order.deliveredQuantity;
    if (dto.deliveredQuantity !== undefined && dto.status === undefined) {
      if (deliveredQuantity === 0) {
        status = 'en_attente';
      } else if (deliveredQuantity >= quantity) {
        status = 'livre';
      } else {
        status = 'partiel';
      }
    }

    Object.assign(order, dto, { totalAmount, status });
    return this.orderRepository.save(order);
  }

  async updateDeliveredQuantity(id: string, additionalQuantity: number): Promise<SupplierOrder> {
    const order = await this.findOne(id);
    const newDeliveredQuantity = order.deliveredQuantity + additionalQuantity;
    
    let status = order.status;
    if (newDeliveredQuantity >= order.quantity) {
      status = 'livre';
    } else if (newDeliveredQuantity > 0) {
      status = 'partiel';
    }

    order.deliveredQuantity = newDeliveredQuantity;
    order.status = status;
    return this.orderRepository.save(order);
  }

  async remove(id: string): Promise<void> {
    const order = await this.findOne(id);
    await this.orderRepository.remove(order);
  }

  async getStats(): Promise<{
    totalOrders: number;
    pendingCount: number;
    deliveredCount: number;
    totalValue: number;
  }> {
    const orders = await this.orderRepository.find();
    
    return {
      totalOrders: orders.length,
      pendingCount: orders.filter(o => o.status === 'en_attente').length,
      deliveredCount: orders.filter(o => o.status === 'livre').length,
      totalValue: orders.reduce((sum, o) => sum + Number(o.totalAmount), 0),
    };
  }
}
