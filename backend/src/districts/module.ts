import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/module';
import { DistrictsController } from './controller';

@Module({
  imports: [DatabaseModule],
  controllers: [DistrictsController],
})
export class DistrictModule {}
