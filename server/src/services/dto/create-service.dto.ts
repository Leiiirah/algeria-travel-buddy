import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';
import { ServiceType } from '../entities/service.entity';

export class CreateServiceDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(ServiceType)
  @IsNotEmpty()
  type: ServiceType;

  @IsString()
  @IsOptional()
  description?: string;
}
