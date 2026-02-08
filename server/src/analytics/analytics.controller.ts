import { Controller, Get, Query, UseGuards, Request, Param, ForbiddenException } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CaisseHistoryService } from '../caisse-history/caisse-history.service';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly caisseHistoryService: CaisseHistoryService,
  ) {}

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

  @Get('employee-caisses')
  async getEmployeeCaisseStats(@Request() req: any) {
    // Admin only endpoint
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }
    // Fetch last reset dates and pass to analytics
    const lastResetDates = await this.caisseHistoryService.getAllLastResetDates();
    return this.analyticsService.getEmployeeCaisseStats(lastResetDates);
  }
}
