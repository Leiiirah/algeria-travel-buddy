import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ServiceTypesService } from './service-types.service';
import { CreateServiceTypeDto } from './dto/create-service-type.dto';
import { UpdateServiceTypeDto } from './dto/update-service-type.dto';

@Controller('service-types')
@UseGuards(JwtAuthGuard)
export class ServiceTypesController {
  constructor(private readonly serviceTypesService: ServiceTypesService) {}

  @Get()
  findAll() {
    return this.serviceTypesService.findAll();
  }

  @Get('active')
  findActive() {
    return this.serviceTypesService.findActive();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.serviceTypesService.findOne(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  create(@Body() createServiceTypeDto: CreateServiceTypeDto) {
    return this.serviceTypesService.create(createServiceTypeDto);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  update(@Param('id') id: string, @Body() updateServiceTypeDto: UpdateServiceTypeDto) {
    return this.serviceTypesService.update(id, updateServiceTypeDto);
  }

  @Patch(':id/toggle')
  @UseGuards(RolesGuard)
  @Roles('admin')
  toggleStatus(@Param('id') id: string) {
    return this.serviceTypesService.toggleStatus(id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.serviceTypesService.remove(id);
  }

  @Post('seed')
  @UseGuards(RolesGuard)
  @Roles('admin')
  seed() {
    return this.serviceTypesService.seed();
  }
}
