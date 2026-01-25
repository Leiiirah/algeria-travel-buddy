import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CommandsService } from '../commands/commands.service';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
    @Inject(forwardRef(() => CommandsService))
    private commandsService: CommandsService,
  ) {}

  async findAll(search?: string): Promise<Payment[]> {
    const queryBuilder = this.paymentsRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.command', 'command')
      .leftJoinAndSelect('payment.recorder', 'recorder');

    if (search) {
      queryBuilder.where('payment.notes ILIKE :search', { search: `%${search}%` });
    }

    return queryBuilder.orderBy('payment.createdAt', 'DESC').getMany();
  }

  async findByCommand(commandId: string): Promise<Payment[]> {
    return this.paymentsRepository.find({
      where: { commandId },
      relations: ['recorder'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Payment> {
    const payment = await this.paymentsRepository.findOne({
      where: { id },
      relations: ['command', 'recorder'],
    });
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }
    return payment;
  }

  async create(createPaymentDto: CreatePaymentDto, userId: string): Promise<Payment> {
    // Verify command exists
    const command = await this.commandsService.findOne(createPaymentDto.commandId);

    // Create payment
    const payment = this.paymentsRepository.create({
      ...createPaymentDto,
      recordedBy: userId,
    });

    const savedPayment = await this.paymentsRepository.save(payment);

    // Update command's amountPaid
    const payments = await this.findByCommand(command.id);
    const totalPaid = payments.reduce(
      (sum, p) => sum + Number(p.amount),
      0,
    );
    await this.commandsService.updateAmountPaid(command.id, totalPaid);

    return savedPayment;
  }

  async remove(id: string): Promise<void> {
    const payment = await this.findOne(id);
    const commandId = payment.commandId;

    await this.paymentsRepository.remove(payment);

    // Update command's amountPaid
    const payments = await this.findByCommand(commandId);
    const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    await this.commandsService.updateAmountPaid(commandId, totalPaid);
  }
}
