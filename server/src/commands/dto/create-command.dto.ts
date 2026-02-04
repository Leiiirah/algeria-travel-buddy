import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsObject,
  IsUUID,
} from 'class-validator';

export class CreateCommandDto {
  @IsUUID()
  @IsNotEmpty()
  serviceId: string;

  @IsUUID()
  @IsNotEmpty()
  supplierId: string;

  @IsObject()
  @IsNotEmpty()
  data: Record<string, any>;

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

  @IsUUID()
  @IsOptional()
  assignedTo?: string;
}
