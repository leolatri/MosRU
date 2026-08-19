import { Transform, Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsInt,
  IsString,
  Min,
  IsOptional,
  Matches,
  IsDateString,
  IsEmail,
  MaxLength,
  MinLength,
  IsIn,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
interface TransformValueParams {
  value: unknown;
}

export class ResponseStatusDTO {
  @ApiProperty({
    description: 'Название статуса подготовки ответа',
    example: 'Опубликован',
  })
  @Transform(({ value }: TransformValueParams) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  name!: string;
}

export class ProblemTopicDTO {
  @ApiProperty({
    description: 'Название проблемной темы',
    example: 'Засор трубы',
  })
  @Transform(({ value }: TransformValueParams) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  name!: string;
}

export class ObjCategoriesDTO {
  @ApiProperty({
    description: 'Категория объекта',
    example: 'Многоквартирные дома',
  })
  @Transform(({ value }: TransformValueParams) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  name!: string;
}

export class DistrictsDTO {
  @ApiProperty({
    description: 'Район',
    example: 'Таганский',
  })
  @Transform(({ value }: TransformValueParams) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: 'ID округа',
    example: '1',
  })
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  okrugId!: number;
}

export class AdmOkrugsDTO {
  @ApiProperty({
    description: 'Код округа',
    example: 'ЦАО',
  })
  @Transform(({ value }: TransformValueParams) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  code!: string;
}

export class CategoryProblemTopicDTO {
  @ApiProperty({
    description: 'ID Категории объекта',
    example: '1',
  })
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  objectCategoryId!: number;

  @ApiProperty({
    description: 'ID Темы проблемы',
    example: '1',
  })
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  problemTopicId!: number;
}

export class ViolationDTO {
  @ApiProperty({
    description: 'ID сообщения из исходного XLSX-файла',
    example: 111550557,
  })
  @IsInt()
  @Min(1)
  sourceMessageId!: number;

  @ApiProperty({
    description: 'Номер заявки',
    example: 21816578,
  })
  @IsInt()
  @Min(1)
  applicationNumber!: number;

  @ApiProperty({
    description: 'Дата публикации в формате YYYY-MM-DD',
    example: '2026-08-16',
    format: 'date',
  })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'publicationDate must have YYYY-MM-DD format',
  })
  @IsDateString()
  publicationDate!: string;

  @ApiPropertyOptional({
    description: 'ID района. Может отсутствовать',
    example: 1,
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  districtId?: number | null;

  @ApiProperty({
    description: 'Название или адрес объекта',
    example: 'г. Москва, улица Тверская, дом 10',
  })
  @Transform(({ value }: TransformValueParams) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  objectName!: string;

  @ApiProperty({
    description: 'ID категории объекта',
    example: 1,
  })
  @IsInt()
  @Min(1)
  objectCategoryId!: number;

  @ApiProperty({
    description: 'ID проблемной темы',
    example: 1,
  })
  @IsInt()
  @Min(1)
  problemTopicId!: number;

  @ApiPropertyOptional({
    description: 'Регламентный срок подготовки ответа в формате YYYY-MM-DD',
    example: '2026-08-20',
    format: 'date',
    nullable: true,
  })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'responseDeadline must have YYYY-MM-DD format',
  })
  @IsDateString()
  responseDeadline?: string | null;

  @ApiProperty({
    description: 'ID статуса подготовки ответа',
    example: 1,
  })
  @IsInt()
  @Min(1)
  responseStatusId!: number;
}

export class ViolationQueryDTO {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;

  @IsOptional()
  @IsIn(['id', 'applicationNumber', 'publicationDate', 'responseDeadline'])
  sortBy: string = 'id';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder: 'asc' | 'desc' = 'desc';

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @IsInt()
  districtId?: number;

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @IsInt()
  objectCategoryId?: number;

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @IsInt()
  problemTopicId?: number;

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @IsInt()
  responseStatusId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  search?: string;
}

export class UserDTO {
  @ApiProperty({
    description: 'Почта',
    example: 'ex@gmail.com',
  })
  @Transform(({ value }: TransformValueParams) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @ApiProperty({
    description: 'Пароль',
    example: '123456Al.',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password!: string;
}
