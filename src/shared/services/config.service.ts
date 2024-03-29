import path from 'path';

import { LoggingWinston } from '@google-cloud/logging-winston';
import { LogLevel } from '@nestjs/common';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { I18nOptionsWithoutResolvers } from 'nestjs-i18n';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';

import { IAwsConfigInterface } from '../../interfaces/aws-config.interface';
import { ISwaggerConfigInterface } from '../../interfaces/swagger-config.interface';
import { SnakeNamingStrategy } from '../typeorm/strategies/snake-naming.strategy';

export class ConfigService {
    constructor() {
        dotenv.config({
            path: `.env`,
        });

        // Replace \\n with \n to support multiline strings in AWS
        for (const envName of Object.keys(process.env)) {
            process.env[envName] = process.env[envName].replace(/\\n/g, '\n');
        }
        if (this.nodeEnv === 'development') {
            console.info(process.env);
        }
    }

    public get(key: string): string {
        return process.env[key];
    }

    public getNumber(key: string): number {
        return Number(this.get(key));
    }

    get nodeEnv(): string {
        return this.get('NODE_ENV') || 'development';
    }

    get app() {
        return {
            name: this.get('APP_NAME'),
            env: this.nodeEnv,
            version: this.get('API_VERSION'),
            versionDefault: this.get('API_VERSION_DEFAULT'),
            versionKey: this.get('API_VERSION_KEY') || 'x-api-version',
            url: this.get('API_URL'),
            cors: this.get('CORS'),
            prefix: this.apiPrefix,
            defaultLang: this.get('APP_DEFAULT_LANG') || 'en',
        };
    }

    get apiPrefix() {
        let prefix = this.get('API_PREFIX');
        if (!prefix) {
            prefix = '';
        }
        if (prefix == 'version') {
            prefix = this.get('API_VERSION');
        }
        return prefix;
    }

    get swaggerConfig(): ISwaggerConfigInterface {
        return {
            path: this.get('SWAGGER_PATH') || 'api/docs',
            title: this.get('SWAGGER_TITLE') || 'B2H Microservice API',
            description: this.get('SWAGGER_DESCRIPTION'),
            version: this.get('SWAGGER_VERSION') || '0.0.1',
            scheme: this.get('SWAGGER_SCHEME') === 'https' ? 'https' : 'http',
        };
    }

    get typeOrmConfig(): TypeOrmModuleOptions {
        let entities = [__dirname + '/../../modules/**/*.entity{.ts,.js}'];
        let migrations = [__dirname + '/../../migrations/*{.ts,.js}'];

        if ((module as any).hot) {
            const entityContext = (require as any).context(
                './../../modules',
                true,
                /\.entity\.ts$/,
            );
            entities = entityContext.keys().map((id) => {
                const entityModule = entityContext(id);
                const [entity] = Object.values(entityModule);
                return entity;
            });
            const migrationContext = (require as any).context(
                './../../migrations',
                false,
                /\.ts$/,
            );
            migrations = migrationContext.keys().map((id) => {
                const migrationModule = migrationContext(id);
                const [migration] = Object.values(migrationModule);
                return migration;
            });
        }
        return {
            entities,
            migrations,
            keepConnectionAlive: true,
            type: 'mysql',
            host: this.get('MYSQL_HOST'),
            port: this.getNumber('MYSQL_PORT'),
            username: this.get('MYSQL_USERNAME'),
            password: this.get('MYSQL_PASSWORD'),
            database: this.get('MYSQL_DATABASE'),
            migrationsRun: true,
            logging: this.nodeEnv === 'development',
            namingStrategy: new SnakeNamingStrategy(),
        };
    }

    get eventStoreConfig() {
        return {
            protocol: this.get('EVENT_STORE_PROTOCOL') || 'http',
            connectionSettings: {
                defaultUserCredentials: {
                    username:
                        this.get('EVENT_STORE_CREDENTIALS_USERNAME') || 'admin',
                    password:
                        this.get('EVENT_STORE_CREDENTIALS_PASSWORD') ||
                        'changeit',
                },
                verboseLogging: true,
                failOnNoServerResponse: true,
                // log: console, // TODO: improve Eventstore logger (separate chanel)
            },
            tcpEndpoint: {
                host: this.get('EVENT_STORE_HOSTNAME') || 'localhost',
                port: this.getNumber('EVENT_STORE_TCP_PORT') || 1113,
            },
            httpEndpoint: {
                host: this.get('EVENT_STORE_HOSTNAME') || 'localhost',
                port: this.getNumber('EVENT_STORE_HTTP_PORT') || 2113,
            },
            poolOptions: {
                min: this.getNumber('EVENT_STORE_POOLOPTIONS_MIN') || 1,
                max: this.getNumber('EVENT_STORE_POOLOPTIONS_MAX') || 10,
            },
        };
    }

    get awsS3Config(): IAwsConfigInterface {
        return {
            accessKeyId: this.get('AWS_S3_ACCESS_KEY_ID'),
            secretAccessKey: this.get('AWS_S3_SECRET_ACCESS_KEY'),
            bucketName: this.get('S3_BUCKET_NAME'),
        };
    }

