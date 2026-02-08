import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { Command } from '../commands/entities/command.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Supplier } from '../suppliers/entities/supplier.entity';
import { SupplierTransaction } from '../supplier-transactions/entities/supplier-transaction.entity';
import { OmraOrder } from '../omra/entities/omra-order.entity';
import { OmraVisa } from '../omra/entities/omra-visa.entity';
import { User } from '../users/entities/user.entity';
import { CaisseHistoryModule } from '../caisse-history/caisse-history.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Command, Payment, Supplier, SupplierTransaction, OmraOrder, OmraVisa, User]),
    CaisseHistoryModule,
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
