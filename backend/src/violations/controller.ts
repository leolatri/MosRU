import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  StreamableFile,
} from '@nestjs/common';
import { ViolationDTO, ViolationQueryDTO } from '../dto/dtoModels';
import { ViolationsService } from './service';
import { ApiBearerAuth, ApiOkResponse, ApiProduces, ApiTags } from '@nestjs/swagger';

const XLSX_MIME_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

@ApiTags('Violations')
@ApiBearerAuth()
@Controller('violations')
export class ViolationsController {
  constructor(private readonly violationService: ViolationsService) { }

  @Get()
  getAll(@Query() query: ViolationQueryDTO) {
    return this.violationService.getAll(query);
  }

  @Get('export/xlsx')
  @ApiProduces(XLSX_MIME_TYPE)
  @ApiOkResponse({
    description:
      'XLSX file containing filtered violations',
    content: {
      [XLSX_MIME_TYPE]: {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @Header('Content-Type', XLSX_MIME_TYPE)
  @Header(
    'Content-Disposition',
    'attachment; filename="violations.xlsx"',
  )
  async exportXlsx(@Query() query: ViolationQueryDTO): Promise<StreamableFile> {
    const buffer = await this.violationService.exportXlsx(query);

    return new StreamableFile(buffer);
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
