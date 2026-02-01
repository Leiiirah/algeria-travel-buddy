import { IsString, IsNumber, IsOptional, IsDateString, Min, IsInt, IsIn } from 'class-validator';
import { OrderStatus } from '../entities/supplier-order.entity';

export class UpdateSupplierOrderDto {
  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  unitPrice?: number;

  @IsOptional()
  @IsDateString()
  orderDate?: string;

  @IsOptional()
  @IsIn(['en_attente', 'livre', 'partiel', 'annule'])
  status?: OrderStatus;

  @IsOptional()
  @IsInt()
  @Min(0)
  deliveredQuantity?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
