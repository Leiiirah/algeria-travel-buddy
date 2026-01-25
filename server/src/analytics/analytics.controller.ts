import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  getDashboardStats() { return this.analyticsService.getDashboardStats(); }

  @Get('revenue')
  getRevenueStats(@Query('fromDate') fromDate: string, @Query('toDate') toDate: string) { return this.analyticsService.getRevenueStats(fromDate, toDate); }

  @Get('suppliers')
  getSupplierStats() { return this.analyticsService.getSupplierStats(); }

  @Get('services')
  getServiceStats() { return this.analyticsService.getServiceStats(); }
}
