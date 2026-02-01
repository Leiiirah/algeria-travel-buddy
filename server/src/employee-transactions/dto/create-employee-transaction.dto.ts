import { IsEnum, IsNumber, IsOptional, IsString, IsUUID, IsDateString, Min } from 'class-validator';
import { EmployeeTransactionType } from '../entities/employee-transaction.entity';

export class CreateEmployeeTransactionDto {
  @IsUUID()
  employeeId: string;

  @IsEnum(EmployeeTransactionType)
  type: EmployeeTransactionType;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  month?: string;

  @IsOptional()
  @IsString()
  note?: string;
}
