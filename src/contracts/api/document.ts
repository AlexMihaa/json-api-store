import { ApiResource } from './resource';
import { ApiError } from './error';

export interface ApiDocument {
    data?: ApiResource|ApiResource[];
    errors?: ApiError[];
    included?: ApiResource[];
    meta?: any;
}
