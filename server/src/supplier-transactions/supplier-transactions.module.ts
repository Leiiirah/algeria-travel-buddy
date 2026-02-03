import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as fs from 'fs';
import { SupplierTransactionsService } from './supplier-transactions.service';
import { SupplierTransactionsController } from './supplier-transactions.controller';
import { SupplierTransaction } from './entities/supplier-transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SupplierTransaction])],
  controllers: [SupplierTransactionsController],
  providers: [SupplierTransactionsService],
  exports: [SupplierTransactionsService],
})
export class SupplierTransactionsModule implements OnModuleInit {
  onModuleInit() {
    const uploadDir = './uploads/receipts';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
  }
}
