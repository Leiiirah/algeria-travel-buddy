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
import { CommandsService, CommandFilters } from './commands.service';
import { CreateCommandDto } from './dto/create-command.dto';
import { UpdateCommandDto } from './dto/update-command.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('commands')
@UseGuards(JwtAuthGuard)
export class CommandsController {
  constructor(private readonly commandsService: CommandsService) { }

  @Get()
  findAll(@Query() filters: CommandFilters, @Request() req: any) {
    // Employees can only see their own commands
    const isAdmin = req.user.role === 'admin';
    if (!isAdmin) {
      filters.createdBy = req.user.id;
    }
    return this.commandsService.findAll(filters);
  }

  @Get('stats')
  getStats() {
    return this.commandsService.getStats();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.commandsService.findOne(id);
  }

  @Post()
  create(@Body() createCommandDto: CreateCommandDto, @Request() req: any) {
    return this.commandsService.create(createCommandDto, req.user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCommandDto: UpdateCommandDto) {
    return this.commandsService.update(id, updateCommandDto);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.commandsService.updateStatus(id, status);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.commandsService.remove(id);
  }
}
