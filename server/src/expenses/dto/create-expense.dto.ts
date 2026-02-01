import { IsEnum, IsNumber, IsOptional, IsString, IsDateString, Min, MaxLength } from 'class-validator';
import { ExpenseCategory, PaymentMethod } from '../entities/expense.entity';

export class CreateExpenseDto {
  @IsEnum(ExpenseCategory)
  category: ExpenseCategory;

  @IsString()
  @MaxLength(255)
  description: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsDateString()
  date: string;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  vendor?: string;

  @IsOptional()
  @IsString()
  receiptUrl?: string;

  @IsOptional()
  @IsString()
  note?: string;
}
