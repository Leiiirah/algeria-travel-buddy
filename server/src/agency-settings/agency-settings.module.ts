import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgencySetting } from './entities/agency-setting.entity';
import { AgencySettingsService } from './agency-settings.service';
import { AgencySettingsController } from './agency-settings.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AgencySetting])],
  controllers: [AgencySettingsController],
  providers: [AgencySettingsService],
  exports: [AgencySettingsService],
})
export class AgencySettingsModule implements OnModuleInit {
  constructor(private readonly service: AgencySettingsService) {}

  async onModuleInit() {
    await this.service.seed();
  }
}
