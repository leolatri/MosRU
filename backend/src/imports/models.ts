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

export interface NormalizedViolationRow {
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

export interface ImportRowError {
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
  preview: NormalizedViolationRow[];
  message: string;
}

export interface ParsedWorkbook {
  rows: RawViolationRow[];
}

export interface ValidationResult {
  rows: NormalizedViolationRow[];
  errors: ImportRowError[];
}

export interface ImportResult {
  filename: string;
  total: number;
  created: number;
  updated: number;
  message: string;
}
