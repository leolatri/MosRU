import { Injectable } from "@nestjs/common";

export interface FileModel {
    filename: string;
    mimeType: string;
    size: number;
    message: string;
}

@Injectable()
export class ImportsService {
    private decodeFilename(filename: string): string {
        const decoded = Buffer.from(filename, 'latin1').toString('utf8');

        if (decoded.includes('\uFFFD')) return filename;

        return decoded;
    }

    inspectFile(file: Express.Multer.File): FileModel {
        const filename = this.decodeFilename(file.originalname);
        return {
            filename: filename,
            mimeType: file.mimetype,
            size: file.size,
            message: 'XLSX file received successfully',
        }
    }
};