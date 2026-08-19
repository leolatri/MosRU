import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { XlsxParserService } from './parser';
import { DatabaseService } from '../database/service';
import { ImportResult, NormalizedViolationRow } from './models';
import { DatabaseError, PoolClient, QueryResultRow } from 'pg';

interface IdRow extends QueryResultRow {
  id: number;
}

interface ExistingViolationRow extends QueryResultRow {
  sourceMessageId: string;
}

@Injectable()
export class ImportsService {
  constructor(
    private readonly parser: XlsxParserService,
    private readonly database: DatabaseService,
  ) {}
  private decodeFilename(filename: string): string {
    const decoded = Buffer.from(filename, 'latin1').toString('utf8');

    if (decoded.includes('\uFFFD')) {
      return filename;
    }

    return decoded;
  }

  private async getOrCreateObjectCategoryId(
    client: PoolClient,
    name: string,
    cache: Map<string, number>,
  ): Promise<number> {
    const cachedId = cache.get(name);

    if (cachedId !== undefined) return cachedId;

    const result = await client.query<IdRow>(
      `
            INSERT INTO object_categories (name)
            VALUES ($1)
            ON CONFLICT (name)
            DO UPDATE SET name = EXCLUDED.name
            RETURNING id
            `,
      [name],
    );

    const categoryId = result.rows[0].id;

    cache.set(name, categoryId);

    return categoryId;
  }

  private async getOrCreateProblemTopicId(
    client: PoolClient,
    name: string,
    cache: Map<string, number>,
  ): Promise<number> {
    const cachedId = cache.get(name);

    if (cachedId !== undefined) return cachedId;

    const result = await client.query<IdRow>(
      `
            INSERT INTO problem_topics (name)
            VALUES ($1)
            ON CONFLICT (name)
            DO UPDATE SET name = EXCLUDED.name
            RETURNING id
            `,
      [name],
    );

    const problemTopicsId = result.rows[0].id;

    cache.set(name, problemTopicsId);

    return problemTopicsId;
  }

  private async getOrCreateResponseStatusId(
    client: PoolClient,
    name: string,
    cache: Map<string, number>,
  ): Promise<number> {
    const cachedId = cache.get(name);

    if (cachedId !== undefined) return cachedId;

    const result = await client.query<IdRow>(
      `
            INSERT INTO response_statuses (name)
            VALUES ($1)
            ON CONFLICT (name)
            DO UPDATE SET name = EXCLUDED.name
            RETURNING id
            `,
      [name],
    );

    const respStatusId = result.rows[0].id;

    cache.set(name, respStatusId);

    return respStatusId;
  }

  private async getOrCreateAdministrativeOkrugId(
    client: PoolClient,
    code: string,
    cache: Map<string, number>,
  ): Promise<number> {
    const cachedId = cache.get(code);

    if (cachedId !== undefined) {
      return cachedId;
    }

    const result = await client.query<IdRow>(
      `
            INSERT INTO administrative_okrugs (code)
            VALUES ($1)
            ON CONFLICT (code)
            DO UPDATE SET code = EXCLUDED.code
            RETURNING id
        `,
      [code],
    );

    const okrugId = result.rows[0].id;

    cache.set(code, okrugId);

    return okrugId;
  }

  private async getOrCreateDistrictId(
    client: PoolClient,
    name: string,
    okrugId: number,
    cache: Map<string, number>,
  ): Promise<number> {
    const cacheKey = `${okrugId}:${name}`;
    const cachedId = cache.get(cacheKey);

    if (cachedId !== undefined) return cachedId;

    const result = await client.query<IdRow>(
      `
            INSERT INTO districts (okrug_id, name)
            VALUES ($1, $2)
            ON CONFLICT (okrug_id, name)
            DO UPDATE SET
                name = EXCLUDED.name
            RETURNING id
            `,
      [okrugId, name],
    );

    const districtId = result.rows[0].id;

    cache.set(cacheKey, districtId);

    return districtId;
  }

