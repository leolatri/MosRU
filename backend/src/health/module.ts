import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/module';
import { HealthController } from './controller';

@Module({
  imports: [DatabaseModule],
  controllers: [HealthController],
})
export class HealthModule {}
