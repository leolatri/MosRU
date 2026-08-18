import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/module';
import { ViolationsController } from './controller';
import { ViolationsService } from './service';

@Module({
  imports: [DatabaseModule],
  providers: [ViolationsService],
  controllers: [ViolationsController],
})
export class ViolationModule {}
