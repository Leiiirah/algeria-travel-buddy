import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateServiceTypeDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  nameFr: string;

  @IsString()
  @IsNotEmpty()
  nameAr: string;

  @IsString()
  @IsOptional()
  icon?: string;
}
