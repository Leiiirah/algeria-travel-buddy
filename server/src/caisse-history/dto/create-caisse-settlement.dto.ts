import { IsUUID, IsOptional, IsNumber, IsString, MaxLength } from 'class-validator';

export class CreateCaisseSettlementDto {
  @IsUUID()
  employeeId: string;

  @IsOptional()
  @IsNumber()
  newBalance?: number = 0;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
