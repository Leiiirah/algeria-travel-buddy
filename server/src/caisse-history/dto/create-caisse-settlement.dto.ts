import { IsUUID, IsOptional, IsNumber, IsString, MaxLength } from 'class-validator';

export class CreateCaisseSettlementDto {
  @IsUUID()
  employeeId: string;

  @IsOptional()
  @IsNumber()
  newCaisse?: number = 0;

  @IsOptional()
  @IsNumber()
  newImpayes?: number = 0;

  @IsOptional()
  @IsNumber()
  newBenefices?: number = 0;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
