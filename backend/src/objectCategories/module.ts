import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/module';
import { ObjCategoriesController } from './controller';

@Module({
  imports: [DatabaseModule],
  controllers: [ObjCategoriesController],
})
export class ObjCategoriesModule {}
