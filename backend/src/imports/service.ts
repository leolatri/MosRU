import { BadRequestException, Injectable } from '@nestjs/common';
import { EXPECTED_HEADERS, MAX_RETURNED_ERRORS, XlsxParserService } from './parser';
import { DatabaseService } from '../database/service';
import { ParsedXlsxResult } from './models';

@Injectable()
export class ImportsService {
    constructor(
        private readonly parser: XlsxParserService,
        private readonly database: DatabaseService,
    ) { }
    private decodeFilename(filename: string): string {
        const decoded = Buffer.from(filename, 'latin1').toString('utf8');

        if (decoded.includes('\uFFFD')) {
            return filename;
        }

        return decoded;
    }
    async inspectFile(file: Express.Multer.File): Promise<ParsedXlsxResult> {
        const filename = this.decodeFilename(file.originalname);
        const rows = await this.parser.parseAndValidate(file);

        return {
            filename,
            mimeType: file.mimetype,
            size: file.size,
            headers: EXPECTED_HEADERS,
            totalRows: rows.length,
            preview: rows.slice(0, 5),
            message: 'XLSX file parsed and validated successfully'
        };
    }
}