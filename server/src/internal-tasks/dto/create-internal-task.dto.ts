import { IsString, IsNotEmpty, IsOptional, IsEnum, IsUUID, IsDateString } from 'class-validator';
import { TaskPriority, TaskVisibility } from '../entities/internal-task.entity';

export class CreateInternalTaskDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @IsEnum(TaskVisibility)
  @IsOptional()
  visibility?: TaskVisibility;

  @IsUUID()
  @IsNotEmpty()
  assignedTo: string;

  @IsDateString()
  @IsOptional()
  dueDate?: string;
}
