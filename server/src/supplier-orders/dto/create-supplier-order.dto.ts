import { IsString, IsNumber, IsOptional, IsDateString, Min, IsInt } from 'class-validator';

export class CreateSupplierOrderDto {
  @IsString()
  supplierId: string;

  @IsString()
  description: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  unitPrice: number;

  @IsDateString()
  orderDate: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
