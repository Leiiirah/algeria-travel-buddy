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

  @IsOptional()
  @IsString()
  @MaxLength(50)
  clientPassport?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  companyName?: string;

  @IsOptional()
  @IsDateString()
  departureDate?: string;

  @IsOptional()
  @IsDateString()
  returnDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  pnr?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  travelClass?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  ticketPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  agencyFees?: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  paymentMethod?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  validityHours?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  bankName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  bankAccount?: string;
}
