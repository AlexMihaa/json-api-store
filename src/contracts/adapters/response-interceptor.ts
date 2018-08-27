import {HttpEvent} from "@angular/common/http";
import {ApiDocument} from "../api";

export interface ResponseInterceptor {
    (response: HttpEvent<ApiDocument>, method: string): void;
}