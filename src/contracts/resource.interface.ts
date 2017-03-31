import { JsonApiResourceIdentifier } from './resource-identifier.interface';

export interface JsonApiResource {
    id?: string;
    type: string;
    attributes?: {[key: string]: any};
    relationships?: {[key: string]: {data: JsonApiResourceIdentifier|JsonApiResourceIdentifier[]}};
}