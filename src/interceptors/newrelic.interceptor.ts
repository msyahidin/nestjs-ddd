import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const newrelic = require('newrelic');

@Injectable()
export class NewrelicInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest<Request>();
        return newrelic.startWebTransaction(context.getHandler().name, function () {
            newrelic.setTransactionName(request.method + ' ' + request.route.path);
            const transaction = newrelic.getTransaction();
            return next.handle().pipe(tap(() => transaction.end()));
        });
    }
}
