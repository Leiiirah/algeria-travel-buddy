import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentType } from './entities/payment-type.entity';
import { CreatePaymentTypeDto } from './dto/create-payment-type.dto';
import { UpdatePaymentTypeDto } from './dto/update-payment-type.dto';

@Injectable()
export class PaymentTypesService {
  constructor(
    @InjectRepository(PaymentType)
    private readonly repo: Repository<PaymentType>,
  ) {}

  findAll(): Promise<PaymentType[]> {
    return this.repo.find({ order: { name: 'ASC' } });
  }

  findActive(): Promise<PaymentType[]> {
    return this.repo.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async create(dto: CreatePaymentTypeDto): Promise<PaymentType> {
    const entity = this.repo.create(dto);
    return this.repo.save(entity);
  }

  async update(id: string, dto: UpdatePaymentTypeDto): Promise<PaymentType> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException('Payment type not found');
    Object.assign(entity, dto);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) throw new NotFoundException('Payment type not found');
  }
}
