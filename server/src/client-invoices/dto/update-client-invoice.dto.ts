import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsDateString,
  IsEmail,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateClientInvoiceDto {
  @IsOptional()
  @IsEnum(['proforma', 'finale'])
  type?: 'proforma' | 'finale';

  @IsOptional()
  @IsEnum(['brouillon', 'envoyee', 'payee', 'annulee'])
  status?: 'brouillon' | 'envoyee' | 'payee' | 'annulee';

  @IsOptional()
  @IsString()
  @MaxLength(255)
  clientName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  clientPhone?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  clientEmail?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  serviceName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  serviceType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  destination?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  totalAmount?: number;

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
  clientPassport?: string;

  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsDateString()
  departureDate?: string;

  @IsOptional()
  @IsDateString()
  returnDate?: string;

  @IsOptional()
  @IsString()
  pnr?: string;

  @IsOptional()
  @IsString()
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
  paymentMethod?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  validityHours?: number;
}
