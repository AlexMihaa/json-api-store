import { RequestMethod, Response } from '@angular/http';

export interface ResponseInterceptor {
    (response: Response, method: RequestMethod): void;
}