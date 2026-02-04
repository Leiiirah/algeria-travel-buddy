import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import {
  ClientInvoicesService,
  ClientInvoiceFilters,
} from './client-invoices.service';
import { CreateClientInvoiceDto } from './dto/create-client-invoice.dto';
import { UpdateClientInvoiceDto } from './dto/update-client-invoice.dto';
import { ClientInvoiceType, ClientInvoiceStatus } from './entities/client-invoice.entity';

@Controller('client-invoices')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClientInvoicesController {
  constructor(private readonly invoicesService: ClientInvoicesService) {}

  @Get()
  findAll(
    @CurrentUser() user: User,
    @Query('type') type?: ClientInvoiceType,
    @Query('status') status?: ClientInvoiceStatus,
    @Query('search') search?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    const filters: ClientInvoiceFilters = {
      type,
      status,
      search,
      fromDate,
      toDate,
    };
    return this.invoicesService.findAll(user, filters);
  }

  @Get('stats')
  getStats(@CurrentUser() user: User) {
    return this.invoicesService.getStats(user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.invoicesService.findOne(id, user);
  }

  @Get('command/:commandId')
  findByCommand(
    @Param('commandId') commandId: string,
    @CurrentUser() user: User,
  ) {
    return this.invoicesService.findByCommand(commandId, user);
  }

  @Post()
  create(@Body() dto: CreateClientInvoiceDto, @CurrentUser() user: User) {
    return this.invoicesService.create(dto, user.id);
  }

  @Post('from-command/:commandId')
  createFromCommand(
    @Param('commandId') commandId: string,
    @Body('type') type: ClientInvoiceType,
    @CurrentUser() user: User,
  ) {
    return this.invoicesService.createFromCommand(commandId, type, user.id, user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateClientInvoiceDto,
    @CurrentUser() user: User,
  ) {
    return this.invoicesService.update(id, dto, user);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.invoicesService.remove(id);
  }
}
