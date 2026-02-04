import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsDateString,
  IsUUID,
  IsEmail,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateClientInvoiceDto {
  @IsEnum(['proforma', 'finale'])
  type: 'proforma' | 'finale';

  @IsOptional()
  @IsUUID()
  commandId?: string;

  @IsString()
  @MaxLength(255)
  clientName: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  clientPhone?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  clientEmail?: string;

  @IsString()
  @MaxLength(255)
  serviceName: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  serviceType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  destination?: string;

  @IsNumber()
  @Min(0)
  totalAmount: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  paidAmount?: number;

  @IsOptional()
  @IsDateString()
  invoiceDate?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
