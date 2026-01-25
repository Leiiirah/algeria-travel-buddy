import { IsString, IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { ServiceType } from '../entities/service.entity';

export class UpdateServiceDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(ServiceType)
  @IsOptional()
  type?: ServiceType;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
