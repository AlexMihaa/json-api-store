import { FieldMetadata } from './field.metadata';
import { AttributeSerializer } from '../serializers/attribute.serializer';

export class AttributeMetadata extends FieldMetadata {
    serializer: AttributeSerializer;
}