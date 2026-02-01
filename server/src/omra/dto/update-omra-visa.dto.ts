import { PartialType } from '@nestjs/mapped-types';
import { CreateOmraVisaDto } from './create-omra-visa.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { OmraStatus } from '../entities/omra-order.entity';

export class UpdateOmraVisaDto extends PartialType(CreateOmraVisaDto) {
  @IsEnum(OmraStatus)
  @IsOptional()
  status?: OmraStatus;
}
