import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateServiceTypeDto {
  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  nameFr?: string;

  @IsString()
  @IsOptional()
  nameAr?: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
