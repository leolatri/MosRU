import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { DatabaseService } from "../database/service";
import { DatabaseError, QueryResultRow } from "pg";
import { ViolationDTO, ViolationQueryDTO } from "../dto/dtoModels";

export interface ViolationModel extends QueryResultRow {
    id: string;
    sourceMessageId: string;
    applicationNumber: string;
    publicationDate: string;
    districtId: number | null;
    objectName: string;
    objectCategoryId: number;
    problemTopicId: number;
    responseDeadline: string | null;
    responseStatusId: number;
}

export interface ViolationDetailsModel extends ViolationModel {
    districtName: string | null;
    administrativeOkrugId: number | null;
    administrativeOkrugName: string | null;
    objectCategoryName: string;
    problemTopicName: string;
    responseStatusName: string;
}

interface CountRow extends QueryResultRow {
    total: string;
};

export interface PaginatedViolations {
    items: ViolationModel[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    }
};


@Injectable()
export class ViolationsService {
    constructor(private readonly dbService: DatabaseService) { }

    async getAll(query: ViolationQueryDTO): Promise<PaginatedViolations> {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const offset = (page - 1) * limit;

        const search = query.search?.trim() || null;

        const filterValues: unknown[] = [
            query.districtId ?? null,
            query.objectCategoryId ?? null,
            query.problemTopicId ?? null,
            query.responseStatusId ?? null,
            search,
        ];

        const sortColumns: Record<string, string> = {
            id: 'v.id',
            applicationNumber: 'v.application_number',
            publicationDate: 'v.publication_date',
            responseDeadline: 'v.response_deadline',
        };

        const sortColumn = sortColumns[query.sortBy ?? 'id'] ?? 'v.id';
        const sortOrder = query.sortOrder === 'asc' ? 'ASC' : 'DESC';

        const whereSql = `
            WHERE
                ($1::integer IS NULL OR v.district_id = $1)
                AND ($2::integer IS NULL
                    OR v.object_category_id = $2
                )
                AND (
                    $3::integer IS NULL
                    OR v.problem_topic_id = $3
                )
                AND (
                    $4::integer IS NULL
                    OR v.response_status_id = $4
                )

                AND (
                    $5::text IS NULL
                    OR v.object_name ILIKE '%' || $5 || '%'
                    OR v.application_number::text
                        ILIKE '%' || $5 || '%'
                    OR v.source_message_id::text
                        ILIKE '%' || $5 || '%'
                )
            `;

        const countResult = await this.dbService.query<CountRow>(
            `
            SELECT COUNT(*) AS total
            FROM violations v
            ${whereSql}
            `, filterValues
        );

        const total = Number(countResult.rows[0].total);

        const dataValues: unknown[] = [
            ...filterValues,
            limit,
            offset,
        ];

        const result = await this.dbService.query<ViolationDetailsModel>(
            `
            SELECT
                v.id AS id,
                v.source_message_id AS "sourceMessageId",
                v.application_number AS "applicationNumber",
                v.publication_date AS "publicationDate",
                v.district_id AS "districtId",
                v.object_name AS "objectName",
                v.object_category_id AS "objectCategoryId",
                v.problem_topic_id AS "problemTopicId",
                v.response_deadline AS "responseDeadline",
                v.response_status_id AS "responseStatusId",
                d.name AS "districtName",
                ao.id AS "administrativeOkrugId",
                ao.name AS "administrativeOkrugName",
                oc.name AS "objectCategoryName",
                pt.name AS "problemTopicName",
                rs.name AS "responseStatusName"
            FROM violations v

            LEFT JOIN districts d
            ON d.id = v.district_id

            LEFT JOIN administrative_okrugs ao
            ON ao.id = d.okrug_id

            JOIN object_categories oc
            ON oc.id = v.object_category_id

            JOIN problem_topics pt
            ON pt.id = v.problem_topic_id

            JOIN response_statuses rs
            ON rs.id = v.response_status_id

            ${whereSql}

            ORDER BY
                ${sortColumn} ${sortOrder} NULLS LAST,
                v.id ASC

            LIMIT $6
            OFFSET $7
            `, dataValues
        );

        return {
            items: result.rows,

            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async getViolationById(id: number): Promise<ViolationDetailsModel> {
        const result =
            await this.dbService.query<ViolationDetailsModel>(
                `
                SELECT
                    v.id,
                    v.source_message_id AS "sourceMessageId",
                    v.application_number AS "applicationNumber",
                    v.publication_date AS "publicationDate",
                    v.district_id AS "districtId",
                    v.object_name AS "objectName",
                    v.object_category_id AS "objectCategoryId",
                    v.problem_topic_id AS "problemTopicId",
                    v.response_deadline AS "responseDeadline",
                    v.response_status_id AS "responseStatusId",

                    d.name AS "districtName",
                    ao.id AS "administrativeOkrugId",
                    ao.name AS "administrativeOkrugName",
                    oc.name AS "objectCategoryName",
                    pt.name AS "problemTopicName",
                    rs.name AS "responseStatusName"

                FROM violations v

                LEFT JOIN districts d
                ON d.id = v.district_id

                LEFT JOIN administrative_okrugs ao
                ON ao.id = d.okrug_id

                JOIN object_categories oc
                ON oc.id = v.object_category_id

                JOIN problem_topics pt
                ON pt.id = v.problem_topic_id

                JOIN response_statuses rs
                ON rs.id = v.response_status_id

                WHERE v.id = $1
            `, [id]
            );

        const violation = result.rows[0];

        if (!violation) {
            throw new NotFoundException(`Violation with id ${id} not found`);
        }
        return violation;
    }

    async createViolation(dto: ViolationDTO): Promise<ViolationModel> {
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
                        source_message_id AS "sourceMessageId",
                        application_number AS "applicationNumber",
                        publication_date AS "publicationDate",
                        district_id AS "districtId",
                        object_name AS "objectName",
                        object_category_id AS "objectCategoryId",
                        problem_topic_id AS "problemTopicId",
                        response_deadline AS "responseDeadline",
                        response_status_id AS "responseStatusId"
                    `,
                [
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
                    throw new ConflictException('Violation with this source message ID or application number already exists');
                }

                if (error.code === '23503') {
                    throw new BadRequestException('District, response status or category-topic relation does not exist');
                }

                if (error.code === '23514') {
                    throw new BadRequestException('Response deadline cannot be earlier than publication date');
                }
            }

            throw error;
        }

    };

    async updateViolation(dto: ViolationDTO, id: number): Promise<ViolationModel> {
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
                        source_message_id AS "sourceMessageId",
                        application_number AS "applicationNumber",
                        publication_date AS "publicationDate",
                        district_id AS "districtId",
                        object_name AS "objectName",
                        object_category_id AS "objectCategoryId",
                        problem_topic_id AS "problemTopicId",
                        response_deadline AS "responseDeadline",
                        response_status_id AS "responseStatusId"
                    `,
                [
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
            if (error instanceof DatabaseError && error.code === '23505') throw new ConflictException(`Violation already exist`);
            throw error;
        }

    };

    async deleteViolation(id: number): Promise<ViolationModel> {
        const result = await this.dbService.query<ViolationModel>(
            `DELETE FROM violations
            WHERE id = $1
            RETURNING 
                id,
                source_message_id AS "sourceMessageId",
                application_number AS "applicationNumber",
                publication_date AS "publicationDate",
                district_id AS "districtId",
                object_name AS "objectName",
                object_category_id AS "objectCategoryId",
                problem_topic_id AS "problemTopicId",
                response_deadline AS "responseDeadline",
                response_status_id AS "responseStatusId"
            `, [id]
        );

        const violation = result.rows[0];

        if (!violation) throw new NotFoundException(`Not found violation with id = ${id}`)

        return violation;
    };
}