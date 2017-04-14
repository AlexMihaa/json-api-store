import { Resource, ApiError } from '../contracts';

export class JsonApiDocument<T extends Resource|Resource[]> {

    data?: T;

    errors?: ApiError[];

    meta?: any;

    get hasErrors(): boolean {
        return (Array.isArray(this.errors) && this.errors.length > 0);
    }
}