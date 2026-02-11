import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsDateString,
  IsUUID,
  IsBoolean,
} from 'class-validator';
import { OmraRoomType, OmraOrderType } from '../entities/omra-order.entity';

export class CreateOmraOrderDto {
  @IsString()
  @IsNotEmpty()
  clientName: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsDateString()
  @IsOptional()
  orderDate?: string;

  @IsDateString()
  @IsNotEmpty()
  periodFrom: string;

  @IsDateString()
  @IsNotEmpty()
  periodTo: string;

  @IsUUID()
  @IsOptional()
  hotelId?: string;

  @IsEnum(OmraRoomType)
  @IsOptional()
  roomType?: OmraRoomType;

  @IsEnum(OmraOrderType)
  @IsOptional()
  omraType?: OmraOrderType;

  @IsUUID()
  @IsOptional()
  programId?: string;

  @IsBoolean()
  @IsOptional()
  inProgram?: boolean;

  @IsNumber()
  @IsOptional()
  sellingPrice?: number;

  @IsNumber()
  @IsOptional()
  amountPaid?: number;

  @IsNumber()
  @IsOptional()
  buyingPrice?: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsUUID()
  @IsOptional()
  assignedTo?: string;
}
