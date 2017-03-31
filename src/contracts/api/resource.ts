import { ApiResourceId } from './resource-id';

export interface ApiResource {
    id?: string;
    type: string;
    attributes?: {[key: string]: any};
    relationships?: {[key: string]: {data: ApiResourceId|ApiResourceId[]}};
}