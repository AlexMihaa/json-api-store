import { ResourceType } from '../models/resource-type';

export interface RelationshipConfiguration {
    resource: ResourceType<any>;
    field?: string;
    isArray?: boolean;
}