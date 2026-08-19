import type { Rule } from "antd/es/form";
import type { valueType } from "antd/es/statistic/utils";

export interface FieldProps {
    name: keyof AuthModel,
    label: string,
    placeholder: string,
    rules?: Rule[];
    value?: valueType;
    private: boolean;
}

export type ViolationSortBy =
    | 'id'
    | 'applicationNumber'
    | 'publicationDate'
    | 'responseDeadline';

export type SortOrder = 'asc' | 'desc';

export interface ViolationModel {
    id: number;
    sourceMessageId: string;
    applicationNumber: string;
    publicationDate: string;
    responseDeadline: string | null;
    districtId: number | null;
    districtName: string | null;
    administrativeOkrugId: number | null;
    administrativeOkrugCode: string | null;
    objectName: string;
    objectCategoryId: number;
    objectCategoryName: string;
    problemTopicId: number;
    problemTopicName: string;
    responseStatusId: number;
    responseStatusName: string;
}

export interface ViolationsQuery {
    page?: number;
    limit?: number;
    sortBy?: ViolationSortBy;
    sortOrder?: SortOrder;
    districtId?: number;
    objectCategoryId?: number;
    problemTopicId?: number;
    responseStatusId?: number;
    search?: string;
}

export interface ViolationsMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface PaginatedViolations {
    items: ViolationModel[];
    meta: ViolationsMeta;
}

export interface ImportResult {
    filename: string;
    total: number;
    created: number;
    updated: number;
    message: string;
}

export interface ImportRowError {
    row: number;
    field: string;
    message: string;
}

export interface AuthModel {
    email: string;
    password: string;
}

export interface LoginResponce {
    accessToken: string;
}

export interface RegistrationResponse {
    id: string;
    email: string;
}