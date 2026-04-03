/* eslint-disable prettier/prettier */
import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ResponseSuccess<T> {
    status: string;
    statusCode: number;
    message: string;
    data: T;
}

@Injectable()
export class ResponseSuccessInterceptor<T>
    implements NestInterceptor<T, ResponseSuccess<T>>
{
    intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Observable<ResponseSuccess<T>> {
        return next.handle().pipe(
            map(({message, ...data}) => ({
                status: 'Success',
                statusCode: context.switchToHttp().getResponse().statusCode,
                data,
                message,
            })),
        );
    }
}
