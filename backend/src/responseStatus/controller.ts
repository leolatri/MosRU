import { Body, ConflictException, Controller, Delete, Get, NotFoundException, Param, ParseIntPipe, Patch, Post } from "@nestjs/common";
import { DatabaseService } from "../database/service";
import { DatabaseError, QueryResultRow } from "pg";
import { ResponseStatusDTO } from "../dto/dtoModels";
import { ApiBearerAuth } from "@nestjs/swagger";

interface ResponseStatusModel extends QueryResultRow {
    id: number,
    name: string,
}

@ApiBearerAuth()
@Controller('response-statuses')
export class ResponseStatusController {
    constructor(private readonly dbService: DatabaseService) { }

    @Get()
    async getAll(): Promise<ResponseStatusModel[]> {
        const result = await this.dbService.query<ResponseStatusModel>(
            `SELECT id, name
            FROM response_statuses
            ORDER BY ID
            `
        );

        return result.rows;
    };

    @Get(':id')
    async getResStatusById(@Param('id', ParseIntPipe) id: number): Promise<ResponseStatusModel> {
        const result = await this.dbService.query<ResponseStatusModel>(
            `SELECT id, name
            FROM response_statuses
            WHERE id = $1
            `, [id]
        );

        const status = result.rows[0];

        if (!status) throw new NotFoundException(`Response status with id = ${id} not found`);

        return status;
    };

    @Post()
    async createRespStatus(@Body() dto: ResponseStatusDTO): Promise<ResponseStatusModel> {
        try {
            const result = await this.dbService.query<ResponseStatusModel>(
                `
                INSERT INTO response_statuses (name)
                VALUES ($1)
                RETURNING id, name
                `, [dto.name]
            );

            return result.rows[0];
        } catch (error: unknown) {
            if (error instanceof DatabaseError && error.code === '23505') {
                throw new ConflictException(`Response status "${dto.name}" already exists`);
            }
            throw error;
        }

    };

    @Patch(':id')
    async updateRespStatus(
        @Body() dto: ResponseStatusDTO,
        @Param('id', ParseIntPipe) id: number,
    ): Promise<ResponseStatusModel> {
        try {
            const result = await this.dbService.query<ResponseStatusModel>(
                `
                UPDATE response_statuses
                SET
                    name = $1,
                    updated_at = NOW()
                WHERE id = $2
                RETURNING id, name
                `, [dto.name, id]
            );

            const status = result.rows[0];

            if (!status) throw new NotFoundException(`Update resp ststus whith id = ${id} unavailable`);

            return status;

        } catch (error: unknown) {
            if (error instanceof DatabaseError && error.code === '23505') {
                throw new ConflictException(`Response status "${dto.name}" already exists`);
            }
            throw error;
        }

    };

    @Delete(':id')
    async deleteResponseStatus(@Param('id', ParseIntPipe) id: number): Promise<ResponseStatusModel> {
        const result = await this.dbService.query<ResponseStatusModel>(
            `DELETE FROM response_statuses
            WHERE id = $1
            RETURNING id, name
            `, [id]
        );

        const status = result.rows[0];

        if (!status) {
            throw new NotFoundException(
                `Problem status with id = ${id} not found`,
            );
        }

        return status;
    }
}
