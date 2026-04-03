import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { EcommerceRequestContext } from '@common/contexts/EcommerceRequestContext';
import { RequestContext } from '@medibloc/nestjs-request-context';
import { ConfigService } from '@shared/services/config.service';

@Injectable()
export class ContextRequestInterceptor implements NestInterceptor {
    constructor(private readonly configService: ConfigService) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const ctx: EcommerceRequestContext = RequestContext.get();
        ctx.headers = request.headers;
        ctx.params = request.query;
        ctx.devicePlatform =
            request.headers[this.configService.headerKey.appPlatform];
        ctx.deviceVersion =
            request.headers[this.configService.headerKey.appVersion];
        ctx.timezone = request.headers[this.configService.headerKey.timezone];
        ctx.apiVersion = request.headers[this.configService.app.versionKey];
        ctx.lang = request.headers[this.configService.headerKey.lang];
        return next.handle();
    }
}
