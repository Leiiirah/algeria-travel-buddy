import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateServiceDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  type: string; // Dynamic reference to ServiceType.code

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  defaultSupplierId?: string;

  @IsNumber()
  @IsOptional()
  defaultBuyingPrice?: number;
}
