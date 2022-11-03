import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { getI18nContextFromArgumentsHost, I18n, I18nService } from 'nestjs-i18n';
import { EntityNotFoundError } from 'typeorm';
import { Request, Response } from 'express';

import { LoggerService } from '../shared/services/logger.service';

@Catch(NotFoundException, EntityNotFoundError)
export class NotFoundExceptionFilter implements ExceptionFilter {
    constructor(private readonly _logger: LoggerService) {}

    catch(_exception: HttpException, host: ArgumentsHost) {
        const i18n = getI18nContextFromArgumentsHost(host);
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const message = i18n.t('error.NOT_FOUND');
        let code = HttpStatus.INTERNAL_SERVER_ERROR;
        const statusCode = _exception.getStatus ? _exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
        const errorCode = typeof response === 'object' ? (response as any).errorCode : statusCode;
        let detail = (_exception as any).message.message;

        if (request) {
            switch (_exception.constructor) {
                case EntityNotFoundError:
                    code = HttpStatus.UNPROCESSABLE_ENTITY;
                    detail = (_exception as unknown as EntityNotFoundError).message;
                    break;
                case NotFoundException:
                    code = HttpStatus.NOT_FOUND;
                    detail = (_exception as NotFoundException).message;
                    break;
                default:
                    code = HttpStatus.INTERNAL_SERVER_ERROR;
            }
            // const errorResponse = {
            //     statusCode: code,
            //     timestamp: new Date().toISOString(),
            //     path: request.url,
            //     method: request.method,
            //     error: error,
            //     message: message,
            // };

            const errorResponse = {
                status: 'Error',
                statusCode: _exception.getStatus,
                errorCode: code,
                message,
                detail,
                payload: typeof response === 'object' ? (response as any).payload : null,
            };

            return response.status(code).send(errorResponse);
        } else {
            // GRAPHQL Exception
            // const gqlHost = GqlArgumentsHost.create(host);
            return _exception;
        }
    }
}
