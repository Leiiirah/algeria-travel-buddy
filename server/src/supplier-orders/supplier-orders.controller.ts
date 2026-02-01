import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SupplierOrdersService } from './supplier-orders.service';
import { CreateSupplierOrderDto } from './dto/create-supplier-order.dto';
import { UpdateSupplierOrderDto } from './dto/update-supplier-order.dto';

@Controller('supplier-orders')
@UseGuards(JwtAuthGuard)
export class SupplierOrdersController {
  constructor(private readonly ordersService: SupplierOrdersService) {}

  @Get()
  findAll(@Query('supplierId') supplierId?: string) {
    return this.ordersService.findAll(supplierId);
  }

  @Get('stats')
  getStats() {
    return this.ordersService.getStats();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Post()
  create(
    @Body() dto: CreateSupplierOrderDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.ordersService.create(dto, user.userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSupplierOrderDto) {
    return this.ordersService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(id);
  }
}
