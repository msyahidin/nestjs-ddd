import {
    CacheModuleOptions,
    CacheOptionsFactory,
    Injectable,
} from '@nestjs/common';
import * as redisStore from 'cache-manager-redis-store';

import { ConfigService } from './config.service';

@Injectable()
class CacheConfigService implements CacheOptionsFactory {
    constructor(public configService: ConfigService) {}

    createCacheOptions(): CacheModuleOptions {
        return {
            store: redisStore,
            host: this.configService.redis.host,
            port: this.configService.redis.port,
            keyPrefix: this.configService.redis.prefix,
            username: this.configService.redis.user,
            password: this.configService.redis.password,
            ttl: +this.configService.redis.ttl,
        };
    }
}

export { CacheConfigService };
