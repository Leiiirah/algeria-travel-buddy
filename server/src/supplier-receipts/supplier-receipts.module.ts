import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupplierReceipt } from './entities/supplier-receipt.entity';
import { SupplierReceiptsService } from './supplier-receipts.service';
import { SupplierReceiptsController } from './supplier-receipts.controller';
import { SupplierOrdersModule } from '../supplier-orders/supplier-orders.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SupplierReceipt]),
    SupplierOrdersModule,
  ],
  controllers: [SupplierReceiptsController],
  providers: [SupplierReceiptsService],
  exports: [SupplierReceiptsService],
})
export class SupplierReceiptsModule {}
