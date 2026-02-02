import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceTypesService } from './service-types.service';
import { ServiceTypesController } from './service-types.controller';
import { ServiceType } from './entities/service-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceType])],
  controllers: [ServiceTypesController],
  providers: [ServiceTypesService],
  exports: [ServiceTypesService],
})
export class ServiceTypesModule implements OnModuleInit {
  constructor(private readonly serviceTypesService: ServiceTypesService) {}

  async onModuleInit() {
    // Auto-seed default service types on startup
    await this.serviceTypesService.seed();
  }
}
