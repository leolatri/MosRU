import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/module';
import { ResponseStatusController } from './controller';

@Module({
  imports: [DatabaseModule],
  controllers: [ResponseStatusController],
})
export class ResponseStatusModule {}
