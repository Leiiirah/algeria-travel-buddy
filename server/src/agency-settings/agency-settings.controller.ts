import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { AgencySettingsService } from './agency-settings.service';
import { UpdateAgencySettingsDto } from './dto/update-agency-settings.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('agency-settings')
@UseGuards(JwtAuthGuard)
export class AgencySettingsController {
  constructor(private readonly service: AgencySettingsService) {}

  @Get()
  getAll() {
    return this.service.getAll();
  }

  @Put()
  @UseGuards(RolesGuard)
  @Roles('admin')
  update(@Body() dto: UpdateAgencySettingsDto) {
    return this.service.update(dto.settings);
  }
}
