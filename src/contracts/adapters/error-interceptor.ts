
export interface ErrorInterceptor {
    (error: any|Response): void;
}