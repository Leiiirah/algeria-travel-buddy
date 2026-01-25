import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SuppliersService } from './suppliers.service';
import { SuppliersController } from './suppliers.controller';
import { Supplier } from './entities/supplier.entity';
import { Command } from '../commands/entities/command.entity';
import { SupplierTransaction } from '../supplier-transactions/entities/supplier-transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Supplier, Command, SupplierTransaction])],
  controllers: [SuppliersController],
  providers: [SuppliersService],
  exports: [SuppliersService],
})
export class SuppliersModule {}
