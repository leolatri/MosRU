import { Module } from '@nestjs/common';
import { ImportsController } from './controller';
import { ImportsService } from './service';
import { XlsxParserService } from './parser';
import { DatabaseModule } from '../database/module';

@Module({
  imports: [DatabaseModule],
  controllers: [ImportsController],
  providers: [ImportsService, XlsxParserService],
})
export class ImportsModule {}
