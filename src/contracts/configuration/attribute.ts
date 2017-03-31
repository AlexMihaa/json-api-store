import { AttributeSerializer } from '../serializers/attribute';

export interface AttributeConfiguration {
    field?: string;
    serializer?: AttributeSerializer;
}