import { JsonApiResourceIdentifier } from './resource-identifier.interface';
import { JsonApiResource } from './resource.interface';

export interface JsonApiRelationship {
    data: JsonApiResourceIdentifier|JsonApiResourceIdentifier[]|JsonApiResource|JsonApiResource[];
}