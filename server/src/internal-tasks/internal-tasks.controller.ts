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
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { InternalTasksService, TaskStats } from './internal-tasks.service';
import { CreateInternalTaskDto } from './dto/create-internal-task.dto';
import { UpdateInternalTaskDto } from './dto/update-internal-task.dto';
import { InternalTask } from './entities/internal-task.entity';

@Controller('api/internal-tasks')
@UseGuards(JwtAuthGuard)
export class InternalTasksController {
  constructor(private readonly tasksService: InternalTasksService) {}

  @Get()
  findAll(@CurrentUser() user: User): Promise<InternalTask[]> {
    return this.tasksService.findAll(user);
  }

  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles('admin')
  getStats(): Promise<TaskStats> {
    return this.tasksService.getStats();
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: User): Promise<InternalTask> {
    return this.tasksService.findOne(id, user);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  create(
    @Body() dto: CreateInternalTaskDto,
    @CurrentUser() user: User,
  ): Promise<InternalTask> {
    return this.tasksService.create(dto, user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateInternalTaskDto,
    @CurrentUser() user: User,
  ): Promise<InternalTask> {
    return this.tasksService.update(id, dto, user);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string): Promise<void> {
    return this.tasksService.remove(id);
  }
}
