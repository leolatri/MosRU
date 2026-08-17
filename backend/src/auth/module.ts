import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/module";
import { AuthController } from "./controller";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AuthService } from "./service";
import { JWTAuthGuard } from "./guard";
import { APP_GUARD } from '@nestjs/core';

@Module({
    imports: [DatabaseModule,
        ConfigModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.getOrThrow<string>('JWT_SECRET'),
                signOptions: {
                    expiresIn: '1h',
                },
            }),
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService,
        {
            provide: APP_GUARD,
            useClass: JWTAuthGuard,
        },
    ],
})

export class AuthModule {};