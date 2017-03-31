import { AttributeMetadata } from './attribute.metadata';
import { RelationshipMetadata } from './relationship.metadata';
import { METADATA_KEY } from '../decorators/resource.decorator';
import { ModelType } from '../contracts/model.type';
import { Model } from '../contracts/model.interface';

export class ResourceMetadata {
    public type: string;
    private attributes: AttributeMetadata[] = [];
    private relationships: RelationshipMetadata[] = [];

    public static getClassMetadata<T extends Model>(modelType: ModelType<T>): ResourceMetadata {
        return (<any>Reflect).getOwnMetadata(METADATA_KEY, modelType);
    }

    public static getObjectMetadata<T extends Model>(object: T|T[]): ResourceMetadata {
        if (Array.isArray(object)) {
            object = object[0];
        }

        const modelType = Object.getPrototypeOf(object).constructor;

        return ResourceMetadata.getClassMetadata(modelType);
    }

    addAttributes(attributes: AttributeMetadata[]): ResourceMetadata {
        attributes.forEach((attribute) => {
            this.addAttribute(attribute);
        });

        return this;
    }

    addAttribute(attribute: AttributeMetadata): ResourceMetadata {
        this.attributes.push(attribute);

        return this;
    }

    getAttributes(): AttributeMetadata[] {
        return this.attributes.slice(0);
    }

    getAttribute(name: string): AttributeMetadata {
        return this.attributes.find((attribute) => attribute.property === name);
    }

    addRelationships(relationships: RelationshipMetadata[]): ResourceMetadata {
        relationships.forEach((relationship) => {
            this.addRelationship(relationship);
        });

        return this;
    }

    addRelationship(relationship: RelationshipMetadata): ResourceMetadata {
        this.relationships.push(relationship);

        return this;
    }

    getRelationships(): RelationshipMetadata[] {
        return this.relationships.slice(0);
    }

    getRelationship(name: string): RelationshipMetadata {
        return this.relationships.find((relationship) => relationship.property === name);
    }
}