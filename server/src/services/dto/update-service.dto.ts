import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class UpdateServiceDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  type?: string; // Dynamic reference to ServiceType.code

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
