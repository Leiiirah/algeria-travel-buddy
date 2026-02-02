import {
  IsString,
  IsEmail,
  IsOptional,
  IsBoolean,
  IsIn,
} from 'class-validator';

export class UpdateSupplierDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  @IsIn(['airline', 'hotel', 'visa', 'transport', 'insurance', 'other'])
  type?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  contact?: string;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsString()
  @IsOptional()
  bankAccount?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
