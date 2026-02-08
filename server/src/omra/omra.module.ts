import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OmraService } from './omra.service';
import { OmraController } from './omra.controller';
import { OmraHotel } from './entities/omra-hotel.entity';
import { OmraOrder } from './entities/omra-order.entity';
import { OmraVisa } from './entities/omra-visa.entity';
import { OmraProgram } from './entities/omra-program.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OmraHotel, OmraOrder, OmraVisa, OmraProgram])],
  controllers: [OmraController],
  providers: [OmraService],
  exports: [OmraService],
})
export class OmraModule {}
