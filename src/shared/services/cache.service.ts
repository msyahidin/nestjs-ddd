import { Injectable } from '@nestjs/common';
import { CacheModuleOptions, CacheOptionsFactory } from '@nestjs/cache-manager';
import KeyvRedis from '@keyv/redis';

import { ConfigService } from './config.service';

@Injectable()
class CacheConfigService implements CacheOptionsFactory {
    constructor(public configService: ConfigService) {}

    createCacheOptions(): CacheModuleOptions {
        const { url, host, port, password, prefix, ttl } = this.configService.redis;

        // Embed password in URL so @keyv/redis can authenticate
        let redisUrl = url;
        if (!redisUrl) {
            redisUrl = password
                ? `redis://:${encodeURIComponent(password)}@${host}:${port}`
                : `redis://${host}:${port}`;
        }

        return {
            stores: [
                new KeyvRedis(redisUrl, {
                    namespace: prefix, // KeyvRedis uses `namespace` as the key prefix
                }),
            ],
            ttl: +ttl * 1000, // cache-manager v6 uses milliseconds
        };
    }
}

export { CacheConfigService };
