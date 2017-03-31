import { ModelType } from '../contracts/model.type';

export interface RelationshipConfig {
    resource: ModelType<any>;
    field?: string;
    isArray?: boolean;
}