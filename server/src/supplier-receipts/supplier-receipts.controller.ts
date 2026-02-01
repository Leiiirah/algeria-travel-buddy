import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SupplierReceiptsService } from './supplier-receipts.service';
import { CreateSupplierReceiptDto } from './dto/create-supplier-receipt.dto';

@Controller('supplier-receipts')
@UseGuards(JwtAuthGuard)
export class SupplierReceiptsController {
  constructor(private readonly receiptsService: SupplierReceiptsService) {}

  @Get()
  findAll(
    @Query('supplierId') supplierId?: string,
    @Query('orderId') orderId?: string,
  ) {
    return this.receiptsService.findAll(supplierId, orderId);
  }

  @Get('stats')
  getStats() {
    return this.receiptsService.getStats();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.receiptsService.findOne(id);
  }

  @Post()
  create(
    @Body() dto: CreateSupplierReceiptDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.receiptsService.create(dto, user.userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.receiptsService.remove(id);
  }
}
