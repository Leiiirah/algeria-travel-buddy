import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { EmployeeTransactionsService } from './employee-transactions.service';
import { CreateEmployeeTransactionDto } from './dto/create-employee-transaction.dto';

@Controller('employee-transactions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmployeeTransactionsController {
  constructor(private readonly service: EmployeeTransactionsService) {}

  @Get()
  findAll(@CurrentUser() user: { id: string; role: string }) {
    // Admin sees all, employee sees only their own
    if (user.role === 'admin') {
      return this.service.findAll();
    }
    return this.service.findByEmployee(user.id);
  }

  @Get('balances')
  getAllBalances(@CurrentUser() user: { id: string; role: string }) {
    // Admin sees all balances, employee sees only their own
    if (user.role === 'admin') {
      return this.service.getAllBalances();
    }
    // Return employee's own balance as an array for consistency
    return this.service.getEmployeeBalance(user.id).then(balance => [balance]);
  }

  @Get('employee/:id')
  findByEmployee(@Param('id') id: string, @CurrentUser() user: { id: string; role: string }) {
    // Employee can only see their own transactions
    if (user.role !== 'admin' && user.id !== id) {
      return [];
    }
    return this.service.findByEmployee(id);
  }

  @Get('employee/:id/balance')
  getEmployeeBalance(@Param('id') id: string, @CurrentUser() user: { id: string; role: string }) {
    // Employee can only see their own balance
    if (user.role !== 'admin' && user.id !== id) {
      return { totalAvances: 0, totalCredits: 0, totalSalaires: 0, balance: 0 };
    }
    return this.service.getEmployeeBalance(id);
  }

  @Post()
  @Roles('admin')
  create(
    @Body() dto: CreateEmployeeTransactionDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.service.create(dto, user.id);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
