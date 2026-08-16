import { Transform } from "class-transformer";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class ResponseStatusDTO {
    @ApiProperty({
        description: 'Название статуса подготовки ответа',
        example: 'Опубликован',
    })
    @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
    @IsString()
    @IsNotEmpty()
    name!: string;
};

export class ProblemTopicDTO {
    @ApiProperty({
        description: 'Название проблемной темы',
        example: 'Засор трубы',
    })
    @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
    @IsString()
    @IsNotEmpty()
    name!: string;
};

export class ObjCategoriesDTO {
    @ApiProperty({
        description: 'Категория объекта',
        example: 'Многоквартирные дома',
    })
    @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
    @IsString()
    @IsNotEmpty()
    name!: string;
};

export class DistrictsDTO {
    @ApiProperty({
        description: 'Район',
        example: 'Таганский',
    })
    @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
    @IsString()
    @IsNotEmpty()
    name!: string;

    @ApiProperty({
        description: 'ID округа',
        example: '1',
    })
    @IsNumber()
    @IsNotEmpty()
    okrugId!: number;
};


export class AdmOkrugsDTO {
    @ApiProperty({
        description: 'Округ',
        example: 'ЦАО',
    })
    @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
    @IsString()
    @IsNotEmpty()
    name!: string;

    @ApiProperty({
        description: 'Код округа',
        example: '1',
    })
    @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
    @IsString()
    @IsNotEmpty()
    code!: string;
};

