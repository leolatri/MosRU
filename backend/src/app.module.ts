import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './health/module';
import { ResponseStatusModule } from './responseStatus/module';
import { ProblemTopicsModule } from './problemTopics/module';
import { ObjCategoriesModule } from './objectCategories/module';
import { DistrictModule } from './districts/module';
import { AdmOkrugsModule } from './administrativeOkrugs/module';
import { CategoryProblemTopicModule } from './categoryProblemTopics/module';
import { ViolationModule } from './violations/module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    HealthModule,
    ResponseStatusModule,
    ProblemTopicsModule,
    ObjCategoriesModule,
    AdmOkrugsModule,
    DistrictModule,
    CategoryProblemTopicModule,
    ViolationModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
