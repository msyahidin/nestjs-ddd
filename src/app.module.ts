import './boilerplate.polyfill';
import { CacheModule, Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
// import { eventStoreBusConfig } from './providers/event-bus.provider';
import { SharedModule } from './shared.module';
import { CacheConfigService } from './shared/services/cache.service';
import { ConfigService } from './shared/services/config.service';

@Module({
    imports: [
        UsersModule,
        TerminusModule,
        TypeOrmModule.forRootAsync({
            imports: [SharedModule],
            useFactory: (configService: ConfigService) =>
                configService.typeOrmConfig,
            inject: [ConfigService],
        }),
        CacheModule.registerAsync({
            useClass: CacheConfigService,
            isGlobal: true,
        }),
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
