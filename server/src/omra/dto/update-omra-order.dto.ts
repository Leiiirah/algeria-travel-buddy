import { PartialType } from '@nestjs/mapped-types';
import { CreateOmraOrderDto } from './create-omra-order.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { OmraStatus } from '../entities/omra-order.entity';

export class UpdateOmraOrderDto extends PartialType(CreateOmraOrderDto) {
  @IsEnum(OmraStatus)
  @IsOptional()
  status?: OmraStatus;
}
