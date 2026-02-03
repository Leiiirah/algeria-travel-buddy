import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin') // All payment operations require admin role
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) { }

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    return this.paymentsService.findAll({ search, fromDate, toDate });
  }

  @Get('command/:commandId')
  findByCommand(@Param('commandId') commandId: string) {
    return this.paymentsService.findByCommand(commandId);
  }

  @Post()
  create(@Body() createPaymentDto: CreatePaymentDto, @Request() req: any) {
    return this.paymentsService.create(createPaymentDto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.paymentsService.remove(id);
  }
}
