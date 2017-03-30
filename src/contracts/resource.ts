import { JsonApiResourceIdentifier } from './resource-identifier';

export interface JsonApiResource {
    id?: string;
    type: string;
    attributes?: {[key: string]: any};
    relationships?: {[key: string]: {data: JsonApiResourceIdentifier|JsonApiResourceIdentifier[]}};
}