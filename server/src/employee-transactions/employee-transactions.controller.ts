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
  @Roles('admin')
  findAll() {
    return this.service.findAll();
  }

  @Get('balances')
  @Roles('admin')
  getAllBalances() {
    return this.service.getAllBalances();
  }

  @Get('employee/:id')
  findByEmployee(@Param('id') id: string) {
    return this.service.findByEmployee(id);
  }

  @Get('employee/:id/balance')
  getEmployeeBalance(@Param('id') id: string) {
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
