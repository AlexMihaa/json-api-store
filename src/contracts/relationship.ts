import { JsonApiResourceIdentifier } from './resource-identifier';
import { JsonApiResource } from './resource';

export interface JsonApiRelationship {
    data: JsonApiResourceIdentifier|JsonApiResourceIdentifier[]|JsonApiResource|JsonApiResource[];
}