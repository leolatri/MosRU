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
import { DatabaseService } from '../database/service';
import { DistrictsDTO } from '../dto/dtoModels';
import { DatabaseError, QueryResultRow } from 'pg';
import { ApiBearerAuth } from '@nestjs/swagger';

interface DistrictModel extends QueryResultRow {
  id: number;
  okrugId: number;
  name: string;
}

@ApiBearerAuth()
@Controller('districts')
export class DistrictsController {
  constructor(private readonly dbService: DatabaseService) {}

  @Get()
  async getAll(): Promise<DistrictModel[]> {
    const result = await this.dbService.query<DistrictModel>(
      `SELECT id, okrug_id AS okrugId, name
            FROM districts
            ORDER BY id
            `,
    );

    return result.rows;
  }

  @Get(':id')
  async getDistrictById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<DistrictModel> {
    const result = await this.dbService.query<DistrictModel>(
      `SELECT id, okrug_id AS okrugId, name
            FROM districts
            WHERE id = $1
            `,
      [id],
    );

    const district = result.rows[0];

    if (!district)
      throw new NotFoundException(`Not found district with id = ${id}`);

    return district;
  }

  @Post()
  async createDistrict(@Body() dto: DistrictsDTO): Promise<DistrictModel> {
    try {
      const result = await this.dbService.query<DistrictModel>(
        `INSERT INTO districts (name, okrug_id)
                VALUES ($1, $2)
                RETURNING id, okrug_id, name
                `,
        [dto.name, dto.okrugId],
      );

      return result.rows[0];
    } catch (error: unknown) {
      if (error instanceof DatabaseError && error.code === '23505')
        throw new ConflictException(
          `District with name = ${dto.name} is alrady exist`,
        );
      throw error;
    }
  }

  @Patch(':id')
  async updateDistrict(
    @Body() dto: DistrictsDTO,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<DistrictModel> {
    try {
      const result = await this.dbService.query<DistrictModel>(
        `UPDATE districts
                SET
                    name = $1,
                    okrug_id = $2,
                    updated_at = NOW()
                WHERE id = $3
                RETURNING id, okrug_id AS okrugId, name
                `,
        [dto.name, dto.okrugId, id],
      );

      const district = result.rows[0];

      if (!district)
        throw new NotFoundException(`Not found district with id = ${id}`);

      return result.rows[0];
    } catch (error: unknown) {
      if (error instanceof DatabaseError && error.code === '23505')
        throw new ConflictException(
          `District with name = ${dto.name} is alrady exist`,
        );
      throw error;
    }
  }

  @Delete(':id')
  async deleteDistrict(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<DistrictModel> {
    const result = await this.dbService.query<DistrictModel>(
      `DELETE FROM districts
            WHERE id = $1
            RETURNING id, okrug_id AS okrugId, name
            `,
      [id],
    );

    const district = result.rows[0];

    if (!district)
      throw new NotFoundException(`District with id = ${id} not found`);

    return district;
  }
}
