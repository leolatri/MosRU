import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ResponseStatusModule } from './responseStatus/module';
import { ProblemTopicsModule } from './problemTopics/module';
import { ObjCategoriesModule } from './objectCategories/module';
import { DistrictModule } from './districts/module';
import { AdmOkrugsModule } from './administrativeOkrugs/module';
import { CategoryProblemTopicModule } from './categoryProblemTopics/module';
import { ViolationModule } from './violations/module';
import { AuthModule } from './auth/module';
import { ImportsModule } from './imports/module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env', '../.env']}),
    ResponseStatusModule,
    ProblemTopicsModule,
    ObjCategoriesModule,
    AdmOkrugsModule,
    DistrictModule,
    CategoryProblemTopicModule,
    ViolationModule,
    AuthModule,
    ImportsModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
