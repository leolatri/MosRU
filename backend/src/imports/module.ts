import { Module } from '@nestjs/common';
import { ImportsController } from './controller';
import { ImportsService } from './service';

@Module({
  controllers: [ImportsController],
  providers: [ImportsService],
})
export class ImportsModule {}