import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { DatabaseError, QueryResultRow } from 'pg';
import { DatabaseService } from '../database/service';
import { AdmOkrugsDTO } from '../dto/dtoModels';
import { ApiBearerAuth } from '@nestjs/swagger';

interface AdmOkrugsModel extends QueryResultRow {
  id: number;
  code: string;
}

@ApiBearerAuth()
@Controller('administrative-okrugs')
export class AdmOkrugsController {
  constructor(private readonly dbService: DatabaseService) {}

  @Get()
  async getAll(): Promise<AdmOkrugsModel[]> {
    const result = await this.dbService.query<AdmOkrugsModel>(
      `SELECT id, code
            FROM administrative_okrugs
            ORDER BY id
            `,
    );

    return result.rows;
  }

  @Get(':id')
  async getAdmOkrugById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<AdmOkrugsModel> {
    const result = await this.dbService.query<AdmOkrugsModel>(
      `SELECT id, code
            FROM administrative_okrugs
            WHERE id = $1
            `,
      [id],
    );
    const okrug = result.rows[0];

    if (!okrug)
      throw new NotFoundException(`Not found adm okrug with id = ${id}`);

    return okrug;
  }

  @Post()
  async createAdmOkrug(@Body() dto: AdmOkrugsDTO): Promise<AdmOkrugsModel> {
    try {
      const result = await this.dbService.query<AdmOkrugsModel>(
        `INSERT INTO administrative_okrugs (code)
                VALUES ($1)
                RETURNING id, code`,
        [dto.code],
      );

      return result.rows[0];
    } catch (error: unknown) {
      if (error instanceof DatabaseError && error.code === '23505') {
        throw new ConflictException(`Adm okrug "${dto.code}" already exists`);
      }
      throw error;
    }
  }

  @Patch(':id')
  async updateAdmOkrug(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AdmOkrugsDTO,
  ): Promise<AdmOkrugsModel> {
    try {
      const result = await this.dbService.query<AdmOkrugsModel>(
        `UPDATE administrative_okrugs
                SET
                    code = $1,
                    updated_at = NOW()
                WHERE id = $2
                RETURNING id, code
                `,
        [dto.code, id],
      );

      const okrug = result.rows[0];

      if (!okrug)
        throw new NotFoundException(
          `Administrative okrug with id ${id} not found`,
        );

      return okrug;
    } catch (error: unknown) {
      if (error instanceof DatabaseError && error.code === '23505') {
        throw new ConflictException(`Adm okrug "${dto.code}" already exists`);
      }
      throw error;
    }
  }

  @Delete(':id')
  async deleteAdmOkrug(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<AdmOkrugsModel> {
    try {
      const result = await this.dbService.query<AdmOkrugsModel>(
        `DELETE FROM administrative_okrugs
              WHERE id = $1
              RETURNING id, code
              `,
        [id],
      );

      const okrug = result.rows[0];

      if (!okrug) {
        throw new NotFoundException(`Adm okrug with id = ${id} not found`);
      }

      return okrug;
    } catch (error: unknown) {
      if (error instanceof DatabaseError && error.code === '23503') {
        throw new ConflictException(
          `Administrative okrug with id ${id} cannot be deleted because it contains districts`,
        );
      }

      throw error;
    }
  }
}
