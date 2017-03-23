import { AttributeSerializer } from '../serializers/attribute.serializer';

export interface AttributeConfig {
    field?: string;
    serializer?: AttributeSerializer;
    isArray?: boolean;
}