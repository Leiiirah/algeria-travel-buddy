import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { Command } from '../commands/entities/command.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Supplier } from '../suppliers/entities/supplier.entity';
import { SupplierTransaction } from '../supplier-transactions/entities/supplier-transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Command, Payment, Supplier, SupplierTransaction])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
