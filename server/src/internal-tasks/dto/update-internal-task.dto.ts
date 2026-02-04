import { IsString, IsOptional, IsEnum, IsUUID, IsDateString } from 'class-validator';
import { TaskPriority, TaskStatus, TaskVisibility } from '../entities/internal-task.entity';

export class UpdateInternalTaskDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @IsEnum(TaskVisibility)
  @IsOptional()
  visibility?: TaskVisibility;

  @IsUUID()
  @IsOptional()
  assignedTo?: string;

  @IsDateString()
  @IsOptional()
  dueDate?: string;
}

// DTO for employee updates (status only)
export class UpdateTaskStatusDto {
  @IsEnum(TaskStatus)
  status: TaskStatus;
}
