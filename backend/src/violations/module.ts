import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/module";
import { ViolationsController } from "./controller";

@Module({
    imports: [DatabaseModule],
    controllers: [ViolationsController]
})

export class ViolationModule {};