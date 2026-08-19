import { Injectable } from '@nestjs/common';
import type { QueryResultRow } from 'pg';

import { DatabaseService } from '../database/service';
import { ViolationQueryDTO } from '../dto/dtoModels';
import { buildViolationQuery } from '../violations/queryBuilder';

interface TotalRow extends QueryResultRow {
    total: number;
}

export interface DashboardChartItem
    extends QueryResultRow {
    id: string;
    label: string;
    value: number;
}

export interface DashboardCategoryItem
    extends QueryResultRow {
    category: string;
    count: number;
}

export interface DashboardMonthItem
    extends QueryResultRow {
    month: string;
    count: number;
}

export interface DashboardResponse {
    summary: {total: number};
    byStatus: DashboardChartItem[];
    byCategory: DashboardCategoryItem[];
    byMonth: DashboardMonthItem[];
    districtCompleteness: DashboardChartItem[];
}

@Injectable()
export class DashboardService {
    constructor(private readonly databaseService: DatabaseService) { }

    async getDashboard(query: ViolationQueryDTO): Promise<DashboardResponse> {
        const queryParts = buildViolationQuery(query);

        const [
            totalResult,
            statusResult,
            categoryResult,
            monthResult,
            districtCompletenessResult,
        ] = await Promise.all([
            this.databaseService.query<TotalRow>(
                `
                SELECT COUNT(*)::integer AS total
                FROM violations v
                ${queryParts.whereSql}
                `, queryParts.values,
            ),

            this.databaseService.query<DashboardChartItem>(
                `
                SELECT
                    rs.id::text AS id,
                    rs.name AS label,
                    COUNT(*)::integer AS value
                FROM violations v
                JOIN response_statuses rs
                    ON rs.id = v.response_status_id
                ${queryParts.whereSql}
                GROUP BY
                    rs.id,
                    rs.name
                ORDER BY
                    value DESC,
                    rs.name ASC
                `, queryParts.values,
            ),

            this.databaseService.query<DashboardCategoryItem>(
                `
                SELECT
                    oc.name AS category,
                    COUNT(*)::integer AS count
                FROM violations v
                JOIN object_categories oc
                    ON oc.id = v.object_category_id
                ${queryParts.whereSql}
                GROUP BY
                    oc.id,
                    oc.name
                ORDER BY
                    count DESC,
                    oc.name ASC
                LIMIT 10
                `, queryParts.values
            ),

            this.databaseService.query<DashboardMonthItem>(
                `
                SELECT
                TO_CHAR(
                    DATE_TRUNC(
                        'month',
                        v.publication_date
                    ),
                    'YYYY-MM'
                ) AS month,
                COUNT(*)::integer AS count
                FROM violations v
                ${queryParts.whereSql}
                GROUP BY
                    DATE_TRUNC(
                        'month',
                        v.publication_date
                    )
                ORDER BY
                    DATE_TRUNC(
                        'month',
                        v.publication_date
                    ) ASC
             `,
                queryParts.values,
            ),

            this.databaseService.query<DashboardChartItem>(
                `
                SELECT
                    CASE
                    WHEN v.district_id IS NULL
                        THEN 'without-district'
                    ELSE 'with-district'
                    END AS id,

                    CASE
                    WHEN v.district_id IS NULL
                        THEN 'Район не указан'
                    ELSE 'Район указан'
                    END AS label,

                    COUNT(*)::integer AS value
                FROM violations v
                ${queryParts.whereSql}
                GROUP BY 1, 2
                ORDER BY value DESC
            `, queryParts.values
            ),
        ]);

        return {
            summary: {total: totalResult.rows[0]?.total ?? 0},
            byStatus: statusResult.rows,
            byCategory: categoryResult.rows,
            byMonth: monthResult.rows,
            districtCompleteness: districtCompletenessResult.rows,
        };
    }
}