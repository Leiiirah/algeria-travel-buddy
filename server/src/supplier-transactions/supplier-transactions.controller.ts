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
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('supplier-transactions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin') // All supplier transaction operations require admin role
export class SupplierTransactionsController {
  constructor(
    private readonly transactionsService: SupplierTransactionsService,
  ) { }

  @Get()
  findAll() {
    return this.transactionsService.findAll();
  }

  @Get('supplier/:supplierId')
  findBySupplier(@Param('supplierId') supplierId: string) {
    return this.transactionsService.findBySupplier(supplierId);
  }

  @Post()
  create(@Body() createDto: CreateSupplierTransactionDto, @Request() req: any) {
    return this.transactionsService.create(createDto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.transactionsService.remove(id);
  }
}
