import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PaymentTypesService } from './payment-types.service';
import { CreatePaymentTypeDto } from './dto/create-payment-type.dto';
import { UpdatePaymentTypeDto } from './dto/update-payment-type.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('payment-types')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentTypesController {
  constructor(private readonly paymentTypesService: PaymentTypesService) {}

  @Get()
  findAll(@Request() req: any) {
    if (req.user?.role !== 'admin') {
      return this.paymentTypesService.findActive();
    }
    return this.paymentTypesService.findAll();
  }

  @Post()
  @Roles('admin')
  create(@Body() dto: CreatePaymentTypeDto) {
    return this.paymentTypesService.create(dto);
  }

  @Patch(':id')
  @Roles('admin')
  update(@Param('id') id: string, @Body() dto: UpdatePaymentTypeDto) {
    return this.paymentTypesService.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.paymentTypesService.remove(id);
  }
}
