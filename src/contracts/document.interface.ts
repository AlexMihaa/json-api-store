import { JsonApiResource } from './resource.interface';
import { JsonApiError } from './error.interface';

export interface JsonApiDocument {
    data?: JsonApiResource|JsonApiResource[];
    errors?: JsonApiError[];
    meta?: any;
    included?: JsonApiResource[];
}
