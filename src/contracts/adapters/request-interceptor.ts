import { RequestOptions } from '@angular/http';
import { ApiDocument } from '../api/document';

export interface RequestInterceptor {
    (payload: ApiDocument, options: RequestOptions): void;
}