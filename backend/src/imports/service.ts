import { BadRequestException, Injectable } from "@nestjs/common";
import { Readable } from 'node:stream';
import ExcelJS from 'exceljs';

export interface RawViolationRow {
    row: number;

    sourceMessageId: string;
    applicationNumber: string;
    publicationDate: string;

    administrativeOkrug: string | null;
    district: string | null;

    objectName: string;
    objectCategoryName: string;
    problemTopicName: string;

    responseDeadline: string | null;
    responseStatusName: string;
}

export interface HeaderError {
    row: number;
    field: string;
    message: string;
}

export interface ParsedXlsxResult {
    filename: string;
    mimeType: string;
    size: number;
    headers: readonly string[];
    totalRows: number;
    preview: RawViolationRow[];
    message: string;
}

interface ParsedWorkbook {
    rows: RawViolationRow[];
}

const EXPECTED_HEADERS = [
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

@Injectable()
export class ImportsService {
    private decodeFilename(filename: string): string {
        const decoded = Buffer.from(filename, 'latin1').toString('utf8');

        if (decoded.includes('\uFFFD')) return filename;

        return decoded;
    }

    private toNullableString(value: string): string | null {
        return value === '' ? null : value;
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
                if (rowNumber === 1) {
                    return;
                }
                const values = EXPECTED_HEADERS.map((_, index) => row.getCell(index + 1).text.trim());

                const isEmptyRow = values.every(
                    (value) => value === '',
                );

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

        const actualHeaders = EXPECTED_HEADERS.map((_, index) => headerRow.getCell(index + 1).text.trim());

        const errors: HeaderError[] = [];

        EXPECTED_HEADERS.forEach((expectedHeader, index) => {
            const actualHeader = actualHeaders[index];

            if (actualHeader !== expectedHeader) {
                errors.push({
                    row: 1,
                    field: `column ${index + 1}`,
                    message:
                        `Expected "${expectedHeader}", ` +
                        `received "${actualHeader || 'empty'}"`,
                });
            }
        },
        );

        if (errors.length > 0) {
            throw new BadRequestException({
                message: 'Invalid XLSX headers',
                errors,
            });
        }
    }

    async inspectFile(file: Express.Multer.File): Promise<ParsedXlsxResult> {
        const filename = this.decodeFilename(file.originalname);
        const parsedFile = await this.parseWorkbook(file);
        return {
            filename: filename,
            mimeType: file.mimetype,
            size: file.size,
            headers: EXPECTED_HEADERS,
            totalRows: parsedFile.rows.length,
            preview: parsedFile.rows.slice(0, 5),
            message: 'XLSX file parsed successfully',
        }
    }
};