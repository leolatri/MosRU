import { BadRequestException, Body, ConflictException, Controller, Delete, Get, NotFoundException, Param, ParseIntPipe, Patch, Post } from "@nestjs/common";
import { DatabaseService } from "../database/service";
import { DatabaseError, QueryResultRow } from "pg";
import { ViolationDTO } from "../dto/dtoModels";

interface ViolationModel extends QueryResultRow {
    id: string,
    sourceMessageId: string,
    applicationNumber: string,
    publicationDate: string,
    districtId: number | null,
    objectName: string,
    objectCategoryId: number,
    problemTopicId: number,
    responseDeadline: string | null,
    responseStatusId: number,
}

@Controller('violations')
export class ViolationsController {
    constructor(private readonly dbService: DatabaseService) { }

    @Get()
    async getAll(): Promise<ViolationModel[]> {
        const result = await this.dbService.query<ViolationModel>(
            `SELECT 
                id,
                source_message_id AS sourceMessageId,
                application_number AS applicationNumber,
                publication_date AS publicationDate,
                district_id AS districtId,
                object_name AS objectName,
                object_category_id AS objectCategoryId,
                problem_topic_id AS problemTopicId,
                response_deadline AS responseDeadline,
                response_status_id AS responseStatusId
            FROM violations
            ORDER BY id
            `
        );

        return result.rows;
    };

    @Get(':id')
    async getViolationById(@Param('id', ParseIntPipe) id: number): Promise<ViolationModel> {
        const result = await this.dbService.query<ViolationModel>(
            `SELECT 
                id,
                source_message_id AS sourceMessageId,
                application_number AS applicationNumber,
                publication_date AS publicationDate,
                district_id AS districtId,
                object_name AS objectName,
                object_category_id AS objectCategoryId,
                problem_topic_id AS problemTopicId,
                response_deadline AS responseDeadline,
                response_status_id AS responseStatusId
            FROM violations
            WHERE id = $1
            `, [id]
        );

        const violation = result.rows[0];

        if (!violation) throw new NotFoundException(`Not found violation with id = ${id}`)

        return violation;
    };

    @Post()
    async createViolation(
        @Body() dto: ViolationDTO
    ): Promise<ViolationModel> {
        try {
            const result = await this.dbService.query<ViolationModel>(
                `INSERT INTO violations (
                    source_message_id,
                    application_number,
                    publication_date,
                    district_id,
                    object_name,
                    object_category_id,
                    problem_topic_id,
                    response_deadline,
                    response_status_id
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                RETURNING 
                    id,
                    source_message_id AS sourceMessageId,
                    application_number AS applicationNumber,
                    publication_date AS publicationDate,
                    district_id AS districtId,
                    object_name AS objectName,
                    object_category_id AS objectCategoryId,
                    problem_topic_id AS problemTopicId,
                    response_deadline AS responseDeadline,
                    response_status_id AS responseStatusId
                `, [
                dto.sourceMessageId,
                dto.applicationNumber,
                dto.publicationDate,
                dto.districtId,
                dto.objectName,
                dto.objectCategoryId,
                dto.problemTopicId,
                dto.responseDeadline,
                dto.responseStatusId
            ]
            );

            return result.rows[0];
        } catch (error: unknown) {
            if (error instanceof DatabaseError) {
                if (error.code === '23505') {
                    throw new ConflictException(
                        'Violation with this source message ID or application number already exists',
                    );
                }

                if (error.code === '23503') {
                    throw new BadRequestException(
                        'District, response status or category-topic relation does not exist',
                    );
                }

                if (error.code === '23514') {
                    throw new BadRequestException(
                        'Response deadline cannot be earlier than publication date',
                    );
                }
            }

            throw error;
        }

    };

    @Patch()
    async updateiolation(
        @Body() dto: ViolationDTO,
        @Param('id', ParseIntPipe) id: number
    ): Promise<ViolationModel> {
        try {
            const result = await this.dbService.query<ViolationModel>(
                `UPDATE violations 
                    SET 
                        source_message_id = $1,
                        application_number = $2,
                        publication_date = $3,
                        district_id = $4,
                        object_name = $5,
                        object_category_id = $6,
                        problem_topic_id = $7,
                        response_deadline = $8,
                        response_status_id = $9,
                        updated_at = current_timestamp
                    WHERE id = $10
                    RETURNING 
                        id,
                        source_message_id AS sourceMessageId,
                        application_number AS applicationNumber,
                        publication_date AS publicationDate,
                        district_id AS districtId,
                        object_name AS objectName,
                        object_category_id AS objectCategoryId,
                        problem_topic_id AS problemTopicId,
                        response_deadline AS responseDeadline,
                        response_status_id AS responseStatusId
                    `, [
                dto.sourceMessageId,
                dto.applicationNumber,
                dto.publicationDate,
                dto.districtId,
                dto.objectName,
                dto.objectCategoryId,
                dto.problemTopicId,
                dto.responseDeadline,
                dto.responseStatusId,
                id
            ]
            );

            const violation = result.rows[0];

            if (!violation) throw new NotFoundException(`Not found violation with id = ${id}`)

            return result.rows[0];
        } catch (error: unknown) {
            if (error instanceof DatabaseError && error.code === '23505') throw new ConflictException(`Violation alrady exist`);
            throw error;
        }

    };


    @Delete(':id')
    async deleteViolation(@Param('id', ParseIntPipe) id: number): Promise<ViolationModel> {
        const result = await this.dbService.query<ViolationModel>(
            `DELETE FROM violations
            WHERE id = $1
            RETURNING 
                id,
                source_message_id AS sourceMessageId,
                application_number AS applicationNumber,
                publication_date AS publicationDate,
                district_id AS districtId,
                object_name AS objectName,
                object_category_id AS objectCategoryId,
                problem_topic_id AS problemTopicId,
                response_deadline AS responseDeadline,
                response_status_id AS responseStatusId,
            `, [id]
        );

        const violation = result.rows[0];

        if (!violation) throw new NotFoundException(`Not found violation with id = ${id}`)

        return violation;
    };
}