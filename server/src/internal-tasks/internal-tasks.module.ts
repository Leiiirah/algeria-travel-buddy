import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InternalTask } from './entities/internal-task.entity';
import { InternalTasksController } from './internal-tasks.controller';
import { InternalTasksService } from './internal-tasks.service';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InternalTask, User])],
  controllers: [InternalTasksController],
  providers: [InternalTasksService],
  exports: [InternalTasksService],
})
export class InternalTasksModule {}
