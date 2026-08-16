import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/module";
import { CategoryProblemTopicController } from "./controller";

@Module({
    imports: [DatabaseModule],
    controllers: [CategoryProblemTopicController]
})

export class CategoryProblemTopicModule {};