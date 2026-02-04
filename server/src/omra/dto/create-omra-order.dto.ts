import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsDateString,
  IsUUID,
} from 'class-validator';
import { OmraRoomType } from '../entities/omra-order.entity';

export class CreateOmraOrderDto {
  @IsString()
  @IsNotEmpty()
  clientName: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsDateString()
  @IsNotEmpty()
  orderDate: string;

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
