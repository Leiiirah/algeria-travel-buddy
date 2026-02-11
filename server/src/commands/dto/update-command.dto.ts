import {
  IsString,
  IsNumber,
  IsOptional,
  IsObject,
  IsEnum,
  IsUUID,
  IsDateString,
} from 'class-validator';
import { CommandStatus } from '../entities/command.entity';

export class UpdateCommandDto {
  @IsUUID()
  @IsOptional()
  serviceId?: string;

  @IsUUID()
  @IsOptional()
  supplierId?: string;

  @IsObject()
  @IsOptional()
  data?: Record<string, any>;

  @IsEnum(CommandStatus)
  @IsOptional()
  status?: CommandStatus;

  @IsString()
  @IsOptional()
  destination?: string;

  @IsNumber()
  @IsOptional()
  sellingPrice?: number;

  @IsNumber()
  @IsOptional()
  amountPaid?: number;

  @IsNumber()
  @IsOptional()
  buyingPrice?: number;

  @IsString()
  @IsOptional()
  passportUrl?: string;

  @IsDateString()
  @IsOptional()
  commandDate?: string;

  @IsUUID()
  @IsOptional()
  assignedTo?: string;
}
