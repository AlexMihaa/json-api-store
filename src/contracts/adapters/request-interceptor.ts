import { RequestOptions } from '@angular/http';

export interface RequestInterceptor {
    (options: RequestOptions): void;
}