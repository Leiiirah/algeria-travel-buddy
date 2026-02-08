import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CaisseHistoryController } from './caisse-history.controller';
import { CaisseHistoryService } from './caisse-history.service';
import { CaisseHistory } from './entities/caisse-history.entity';
import { Command } from '../commands/entities/command.entity';
import { OmraOrder } from '../omra/entities/omra-order.entity';
import { OmraVisa } from '../omra/entities/omra-visa.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CaisseHistory, Command, OmraOrder, OmraVisa, User])],
  controllers: [CaisseHistoryController],
  providers: [CaisseHistoryService],
  exports: [CaisseHistoryService],
})
export class CaisseHistoryModule {}
