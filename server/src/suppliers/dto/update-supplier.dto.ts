import {
  IsString,
  IsEmail,
  IsOptional,
  IsArray,
  IsBoolean,
} from 'class-validator';

export class UpdateSupplierDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  contact?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  serviceTypes?: string[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
