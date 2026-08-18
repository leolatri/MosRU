import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/module';
import { AdmOkrugsController } from './controller';

@Module({
  imports: [DatabaseModule],
  controllers: [AdmOkrugsController],
})
export class AdmOkrugsModule {}
