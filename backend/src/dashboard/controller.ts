import { Controller, Get, Query } from '@nestjs/common';
import { ViolationQueryDTO } from '../dto/dtoModels';
import { DashboardService } from './service';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  getDashboard(@Query() query: ViolationQueryDTO) {
    return this.dashboardService.getDashboard(query);
  }
}
