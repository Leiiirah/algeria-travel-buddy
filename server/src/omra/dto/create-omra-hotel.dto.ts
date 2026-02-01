import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateOmraHotelDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  location?: string;
}