    get winstonConfig(): winston.LoggerOptions {
        let transports = [
            new DailyRotateFile({
                level: 'debug',
                filename: `./logs/${this.nodeEnv}/debug-%DATE%.log`,
                datePattern: 'YYYY-MM-DD',
                zippedArchive: true,
                maxSize: '20m',
                maxFiles: '14d',
                format: winston.format.combine(
                    winston.format.timestamp(),
                    winston.format.json(),
                ),
            }),
            new DailyRotateFile({
                level: 'error',
                filename: `./logs/${this.nodeEnv}/error-%DATE%.log`,
                datePattern: 'YYYY-MM-DD',
                zippedArchive: false,
                maxSize: '20m',
                maxFiles: '30d',
                format: winston.format.combine(
                    winston.format.timestamp(),
                    winston.format.json(),
                ),
            }),
            new winston.transports.Console({
                level: 'debug',
                handleExceptions: true,
                format: winston.format.combine(
                    winston.format.colorize(),
                    winston.format.timestamp({
                        format: 'DD-MM-YYYY HH:mm:ss',
                    }),
                    winston.format.simple(),
                ),
            }),
        ];

        if (this.log.enabled) {
            const logTransport = this.googleLogTransport;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            transports = [...transports, logTransport];
        }

        return {
            transports,
            exitOnError: false,
        };
    }

    get redis() {
        return {
            host: this.get('REDIS_HOST') || '127.0.0.1',
            url: this.get('REDIS_URL'),
            port: this.get('REDIS_PORT') || '6379',
            password: this.get('REDIS_PASSWORD'),
            role: this.get('REDIS_ROLE'),
            user: this.get('REDIS_USER'),
            prefix: this.get('REDIS_PREFIX') || 'nest_cache:',
            connectionName: this.get('REDIS_CONNECTION_NAME') || 'NEST_CACHE',
            ttl: this.get('REDIS_TTL') || 3600,
        };
    }

    get newrelic() {
        return {
            enabled: this.get('NEWRELIC_ENABLED') == 'true' || false,
            appName: this.get('NEWRELIC_APP_NAME') || this.get('APP_NAME'),
            licenseKey: this.get('NEWRELIC_LICENSE_KEY'),
            log: {
                level: this.get('NEWRELIC_LOG_LEVEL'),
            },
            distributeTracing: {
                enabled:
                    this.get('NEWRELIC_DISTRIBUTE_TRACING_ENABLED') == 'true' ||
                    false,
            },
            transactionTracer: {
                enabled:
                    this.get('NEWRELIC_TRANSACTION_ENABLED') == 'true' || false,
                recordSQL: this.get('NEWRELIC_TRANSACTION_RECORD_SQL'),
                explainThreshold: this.get(
                    'NEWRELIC_TRANSACTION_EXPLAIN_THRESHOLD',
                ),
            },
            slowSql: {
                enabled:
                    this.get('NEWRELIC_SLOW_SQL_ENABLED') == 'true' || false,
                maxSamples: this.get('NEWRELIC_SLOW_SQL_MAX_SAMPLES'),
            },
        };
    }

    get googleLogTransport() {
        return new LoggingWinston({
            logName: this.get('LOG_NAME') + '_' + this.nodeEnv,
            defaultCallback: (err) => {
                if (err) {
                    console.log(`Error occurred: ${err}`);
                }
            },
        });
    }

    get log() {
        let logLevels: LogLevel[] = [
            'log',
            'warn',
            'error',
            'verbose',
            'debug',
        ];
        if (this.get('LOG_LEVELS')) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            logLevels = this.get('LOG_LEVELS').split(',');
        }

        return {
            enabled: this.get('LOG_ENABLED') == 'true' || false,
            driver: this.get('LOG_DRIVER') || 'google',
            name: this.get('LOG_NAME') || this.app.name,
            levels: logLevels,
            morgan: {
                enabled: this.get('LOG_MORGAN_ENABLED') == 'true' || false,
            },
        };
    }

    get headerKey() {
        return {
            appVersion: this.get('HEADER_APP_VERSION') || 'x-version',
            appPlatform: this.get('HEADER_APP_DEVICE') || 'x-device',
            timezone: this.get('HEADER_TIMEZONE') || 'x-timezone',
            lang: this.get('HEADER_LANG') || 'x-lang',
        };
    }

    get i18nConfig(): I18nOptionsWithoutResolvers {
        return {
            fallbackLanguage: 'id',
            loaderOptions: {
                path: path.join(__dirname, '../../assets/i18n/'),
                watch: true,
            },
        };
    }

    get rateLimit() {
        return {
            enabled: this.get('RATE_LIMIT_ENABLED') == 'true' || false,
            windowMs:
                this.getNumber('RATE_LIMIT_WINDOWMS') * 60 * 1000 ||
                15 * 60 * 1000,
            max: this.getNumber('RATE_LIMIT_MAX') || 300,
        };
    }
}
