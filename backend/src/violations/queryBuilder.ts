import { ViolationQueryDTO } from '../dto/dtoModels';

export interface ViolationQueryParts {
  whereSql: string;
  values: unknown[];
  orderBySql: string;
}

const SORT_COLUMNS: Readonly<Record<string, string>> = {
  id: 'v.id',
  applicationNumber: 'v.application_number',
  publicationDate: 'v.publication_date',
  responseDeadline: 'v.response_deadline',
};

export function buildViolationQuery(
  query: ViolationQueryDTO,
): ViolationQueryParts {
  const search = query.search?.trim() || null;

  const values: unknown[] = [
    query.districtId ?? null,
    query.objectCategoryId ?? null,
    query.problemTopicId ?? null,
    query.responseStatusId ?? null,
    search,
  ];

  const sortColumn = SORT_COLUMNS[query.sortBy ?? 'id'] ?? 'v.id';

  const sortOrder = query.sortOrder === 'asc' ? 'ASC' : 'DESC';

  const whereSql = `
    WHERE
      ($1::integer IS NULL OR v.district_id = $1)

      AND (
        $2::integer IS NULL
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

  const orderBySql = `
    ORDER BY
      ${sortColumn} ${sortOrder} NULLS LAST,
      v.id ASC
  `;

  return {
    whereSql,
    values,
    orderBySql,
  };
}
