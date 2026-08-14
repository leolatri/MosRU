import { Controller, Get } from '@nestjs/common';
import { DatabaseService } from '../database/service';

interface DataRow {
  result: number;
}

@Controller('health')
export class HealthController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get()
  async check() {
    const res = await this.databaseService.query<DataRow>(
      'SELECT 1 AS result',
    );

    return {
      status: 'ok',
      database: res.rows[0]?.result === 1 ? 'connected' : 'error',
    };
  }
}
