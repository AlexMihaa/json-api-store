import { ResourceType } from '../models/resource-type';

/**
 * Configuration object for {@link Relationship} decorator
 */
export interface RelationshipConfiguration {
    /**
     * Resource type for relationship
     */
    resource: ResourceType<any>;

    /**
     * Resource field name if it doesn't match with property name
     */
    field?: string;

    isArray?: boolean;
}