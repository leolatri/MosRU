import { Body, ConflictException, Controller, Delete, Get, NotFoundException, Param, ParseIntPipe, Patch, Post } from "@nestjs/common";
import { DatabaseError, QueryResultRow } from "pg";
import { DatabaseService } from "../database/service";
import { AdmOkrugsDTO } from "../dto/dtoModels";
import { ApiBearerAuth } from "@nestjs/swagger";

interface AdmOkrugsModel extends QueryResultRow {
    id: number,
    name: string,
    code: string,
}

@ApiBearerAuth()
@Controller('administrative-okrugs')
export class AdmOkrugsController {
    constructor(private readonly dbService: DatabaseService) { }

    @Get()
    async getAll(): Promise<AdmOkrugsModel[]> {
        const result = await this.dbService.query<AdmOkrugsModel>(
            `SELECT id, name, code
            FROM administrative_okrugs
            ORDER BY id
            `
        );

        return result.rows;
    };

    @Get(':id')
    async getAdmOkrugById(@Param('id', ParseIntPipe) id: number): Promise<AdmOkrugsModel> {
        const result = await this.dbService.query<AdmOkrugsModel>(
            `SELECT id, name, code
            FROM administrative_okrugs
            WHERE id = $1
            `, [id]
        );
        const okrug = result.rows[0];

        if (!okrug) throw new NotFoundException(`Not found adm okrug with id = ${id}`);

        return okrug;
    };

    @Post()
    async createAdmOkrug(
        @Body() dto: AdmOkrugsDTO,
    ): Promise<AdmOkrugsModel> {
        try {
            const result = await this.dbService.query<AdmOkrugsModel>(
                `INSERT INTO administrative_okrugs (name, code)
                VALUES ($1, $2)
                RETURNING id, name, code`, [dto.name, dto.code]
            );

            return result.rows[0];
        } catch (error: unknown) {
            if (error instanceof DatabaseError && error.code === '23505') {
                throw new ConflictException(`Adm okrug "${dto.name}" already exists`);
            }
            throw error;
        }
    }

    @Patch(':id')
    async updateAdmOkrug(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: AdmOkrugsDTO
    ): Promise<AdmOkrugsModel> {
        try {
            const result = await this.dbService.query<AdmOkrugsModel>(
                `UPDATE administrative_okrugs
                SET
                    name = $1,
                    code = $2,
                    updated_at = NOW()
                WHERE id = $3
                RETURNING id, name
                `, [dto.name, dto.code, id]
            );

            const okrug = result.rows[0];

            if (!okrug) throw new NotFoundException(`Cannot update adm okrug whith id = ${id}`);

            return okrug;
        } catch (error: unknown) {
            if (error instanceof DatabaseError && error.code === '23505') {
                throw new ConflictException(`Adm okrug"${dto.name}" already exists`);
            }
            throw error;
        }

    }

    @Delete(':id')
    async deleteAdmOkrug(@Param('id', ParseIntPipe) id: number): Promise<AdmOkrugsModel> {
        const result = await this.dbService.query<AdmOkrugsModel>(
            `DELETE FROM administrative_okrugs
            WHERE id = $1
            RETURNING id, name, code
            `, [id]
        );

        const okrug = result.rows[0];

        if (!okrug) {
            throw new NotFoundException(
                `Adm okrug with id = ${id} not found`,
            );
        }

        return okrug;
    }
}