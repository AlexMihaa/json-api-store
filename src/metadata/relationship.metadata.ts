import { FieldMetadata } from './field.metadata';
import { ModelType } from '../contracts/model.type';

export class RelationshipMetadata extends FieldMetadata {
    resource: ModelType<any>;
}