import { PartialType } from '@nestjs/mapped-types';
import { CreateOmraHotelDto } from './create-omra-hotel.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateOmraHotelDto extends PartialType(CreateOmraHotelDto) {
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
