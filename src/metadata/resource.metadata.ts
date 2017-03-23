import { AttributeMetadata } from './attribute.metadata';
import { RelationshipMetadata } from './relationship.metadata';

export class ResourceMetadata {
    public type: string;
    private attributes: AttributeMetadata[] = [];
    private relationships: RelationshipMetadata[] = [];

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