import { BadRequestException, Injectable } from "@nestjs/common";
import { Readable } from 'node:stream';
import ExcelJS from 'exceljs';
import { ImportRowError, NormalizedViolationRow, ParsedWorkbook, ParsedXlsxResult, RawViolationRow, ValidationResult } from './models';

export const EXPECTED_HEADERS = [
    'ID сообщения',
    'Номер заявки',
    'Дата публикации сообщения',
    'Округ',
    'Район',
    'Объект',
    'Категория объекта',
    'Проблемная тема',
    'Регламентный срок подготовки ответа',
    'Статус подготовки ответа',
] as const;

export const MAX_RETURNED_ERRORS = 100;

@Injectable()
export class XlsxParserService {
    async parseAndValidate(file: Express.Multer.File): Promise<NormalizedViolationRow[]> {
        const parsedWorkbook = await this.parseWorkbook(file);
        const validation = this.validateRows(parsedWorkbook.rows);

        if (validation.errors.length > 0) {
            throw new BadRequestException({
                message: 'XLSX contains invalid rows',
                totalErrors: validation.errors.length,
                shownErrors: Math.min(validation.errors.length, MAX_RETURNED_ERRORS),
                errors: validation.errors.slice(0, MAX_RETURNED_ERRORS),
            });
        }

        return validation.rows;
    }
    private async parseWorkbook(file: Express.Multer.File): Promise<ParsedWorkbook> {
        const workbook = new ExcelJS.Workbook();

        try {
            const fileStream = Readable.from([file.buffer]);
            await workbook.xlsx.read(fileStream);

        } catch {
            throw new BadRequestException('The uploaded file is not a valid XLSX file');
        }

        const worksheet = workbook.worksheets[0];

        if (!worksheet) {
            throw new BadRequestException('The XLSX file does not contain worksheets');
        }

        this.validateHeaders(worksheet);

        const rows: RawViolationRow[] = [];

        worksheet.eachRow(
            { includeEmpty: false },
            (row, rowNumber) => {
                if (rowNumber === 1) return;

                const values = EXPECTED_HEADERS.map((_, index) =>
                    row.getCell(index + 1).text.trim(),
                );

                const isEmptyRow = values.every((value) => value === '');

                if (isEmptyRow) return;

                rows.push({
                    row: rowNumber,
                    sourceMessageId: values[0],
                    applicationNumber: values[1],
                    publicationDate: values[2],
                    administrativeOkrug: this.toNullableString(values[3]),
                    district: this.toNullableString(values[4]),
                    objectName: values[5],
                    objectCategoryName: values[6],
                    problemTopicName: values[7],
                    responseDeadline: this.toNullableString(values[8]),
                    responseStatusName: values[9],
                });
            },
        );

        if (rows.length === 0) {
            throw new BadRequestException('The XLSX file does not contain data rows');
        }

        return { rows };
    }

    private validateHeaders(worksheet: ExcelJS.Worksheet): void {
        const headerRow = worksheet.getRow(1);

        const errors: ImportRowError[] = [];

        EXPECTED_HEADERS.forEach(
            (expectedHeader, index) => {
                const columnNumber = index + 1;

                const actualHeader = headerRow
                    .getCell(columnNumber)
                    .text
                    .trim();

                if (actualHeader !== expectedHeader) {
                    errors.push({
                        row: 1,
                        field: `column ${columnNumber}`,
                        message: `Ожидался заголовок ${expectedHeader}, получен "${actualHeader || 'пусто'}"`,
                    });
                }
            },
        );

        for (let columnNumber = EXPECTED_HEADERS.length + 1; columnNumber <= headerRow.cellCount; columnNumber += 1) {
            const extraHeader = headerRow
                .getCell(columnNumber)
                .text
                .trim();

            if (extraHeader !== '') {
                errors.push({
                    row: 1,
                    field: `column ${columnNumber}`,
                    message: `Неожиданная дополнительная колонка ${extraHeader}"`,
                });
            }
        }

        if (errors.length > 0) {
            throw new BadRequestException({
                message: 'Invalid XLSX headers',
                errors,
            });
        }
    }

