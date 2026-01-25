import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SupplierTransactionsService } from './supplier-transactions.service';
import { CreateSupplierTransactionDto } from './dto/create-supplier-transaction.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('supplier-transactions')
@UseGuards(JwtAuthGuard)
export class SupplierTransactionsController {
  constructor(
    private readonly transactionsService: SupplierTransactionsService,
  ) {}

  @Get()
  findAll() {
    return this.transactionsService.findAll();
  }

  @Get('supplier/:supplierId')
  findBySupplier(@Param('supplierId') supplierId: string) {
    return this.transactionsService.findBySupplier(supplierId);
  }

  @Post()
  create(@Body() createDto: CreateSupplierTransactionDto, @Request() req) {
    return this.transactionsService.create(createDto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.transactionsService.remove(id);
  }
}
