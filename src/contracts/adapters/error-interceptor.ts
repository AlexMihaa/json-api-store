import {HttpErrorResponse} from "@angular/common/http";

export interface ErrorInterceptor {
    (error: HttpErrorResponse): void;
}