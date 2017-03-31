
export interface ApiError {
    id?: string;
    status?: string;
    code?: string;
    title?: string;
    detail?: string;
    source?: {pointer?: string, parameter?: string};
    meta?: any;
}