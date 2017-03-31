import { ApiResourceId } from './resource-id';
import { ApiResource } from './resource';

export interface ApiRelationship {
    data: ApiResourceId|ApiResourceId[]|ApiResource|ApiResource[];
}