import { IsString, IsNumber, IsOptional, IsDateString, Min, IsInt, IsUUID } from 'class-validator';

export class CreateSupplierReceiptDto {
  @IsString()
  supplierId: string;

  @IsOptional()
  @IsUUID()
  orderId?: string;

  @IsString()
  description: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  unitPrice: number;

  @IsDateString()
  receiptDate: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
