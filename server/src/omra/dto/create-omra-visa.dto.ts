import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsDateString,
  IsUUID,
} from 'class-validator';

export class CreateOmraVisaDto {
  @IsString()
  @IsNotEmpty()
  clientName: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsDateString()
  @IsOptional()
  visaDate?: string;

  @IsDateString()
  @IsNotEmpty()
  entryDate: string;

  @IsUUID()
  @IsOptional()
  hotelId?: string;

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
  notes?: string;

  @IsUUID()
  @IsOptional()
  assignedTo?: string;
}
