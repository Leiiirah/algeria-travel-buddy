import { Controller, Get, Query, UseGuards, Request, Param } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  getDashboardStats(@Request() req: any) {
    const isAdmin = req.user.role === 'admin';
    const userId = req.user.id;
    return this.analyticsService.getDashboardStats(userId, isAdmin);
  }

  @Get('revenue')
  getRevenueStats(@Query('fromDate') fromDate: string, @Query('toDate') toDate: string) { return this.analyticsService.getRevenueStats(fromDate, toDate); }

  @Get('suppliers')
  getSupplierStats() { return this.analyticsService.getSupplierStats(); }

  @Get('services')
  getServiceStats() { return this.analyticsService.getServiceStats(); }

  @Get('employee-stats')
  getEmployeeStats(@Request() req: any) {
    return this.analyticsService.getEmployeeCommandStats(req.user.id);
  }

  @Get('employee-stats/:id')
  getEmployeeStatsById(@Param('id') id: string, @Request() req: any) {
    // Admin only endpoint
    if (req.user.role !== 'admin') {
      return this.analyticsService.getEmployeeCommandStats(req.user.id);
    }
    return this.analyticsService.getEmployeeCommandStats(id);
  }
}
