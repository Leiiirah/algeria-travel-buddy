import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientInvoice } from './entities/client-invoice.entity';
import { ClientInvoicesController } from './client-invoices.controller';
import { ClientInvoicesService } from './client-invoices.service';
import { Command } from '../commands/entities/command.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ClientInvoice, Command, User])],
  controllers: [ClientInvoicesController],
  providers: [ClientInvoicesService],
  exports: [ClientInvoicesService],
})
export class ClientInvoicesModule {}
