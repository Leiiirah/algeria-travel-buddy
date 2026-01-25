import {
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  IsDateString,
} from 'class-validator';
import { TransactionType } from '../entities/supplier-transaction.entity';

export class CreateSupplierTransactionDto {
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsUUID()
  @IsNotEmpty()
  supplierId: string;

  @IsEnum(TransactionType)
  @IsNotEmpty()
  type: TransactionType;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsOptional()
  note?: string;
}
