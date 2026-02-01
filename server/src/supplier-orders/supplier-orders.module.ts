import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupplierOrder } from './entities/supplier-order.entity';
import { SupplierOrdersService } from './supplier-orders.service';
import { SupplierOrdersController } from './supplier-orders.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SupplierOrder])],
  controllers: [SupplierOrdersController],
  providers: [SupplierOrdersService],
  exports: [SupplierOrdersService],
})
export class SupplierOrdersModule {}
