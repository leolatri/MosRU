import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/service';
import { DatabaseError, QueryResultRow } from 'pg';
import { ViolationDTO, ViolationQueryDTO } from '../dto/dtoModels';
import { buildViolationQuery } from './queryBuilder';
import ExcelJS from 'exceljs';

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
  administrativeOkrugCode: string | null;
  objectCategoryName: string;
  problemTopicName: string;
  responseStatusName: string;
}

interface CountRow extends QueryResultRow {
  total: string;
}

export interface PaginatedViolations {
  items: ViolationDetailsModel[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

@Injectable()
export class ViolationsService {
  constructor(private readonly dbService: DatabaseService) {}

  async getAll(query: ViolationQueryDTO): Promise<PaginatedViolations> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const offset = (page - 1) * limit;

    const queryParts = buildViolationQuery(query);

    const countResult = await this.dbService.query<CountRow>(
      `
            SELECT COUNT(*) AS total
            FROM violations v
            ${queryParts.whereSql}
            `,
      queryParts.values,
    );

    const total = Number(countResult.rows[0].total);

    const dataValues: unknown[] = [...queryParts.values, limit, offset];

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
                ao.code AS "administrativeOkrugCode",
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

            ${queryParts.whereSql}

            ${queryParts.orderBySql}

            LIMIT $6
            OFFSET $7
            `,
      dataValues,
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

  async exportXlsx(query: ViolationQueryDTO): Promise<Buffer> {
    const queryParts = buildViolationQuery(query);

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
                ao.code AS "administrativeOkrugCode",
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

                ${queryParts.whereSql}

                ${queryParts.orderBySql}
            `,
      queryParts.values,
    );

    const workbook = new ExcelJS.Workbook();

    const worksheet = workbook.addWorksheet('Нарушения');

    worksheet.columns = [
      {
        header: 'ID сообщения',
        key: 'sourceMessageId',
        width: 20,
      },
      {
        header: 'Номер заявки',
        key: 'applicationNumber',
        width: 20,
      },
      {
        header: 'Дата публикации сообщения',
        key: 'publicationDate',
        width: 25,
      },
      {
        header: 'Округ',
        key: 'administrativeOkrugCode',
        width: 15,
      },
      {
        header: 'Район',
        key: 'districtName',
        width: 25,
      },
      {
        header: 'Объект',
        key: 'objectName',
        width: 45,
      },
      {
        header: 'Категория объекта',
        key: 'objectCategoryName',
        width: 35,
      },
      {
        header: 'Проблемная тема',
        key: 'problemTopicName',
        width: 40,
      },
      {
        header: 'Регламентный срок подготовки ответа',
        key: 'responseDeadline',
        width: 35,
      },
      {
        header: 'Статус подготовки ответа',
        key: 'responseStatusName',
        width: 30,
      },
    ];

    for (const violation of result.rows) {
      worksheet.addRow({
        sourceMessageId: violation.sourceMessageId,
        applicationNumber: violation.applicationNumber,
        publicationDate: violation.publicationDate,
        administrativeOkrugCode: violation.administrativeOkrugCode ?? '',
        districtName: violation.districtName ?? '',
        objectName: violation.objectName,
        objectCategoryName: violation.objectCategoryName,
        problemTopicName: violation.problemTopicName,
        responseDeadline: violation.responseDeadline ?? '',
        responseStatusName: violation.responseStatusName,
      });
    }

    worksheet.getRow(1).font = { bold: true };

    worksheet.views = [
      {
        state: 'frozen',
        ySplit: 1,
      },
    ];

    worksheet.autoFilter = {
      from: 'A1',
      to: 'J1',
    };

    const workbookBuffer = await workbook.xlsx.writeBuffer();

    return Buffer.from(workbookBuffer);
  }

  async getViolationById(id: number): Promise<ViolationDetailsModel> {
    const result = await this.dbService.query<ViolationDetailsModel>(
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
                    ao.code AS "administrativeOkrugCode",
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
            `,
      [id],
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
          dto.responseStatusId,
        ],
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
  }

  async updateViolation(
    dto: ViolationDTO,
    id: number,
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
          id,
        ],
      );

      const violation = result.rows[0];

      if (!violation)
        throw new NotFoundException(`Not found violation with id = ${id}`);

      return result.rows[0];
    } catch (error: unknown) {
      if (error instanceof DatabaseError && error.code === '23505')
        throw new ConflictException(`Violation already exist`);
      throw error;
    }
  }

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
            `,
      [id],
    );

    const violation = result.rows[0];

    if (!violation)
      throw new NotFoundException(`Not found violation with id = ${id}`);

    return violation;
  }
}
