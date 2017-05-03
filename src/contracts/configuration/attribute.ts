import { AttributeSerializer } from '../serializers';

/**
 * Configuration for {@link Attribute} decorator
 */
export interface AttributeConfiguration {

    /**
     * Resource field name if it doesn't match with property name
     */
    field?: string;

    /**
     * {@link AttributeSerializer} that will be used for value
     * serialization/deserialization
     */
    serializer?: AttributeSerializer;
}