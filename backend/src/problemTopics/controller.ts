import { Body, ConflictException, Controller, Delete, Get, NotFoundException, Param, ParseIntPipe, Patch, Post } from "@nestjs/common";
import { DatabaseError, QueryResultRow } from "pg";
import { DatabaseService } from "../database/service";
import { ProblemTopicDTO } from "../dto/dtoModels";

interface ProblemTopicModel extends QueryResultRow {
    id: number,
    name: string
}

@Controller('problem-topics')
export class ProblemTopicsController {
    constructor(private readonly dbService: DatabaseService) { }

    @Get()
    async getAll(): Promise<ProblemTopicModel[]> {
        const result = await this.dbService.query<ProblemTopicModel>(
            `SELECT id, name
            FROM problem_topics
            ORDER BY id
            `
        );

        return result.rows;
    };

    @Get(':id')
    async getProblemTopicById(@Param('id', ParseIntPipe) id: number): Promise<ProblemTopicModel> {
        const result = await this.dbService.query<ProblemTopicModel>(
            `SELECT id, name
            FROM problem_topics
            WHERE id = $1
            `, [id]
        );
        const topic = result.rows[0];

        if (!topic) throw new NotFoundException(`Not found problem topic by id = ${id}`);

        return topic;
    };

    @Post()
    async createProblemTopic(
        @Body() dto: ProblemTopicDTO,
    ): Promise<ProblemTopicModel> {
        try {
            const result = await this.dbService.query<ProblemTopicModel>(
                `INSERT INTO problem_topics (name)
                VALUES ($1)
                RETURNING id, name`, [dto.name]
            );

            return result.rows[0];
        } catch (error: unknown) {
            if (error instanceof DatabaseError && error.code === '23505') {
                throw new ConflictException(`Problem topic "${dto.name}" already exists`);
            }
            throw error;
        }
    }

    @Patch(':id')
    async updateProblemTopic(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: ProblemTopicDTO
    ): Promise<ProblemTopicModel> {
        const result = await this.dbService.query<ProblemTopicModel>(
            `UPDATE problem_topics
            SET
                name = $1,
                updated_at = NOW()
            WHERE id = $2
            RETURNING id, name
            `, [dto.name, id]
        );

        const topic = result.rows[0];

        if (!topic) throw new NotFoundException(`Cannot update problem topic whith id = ${id}`);

        return topic;
    }

    @Delete(':id')
    async deleteProblemTopic(@Param('id', ParseIntPipe) id: number): Promise<ProblemTopicModel> {
        const result = await this.dbService.query<ProblemTopicModel>(
            `DELETE FROM problem_topics
            WHERE id = $1
            RETURNING id, name
            `, [id]
        );

        const topic = result.rows[0];

        if (!topic) {
            throw new NotFoundException(
                `Problem topic with id = ${id} not found`,
            );
        }

        return topic;
    }
}