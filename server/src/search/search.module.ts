import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { Command } from '../commands/entities/command.entity';
import { Supplier } from '../suppliers/entities/supplier.entity';
import { User } from '../users/entities/user.entity';
import { Document } from '../documents/entities/document.entity';
import { SupplierTransaction } from '../supplier-transactions/entities/supplier-transaction.entity';
import { Payment } from '../payments/entities/payment.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Command, Supplier, User, Document, SupplierTransaction, Payment])],
    controllers: [SearchController],
    providers: [SearchService],
})
export class SearchModule { }