  private async upsertCategoryProblemTopic(
    client: PoolClient,
    objectCategoryId: number,
    problemTopicId: number,
    cache: Set<string>,
  ): Promise<void> {
    const cacheKey = `${objectCategoryId}:${problemTopicId}`;

    if (cache.has(cacheKey)) return;

    await client.query(
      `
            INSERT INTO category_problem_topics (object_category_id, problem_topic_id)
            VALUES ($1, $2)
            ON CONFLICT (object_category_id, problem_topic_id)
            DO NOTHING
            `,
      [objectCategoryId, problemTopicId],
    );

    cache.add(cacheKey);
  }
  private async upsertViolation(
    client: PoolClient,
    row: NormalizedViolationRow,
    districtId: number | null,
    objectCategoryId: number,
    problemTopicId: number,
    responseStatusId: number,
  ): Promise<void> {
    await client.query(
      `
        INSERT INTO violations (
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
        VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9
        )
        ON CONFLICT (source_message_id)
        DO UPDATE SET
            application_number = EXCLUDED.application_number,
            publication_date = EXCLUDED.publication_date,
            district_id = EXCLUDED.district_id,
            object_name = EXCLUDED.object_name,
            object_category_id = EXCLUDED.object_category_id,
            problem_topic_id = EXCLUDED.problem_topic_id,
            response_deadline = EXCLUDED.response_deadline,
            response_status_id = EXCLUDED.response_status_id,
            updated_at = current_timestamp
        `,
      [
        row.sourceMessageId,
        row.applicationNumber,
        row.publicationDate,
        districtId,
        row.objectName,
        objectCategoryId,
        problemTopicId,
        row.responseDeadline,
        responseStatusId,
      ],
    );
  }

  async importFile(file: Express.Multer.File): Promise<ImportResult> {
    const filename = this.decodeFilename(file.originalname);
    const rows = await this.parser.parseAndValidate(file);

    try {
      return await this.database.withTransaction(async (client) => {
        let created = 0;
        let updated = 0;

        const objectCategoryIds = new Map<string, number>();
        const problemTopicIds = new Map<string, number>();
        const responseStatusIds = new Map<string, number>();
        const administrativeOkrugIds = new Map<string, number>();
        const districtIds = new Map<string, number>();

        const categoryProblemTopics = new Set<string>();

        const sourceMessageIds = rows.map((row) => row.sourceMessageId);

        const existingResult = await client.query<ExistingViolationRow>(
          `
                SELECT source_message_id AS "sourceMessageId"
                FROM violations
                WHERE source_message_id = ANY($1::bigint[])
                `,
          [sourceMessageIds],
        );

        const existingSourceMessageIds = new Set(
          existingResult.rows.map((row) => row.sourceMessageId),
        );

        for (const row of rows) {
          const objectCategoryId = await this.getOrCreateObjectCategoryId(
            client,
            row.objectCategoryName,
            objectCategoryIds,
          );
          const problemTopicId = await this.getOrCreateProblemTopicId(
            client,
            row.problemTopicName,
            problemTopicIds,
          );

          await this.upsertCategoryProblemTopic(
            client,
            objectCategoryId,
            problemTopicId,
            categoryProblemTopics,
          );

          const responseStatusId = await this.getOrCreateResponseStatusId(
            client,
            row.responseStatusName,
            responseStatusIds,
          );

          let districtId: number | null = null;

          if (row.administrativeOkrug !== null && row.district !== null) {
            const okrugCode = row.administrativeOkrug;

            const okrugId = await this.getOrCreateAdministrativeOkrugId(
              client,
              okrugCode,
              administrativeOkrugIds,
            );

            districtId = await this.getOrCreateDistrictId(
              client,
              row.district,
              okrugId,
              districtIds,
            );
          }

          const wasExisting = existingSourceMessageIds.has(row.sourceMessageId);

          await this.upsertViolation(
            client,
            row,
            districtId,
            objectCategoryId,
            problemTopicId,
            responseStatusId,
          );

          if (wasExisting) {
            updated += 1;
          } else {
            created += 1;
            existingSourceMessageIds.add(row.sourceMessageId);
          }
        }

        return {
          filename,
          total: rows.length,
          created,
          updated,
          message: 'XLSX import completed successfully',
        };
      });
    } catch (error: unknown) {
      if (error instanceof DatabaseError) {
        if (error.code === '23505') {
          throw new ConflictException(
            'XLSX data conflicts with an existing source message ID or application number',
          );
        }

        if (error.code === '23503' || error.code === '23514') {
          throw new BadRequestException(
            'XLSX data violates database relations or constraints',
          );
        }
      }

      throw error;
    }
  }
}
