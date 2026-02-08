import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsDateString,
  IsUUID,
  IsObject,
} from 'class-validator';

export class CreateOmraProgramDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsDateString()
  @IsNotEmpty()
  periodFrom: string;

  @IsDateString()
  @IsNotEmpty()
  periodTo: string;

  @IsNumber()
  @IsNotEmpty()
  totalPlaces: number;

  @IsUUID()
  @IsOptional()
  hotelId?: string;

  @IsObject()
  @IsOptional()
  pricing?: Record<string, number>;
}
