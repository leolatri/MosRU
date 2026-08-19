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
import { ObjCategoriesDTO } from '../dto/dtoModels';
import { ApiBearerAuth } from '@nestjs/swagger';

interface ObjCategoriesModel extends QueryResultRow {
  id: number;
  name: string;
}

@ApiBearerAuth()
@Controller('object-categories')
export class ObjCategoriesController {
  constructor(private readonly dbService: DatabaseService) {}

  @Get()
  async getAll(): Promise<ObjCategoriesModel[]> {
    const result = await this.dbService.query<ObjCategoriesModel>(
      `SELECT id, name
            FROM object_categories
            ORDER BY id
            `,
    );

    return result.rows;
  }

  @Get(':id')
  async getObjectCategoriesById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ObjCategoriesModel> {
    const result = await this.dbService.query<ObjCategoriesModel>(
      `SELECT id, name
            FROM object_categories
            WHERE id = $1
            `,
      [id],
    );
    const object = result.rows[0];

    if (!object)
      throw new NotFoundException(`Not found object category with id = ${id}`);

    return object;
  }

  @Post()
  async createObjectCategories(
    @Body() dto: ObjCategoriesDTO,
  ): Promise<ObjCategoriesModel> {
    try {
      const result = await this.dbService.query<ObjCategoriesModel>(
        `INSERT INTO object_categories (name)
                VALUES ($1)
                RETURNING id, name`,
        [dto.name],
      );

      return result.rows[0];
    } catch (error: unknown) {
      if (error instanceof DatabaseError && error.code === '23505') {
        throw new ConflictException(
          `Object category "${dto.name}" already exists`,
        );
      }
      throw error;
    }
  }

  @Patch(':id')
  async updateObjectCategories(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ObjCategoriesDTO,
  ): Promise<ObjCategoriesModel> {
    try {
      const result = await this.dbService.query<ObjCategoriesModel>(
        `UPDATE object_categories
                SET
                    name = $1,
                    updated_at = NOW()
                WHERE id = $2
                RETURNING id, name
                `,
        [dto.name, id],
      );

      const object = result.rows[0];

      if (!object)
        throw new NotFoundException(`Object category with id ${id} not found`);

      return object;
    } catch (error: unknown) {
      if (error instanceof DatabaseError && error.code === '23505') {
        throw new ConflictException(
          `Object category "${dto.name}" already exists`,
        );
      }
      throw error;
    }
  }

  @Delete(':id')
  async deleteObjectCategories(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ObjCategoriesModel> {
    try {
      const result = await this.dbService.query<ObjCategoriesModel>(
        `DELETE FROM object_categories
              WHERE id = $1
              RETURNING id, name
              `,
        [id],
      );

      const object = result.rows[0];

      if (!object) {
        throw new NotFoundException(
          `Object category with id = ${id} not found`,
        );
      }

      return object;
    } catch (error: unknown) {
      if (error instanceof DatabaseError && error.code === '23503') {
        throw new ConflictException(
          `Object category with id ${id} cannot be deleted because it is used by problem topics or violations`,
        );
      }

      throw error;
    }
  }
}
