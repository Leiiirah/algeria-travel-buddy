import { IsString, IsEnum, IsOptional, IsBoolean, IsNumber } from 'class-validator';
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
  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  defaultSupplierId?: string;

  @IsNumber()
  @IsOptional()
  defaultBuyingPrice?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
