import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ViolationDTO, ViolationQueryDTO } from '../dto/dtoModels';
import { ViolationsService } from './service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Violations')
@ApiBearerAuth()
@Controller('violations')
export class ViolationsController {
  constructor(private readonly violationService: ViolationsService) {}

  @Get()
  getAll(@Query() query: ViolationQueryDTO) {
    return this.violationService.getAll(query);
  }

  @Get(':id')
  getViolationById(@Param('id', ParseIntPipe) id: number) {
    return this.violationService.getViolationById(id);
  }

  @Post()
  createViolation(@Body() dto: ViolationDTO) {
    return this.violationService.createViolation(dto);
  }

  @Put(':id')
  updateViolation(
    @Body() dto: ViolationDTO,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.violationService.updateViolation(dto, id);
  }

  @Delete(':id')
  deleteViolation(@Param('id', ParseIntPipe) id: number) {
    return this.violationService.deleteViolation(id);
  }
}
