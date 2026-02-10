import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePaymentTypeDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}
