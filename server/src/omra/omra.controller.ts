import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { OmraService, OmraFilters } from './omra.service';
import { CreateOmraHotelDto } from './dto/create-omra-hotel.dto';
import { UpdateOmraHotelDto } from './dto/update-omra-hotel.dto';
import { CreateOmraOrderDto } from './dto/create-omra-order.dto';
import { UpdateOmraOrderDto } from './dto/update-omra-order.dto';
import { CreateOmraVisaDto } from './dto/create-omra-visa.dto';
import { UpdateOmraVisaDto } from './dto/update-omra-visa.dto';
import { CreateOmraProgramDto } from './dto/create-omra-program.dto';
import { UpdateOmraProgramDto } from './dto/update-omra-program.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('omra')
@UseGuards(JwtAuthGuard)
export class OmraController {
  constructor(private readonly omraService: OmraService) {}

  // ==================== HOTELS ====================

  @Get('hotels')
  findAllHotels() {
    return this.omraService.findAllHotels();
  }

  @Get('hotels/active')
  findActiveHotels() {
    return this.omraService.findActiveHotels();
  }

  @Get('hotels/:id')
  findHotelById(@Param('id') id: string) {
    return this.omraService.findHotelById(id);
  }

  @Post('hotels')
  createHotel(@Body() dto: CreateOmraHotelDto) {
    return this.omraService.createHotel(dto);
  }

  @Patch('hotels/:id')
  updateHotel(@Param('id') id: string, @Body() dto: UpdateOmraHotelDto) {
    return this.omraService.updateHotel(id, dto);
  }

  @Delete('hotels/:id')
  deleteHotel(@Param('id') id: string) {
    return this.omraService.deleteHotel(id);
  }

  // ==================== PROGRAMS ====================

  @Get('programs')
  findAllPrograms() {
    return this.omraService.findAllPrograms();
  }

  @Get('programs/active')
  findActivePrograms() {
    return this.omraService.findActivePrograms();
  }

  @Get('programs/inventory')
  getProgramInventory() {
    return this.omraService.getProgramInventory();
  }

  @Get('programs/:id')
  findProgramById(@Param('id') id: string) {
    return this.omraService.findProgramById(id);
  }

  @Post('programs')
  createProgram(@Body() dto: CreateOmraProgramDto, @Request() req: any) {
    return this.omraService.createProgram(dto, req.user.id);
  }

  @Patch('programs/:id')
  updateProgram(@Param('id') id: string, @Body() dto: UpdateOmraProgramDto) {
    return this.omraService.updateProgram(id, dto);
  }

  @Delete('programs/:id')
  deleteProgram(@Param('id') id: string) {
    return this.omraService.deleteProgram(id);
  }

  // ==================== ORDERS ====================

  @Get('orders')
  findAllOrders(@Query() filters: OmraFilters) {
    return this.omraService.findAllOrders(filters);
  }

  @Get('orders/:id')
  findOrderById(@Param('id') id: string) {
    return this.omraService.findOrderById(id);
  }

  @Post('orders')
  createOrder(@Body() dto: CreateOmraOrderDto, @Request() req: any) {
    return this.omraService.createOrder(dto, req.user.id);
  }

  @Patch('orders/:id')
  updateOrder(@Param('id') id: string, @Body() dto: UpdateOmraOrderDto) {
    return this.omraService.updateOrder(id, dto);
  }

  @Patch('orders/:id/status')
  updateOrderStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.omraService.updateOrderStatus(id, status);
  }

  @Delete('orders/:id')
  deleteOrder(@Param('id') id: string) {
    return this.omraService.deleteOrder(id);
  }

  // ==================== VISAS ====================

  @Get('visas')
  findAllVisas(@Query() filters: OmraFilters) {
    return this.omraService.findAllVisas(filters);
  }

  @Get('visas/:id')
  findVisaById(@Param('id') id: string) {
    return this.omraService.findVisaById(id);
  }

  @Post('visas')
  createVisa(@Body() dto: CreateOmraVisaDto, @Request() req: any) {
    return this.omraService.createVisa(dto, req.user.id);
  }

  @Patch('visas/:id')
  updateVisa(@Param('id') id: string, @Body() dto: UpdateOmraVisaDto) {
    return this.omraService.updateVisa(id, dto);
  }

  @Patch('visas/:id/status')
  updateVisaStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.omraService.updateVisaStatus(id, status);
  }

  @Delete('visas/:id')
  deleteVisa(@Param('id') id: string) {
    return this.omraService.deleteVisa(id);
  }

  // ==================== STATS ====================

  @Get('stats')
  getStats() {
    return this.omraService.getStats();
  }
}
