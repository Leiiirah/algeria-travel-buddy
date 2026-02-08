import { PartialType } from '@nestjs/mapped-types';
import { CreateOmraProgramDto } from './create-omra-program.dto';
import { IsOptional, IsBoolean } from 'class-validator';

export class UpdateOmraProgramDto extends PartialType(CreateOmraProgramDto) {
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
