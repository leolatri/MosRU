import type { ImportResult, ImportRowError, PaginatedViolations, ViolationsQuery } from "../models/models";

export const ACCESS_TOKEN_KEY = 'accessToken';

interface ApiErrorBody {
    message?: string | string[];
    error?: string;
    statusCode?: number;
    totalErrors?: number;
    shownErrors?: number;
    errors?: ImportRowError[];
}

export class ApiError extends Error {
    public status: number;
    public body: ApiErrorBody | null;

    constructor(
        status: number,
        body: ApiErrorBody | null,
        message: string,
    ) {
        super(message);
        this.name = 'ApiError';
        this.body = body;
        this.status = status;
    }
};

async function createApiError(responce: Response): Promise<ApiError> {
    const body = (await responce.json().catch(() => null) as ApiErrorBody | null);
    const responseMessage = body?.message;
    const message = Array.isArray(responseMessage) ? responseMessage.join('; ') : responseMessage ?? `Ошибка HTTP ${responce.status}`;

    return new ApiError(responce.status, body, message);
}

async function requestWithAuth(path: string, options: RequestInit = {}): Promise<Response> {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);

    if (!token) throw new ApiError(401, null, 'Пользователь не авторизирован');

    const headers = new Headers(options.headers);

    headers.set('Authorization', `Bearer {token}`);

    const response = await fetch(`/api${path}`, {
        ...options,
        headers,
    });

    if (!response.ok) throw createApiError(response);

    return response;
}

function createSearchParams(query: ViolationsQuery, includePagination = true): URLSearchParams {
    const serchParams = new URLSearchParams();

    for (const [key, value] of Object.entries(query)) {
        if ((!includePagination && (key === 'page' || key === 'limit')) || !value) continue;

        serchParams.set(key, String(value));
    }

    return serchParams;
}

export async function getViolations(
    query: ViolationsQuery,
    signal?: AbortSignal,
): Promise<PaginatedViolations> {
    const searchParams = createSearchParams(query);

    const response = await requestWithAuth(`/violations?${searchParams.toString()}`, { signal });

    return response.json() as Promise<PaginatedViolations>;
}

export async function importViolationsXlsx(file: File): Promise<ImportResult> {
    const formData = new FormData();

    formData.append('file', file);

    const response = await requestWithAuth('/imports/xlsx', {
        method: 'POST',
        body: formData,
    });

    return response.json() as Promise<ImportResult>;
}

export async function exportViolationsXlsx(query: ViolationsQuery): Promise<void> {
    const searchParams = createSearchParams(query, false);

    const response = await requestWithAuth(`/violations/export/xlsx?${searchParams.toString()}`);

    const fileBlob = await response.blob();
    const downloadUrl = URL.createObjectURL(fileBlob);

    const link = document.createElement('a');

    link.href = downloadUrl;
    link.download = 'violations.xlsx';

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(downloadUrl);
}