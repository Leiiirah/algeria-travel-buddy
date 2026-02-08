import { Controller, Get, Post, Param, Body, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { CaisseHistoryService } from './caisse-history.service';
import { CreateCaisseSettlementDto } from './dto/create-caisse-settlement.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('caisse-history')
@UseGuards(JwtAuthGuard)
export class CaisseHistoryController {
  constructor(private readonly caisseHistoryService: CaisseHistoryService) {}

  @Post('settle')
  createSettlement(@Body() dto: CreateCaisseSettlementDto, @Request() req: any) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }
    return this.caisseHistoryService.createSettlement(dto, req.user.id);
  }

  @Get('employee/:id')
  getSettlementsByEmployee(@Param('id') id: string, @Request() req: any) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }
    return this.caisseHistoryService.getSettlementsByEmployee(id);
  }

  @Get('last-resets')
  getAllLastResetDates(@Request() req: any) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }
    return this.caisseHistoryService.getAllLastResetDates();
  }
}
