import { BadRequestException, Body, ConflictException, Controller, Delete, Get, NotFoundException, Param, ParseIntPipe, Patch, Post } from "@nestjs/common";
import { DatabaseError, QueryResultRow } from "pg";
import { DatabaseService } from "../database/service";
import { CategoryProblemTopicDTO } from "../dto/dtoModels";
import { ApiBearerAuth } from "@nestjs/swagger";

interface CategoryProblemTopicModel extends QueryResultRow {
    objectCategoryId: number,
    problemTopicId: number,
}

@ApiBearerAuth()
@Controller('category-problem-topics')
export class CategoryProblemTopicController {
    constructor(private readonly dbService: DatabaseService) { }

    @Get()
    async getAll(): Promise<CategoryProblemTopicModel[]> {
        const result = await this.dbService.query<CategoryProblemTopicModel>(
            `SELECT 
                object_category_id AS "objectCategoryId",
                problem_topic_id AS "problemTopicId"
            FROM category_problem_topics
            ORDER BY object_category_id, problem_topic_id
            `
        );

        return result.rows;
    };

    @Get('category/:objectCategoryId')
    async getByCategoryId(
        @Param('objectCategoryId', ParseIntPipe) objectCategoryId: number,
    ): Promise<CategoryProblemTopicModel[]> {
        const result =
            await this.dbService.query<CategoryProblemTopicModel>(
                `SELECT
                    object_category_id AS "objectCategoryId",
                    problem_topic_id AS "problemTopicId"
                FROM category_problem_topics
                WHERE object_category_id = $1
                ORDER BY problem_topic_id
                `, [objectCategoryId]
            );

        return result.rows;
    };

    @Get('topic/:problemTopicId')
    async getByProblemId(
        @Param('problemTopicId', ParseIntPipe) problemTopicId: number,
    ): Promise<CategoryProblemTopicModel[]> {
        const result =
            await this.dbService.query<CategoryProblemTopicModel>(
                `SELECT
                    object_category_id AS "objectCategoryId",
                    problem_topic_id AS "problemTopicId"
                FROM category_problem_topics
                WHERE problem_topic_id = $1
                ORDER BY object_category_id
                `, [problemTopicId]
            );

        return result.rows;
    };

    @Get(':objectCategoryId/:problemTopicId')
    async getCategoryProblemTopic(
        @Param('objectCategoryId', ParseIntPipe) objectCategoryId: number,
        @Param('problemTopicId', ParseIntPipe) problemTopicId: number,
    ): Promise<CategoryProblemTopicModel> {
        const result = await this.dbService.query<CategoryProblemTopicModel>(
            `SELECT
                object_category_id AS "objectCategoryId",
                problem_topic_id AS "problemTopicId"
            FROM category_problem_topics
            WHERE object_category_id = $1
            AND problem_topic_id = $2
            `, [objectCategoryId, problemTopicId]
        );

        const relation = result.rows[0];

        if (!relation) throw new NotFoundException(`Relation between object category ${objectCategoryId} and problem topic ${problemTopicId} not found`);

        return relation;
    };

    @Post()
    async createCategoryProblemTopic(@Body() dto: CategoryProblemTopicDTO): Promise<CategoryProblemTopicModel> {
        try {
            const result = await this.dbService.query<CategoryProblemTopicModel>(
                `INSERT INTO category_problem_topics (object_category_id, problem_topic_id)
                VALUES ($1, $2)
                RETURNING object_category_id AS "objectCategoryId", problem_topic_id AS "problemTopicId"
                `, [dto.objectCategoryId, dto.problemTopicId]
            );

            return result.rows[0];
        } catch (error: unknown) {
            if (error instanceof DatabaseError && error.code === '23505') {
                throw new ConflictException(`This category and problem topic are already connected`);
            }
            if (error instanceof DatabaseError && error.code === '23503') {
                throw new BadRequestException(
                    'Object category or problem topic does not exist',
                );
            }
            throw error;
        }
    }

    @Delete(':objectCategoryId/:problemTopicId')
    async deleteCategoryProblemTopic(
        @Param('objectCategoryId', ParseIntPipe) objectCategoryId: number,
        @Param('problemTopicId', ParseIntPipe) problemTopicId: number,
    ): Promise<CategoryProblemTopicModel> {
        try {
            const result = await this.dbService.query<CategoryProblemTopicModel>(
                `DELETE FROM category_problem_topics
                WHERE object_category_id = $1 AND problem_topic_id = $2
                RETURNING 
                    object_category_id AS "objectCategoryId",
                    problem_topic_id AS "problemTopicId"
                `, [objectCategoryId, problemTopicId]
            );

            const relation = result.rows[0];

            if (!relation) throw new NotFoundException(`Relation between object category ${objectCategoryId} and problem topic ${problemTopicId} not found`);

            return relation;
        } catch (error: unknown) {
            if (error instanceof DatabaseError && error.code === '23503') {
                throw new BadRequestException(
                    'Object category or problem topic does not exist',
                );
            }
            throw error;
        };
    }
}