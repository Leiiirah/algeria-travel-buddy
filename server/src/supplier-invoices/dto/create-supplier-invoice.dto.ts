import { IsString, IsNumber, IsOptional, IsDateString, Min } from 'class-validator';

export class CreateSupplierInvoiceDto {
  @IsString()
  supplierId: string;

  @IsString()
  invoiceNumber: string;

  @IsString()
  description: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsDateString()
  invoiceDate: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsString()
  fileUrl?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