    private validateRows(rawRows: RawViolationRow[]): ValidationResult {
        const normalizedRows: NormalizedViolationRow[] = [];

        const errors: ImportRowError[] = [];

        const sourceMessageRows = new Map<string, number>();

        const applicationNumberRows = new Map<string, number>();

        for (const rawRow of rawRows) {
            const rowErrors: ImportRowError[] = [];

            const sourceMessageId = this.normalizeText(rawRow.sourceMessageId);
            const applicationNumber = this.normalizeText(rawRow.applicationNumber);
            const publicationDateText = this.normalizeText(rawRow.publicationDate);
            const administrativeOkrug = this.normalizeNullableText(rawRow.administrativeOkrug);
            const district = this.normalizeNullableText(rawRow.district);
            const objectName = this.normalizeText(rawRow.objectName);
            const objectCategoryName = this.normalizeText(rawRow.objectCategoryName);
            const problemTopicName = this.normalizeText(rawRow.problemTopicName,);
            const responseDeadlineText = this.normalizeNullableText(rawRow.responseDeadline);
            const responseStatusName = this.normalizeText(rawRow.responseStatusName);

            if (!/^[1-9]\d*$/.test(sourceMessageId)) {
                rowErrors.push({
                    row: rawRow.row,
                    field: 'sourceMessageId',
                    message: 'ID сообщения должен быть положительным целым числом',
                });
            } else {
                const firstRow = sourceMessageRows.get(sourceMessageId);

                if (firstRow !== undefined) {
                    rowErrors.push({
                        row: rawRow.row,
                        field: 'sourceMessageId',
                        message: `ID сообщения уже встречался в строке ${firstRow}`,
                    });
                } else {
                    sourceMessageRows.set(sourceMessageId, rawRow.row);
                }
            }

            if (!/^[1-9]\d*$/.test(applicationNumber)) {
                rowErrors.push({
                    row: rawRow.row,
                    field: 'applicationNumber',
                    message: 'Номер заявки должен быть положительным целым числом',
                });
            } else {
                const firstRow = applicationNumberRows.get(applicationNumber);

                if (firstRow !== undefined) {
                    rowErrors.push({
                        row: rawRow.row,
                        field: 'applicationNumber',
                        message: `Номер заявки уже встречался в строке ${firstRow}`,
                    });
                } else {
                    applicationNumberRows.set(
                        applicationNumber,
                        rawRow.row,
                    );
                }
            }

            const publicationDate = this.normalizeDate(publicationDateText);

            if (publicationDate === null) {
                rowErrors.push({
                    row: rawRow.row,
                    field: 'publicationDate',
                    message: 'Дата публикации должна иметь формат ДД.ММ.ГГГГ и быть существующей датой',
                });
            }

            if (objectName === '') {
                rowErrors.push({
                    row: rawRow.row,
                    field: 'objectName',
                    message: 'Название объекта обязательно',
                });
            }

            if (objectCategoryName === '') {
                rowErrors.push({
                    row: rawRow.row,
                    field: 'objectCategoryName',
                    message: 'Категория объекта обязательна',
                });
            }

            if (problemTopicName === '') {
                rowErrors.push({
                    row: rawRow.row,
                    field: 'problemTopicName',
                    message: 'Проблемная тема обязательна',
                });
            }

            if (responseStatusName === '') {
                rowErrors.push({
                    row: rawRow.row,
                    field: 'responseStatusName',
                    message: 'Статус подготовки ответа обязателен',
                });
            }

            if (administrativeOkrug === null && district !== null) {
                rowErrors.push({
                    row: rawRow.row,
                    field: 'administrativeOkrug',
                    message: 'Округ обязателен, если указан район',
                });
            }

            if (administrativeOkrug !== null && district === null) {
                rowErrors.push({
                    row: rawRow.row,
                    field: 'district',
                    message: 'Район обязателен, если указан округ',
                });
            }

            const responseDeadline = responseDeadlineText === null ? null : this.normalizeDate(responseDeadlineText);

            if (responseDeadlineText !== null && responseDeadline === null) {
                rowErrors.push({
                    row: rawRow.row,
                    field: 'responseDeadline',
                    message: 'Срок ответа должен иметь формат ДД.ММ.ГГГГ и быть существующей датой',
                });
            }

            if (publicationDate !== null && responseDeadline !== null && responseDeadline < publicationDate) {
                rowErrors.push({
                    row: rawRow.row,
                    field: 'responseDeadline',
                    message: 'Срок ответа не может быть раньше даты публикации',
                });
            }

            errors.push(...rowErrors);

            if (rowErrors.length > 0 || publicationDate === null) {
                continue;
            }

            normalizedRows.push({
                row: rawRow.row,

                sourceMessageId,
                applicationNumber,
                publicationDate,

                administrativeOkrug,
                district,

                objectName,
                objectCategoryName,
                problemTopicName,

                responseDeadline,
                responseStatusName,
            });
        }

        return {
            rows: normalizedRows,
            errors,
        };
    }

    private normalizeText(value: string): string {
        return value.replace(/\s+/g, ' ').trim();
    }

    private normalizeNullableText(value: string | null): string | null {
        if (value === null) return null;

        const normalized = this.normalizeText(value);

        return normalized === '' ? null : normalized;
    }

    private normalizeDate(value: string): string | null {
        const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(value);

        if (!match) return null;


        const day = Number(match[1]);
        const month = Number(match[2]);
        const year = Number(match[3]);

        const date = new Date(0);

        date.setUTCHours(0, 0, 0, 0);

        date.setUTCFullYear(year, month - 1, day);

        const isValid =
            date.getUTCFullYear() === year &&
            date.getUTCMonth() === month - 1 &&
            date.getUTCDate() === day;

        if (!isValid) return null;

        const normalizedMonth = String(month).padStart(2, '0');
        const normalizedDay = String(day).padStart(2, '0');

        return (`${year}-` + `${normalizedMonth}-` + `${normalizedDay}`);
    }


    private toNullableString(value: string): string | null {
        return value === '' ? null : value;
    }
}
