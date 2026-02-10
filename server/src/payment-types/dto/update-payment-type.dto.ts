import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class UpdatePaymentTypeDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
