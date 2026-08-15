import { Transform } from "class-transformer";
import { IsNotEmpty, IsString } from "class-validator";

export class ResponseStatusDTO {
    @Transform(({value}) => typeof value === 'string' ? value.trim() : value)
    @IsString()
    @IsNotEmpty()
    name!: string;
};

export class ProblemTopicDTO {
    @Transform(({value}) => typeof value === 'string' ? value.trim() : value)
    @IsString()
    @IsNotEmpty()
    name!: string;
};

