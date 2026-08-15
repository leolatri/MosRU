import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './health/module';
import { ResponseStatusModule } from './responseStatus/module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    HealthModule,
    ResponseStatusModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
