import { Module } from '@nestjs/common';
import { DashboardController } from './controller';
import { DatabaseModule } from '../database/module';
import { DashboardService } from './service';

@Module({
  imports: [DatabaseModule],
  providers: [DashboardService],
  controllers: [DashboardController],
})
export class DashboardModule {}
