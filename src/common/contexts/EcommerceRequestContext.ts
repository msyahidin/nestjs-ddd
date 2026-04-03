import { RequestContext } from '@medibloc/nestjs-request-context';

export class EcommerceRequestContext extends RequestContext {
    headers: Record<string, string>;
    params: Record<string, string>;
    devicePlatform: string;
    deviceVersion: string;
    timezone: string;
    apiVersion: string;
    lang: string;
}
