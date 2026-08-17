import { BadRequestException, Controller, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiConsumes, ApiCreatedResponse, ApiTags, ApiUnauthorizedResponse } from "@nestjs/swagger";
import { ParsedXlsxResult } from "./models";
import { FileInterceptor } from "@nestjs/platform-express";
import { ImportsService } from "./service";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const XLSX_MIME_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

@ApiTags('Import')
@ApiBearerAuth()
@Controller('imports')
export class ImportsController {
    constructor(private readonly importService: ImportsService) { }

    @Post('xlsx')
    @UseInterceptors(
        FileInterceptor('file', {
            limits: {
                fileSize: MAX_FILE_SIZE,
            },
        }),
    )
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            required: ['file'],
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    @ApiCreatedResponse({description: 'XLSX file received successfully'})
    @ApiBadRequestResponse({description: 'File is missing or has an invalid type'})
    @ApiUnauthorizedResponse({description: 'Bearer token is missing or invalid'})
    
    async uploadXlsx(@UploadedFile() file: Express.Multer.File | undefined): Promise<ParsedXlsxResult> {
        if (!file) {
            throw new BadRequestException('XLSX file is required');
        }

        const hasXlsxExtension = file.originalname.toLowerCase().endsWith('.xlsx');

        if (!hasXlsxExtension) {
            throw new BadRequestException('Only .xlsx files are allowed');
        }

        const hasValidMimeType =
            file.mimetype === XLSX_MIME_TYPE ||
            file.mimetype === 'application/octet-stream';

        if (!hasValidMimeType) {
            throw new BadRequestException('Uploaded file has an invalid MIME type');
        }

        return this.importService.inspectFile(file);
    }
}
