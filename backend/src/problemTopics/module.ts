import { Module } from '@nestjs/common';
import { ProblemTopicsController } from './controller';
import { DatabaseModule } from '../database/module';

@Module({
  imports: [DatabaseModule],
  controllers: [ProblemTopicsController],
})
export class ProblemTopicsModule {}
