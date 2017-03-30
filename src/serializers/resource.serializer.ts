import { Injectable } from '@angular/core';

import { ResourceMetadata } from '../metadata/resource.metadata';
import { ResourceInstanceMetadata } from '../metadata/resource-instance.metadata';
import { JsonApiResource } from '../contracts/resource';
import { AttributeMetadata } from '../metadata/attribute.metadata';
import { JsonApiResourceIdentifier } from '../contracts/resource-identifier';
import { RelationshipMetadata } from '../metadata/relationship.metadata';
import { JsonApiRelationship } from '../contracts/relationship';

@Injectable()
export class JsonApiResourceSerializer {

    serialize(resource: any, metadata: ResourceMetadata): JsonApiResource {
        const payload: JsonApiResource = {
            type: metadata.type
        };

        if (resource.id) {
            payload.id = resource.id;
        }

        const attributes = this.serializeAttributes(resource, metadata);
        if (attributes) {
            payload.attributes = attributes;
        }

        const relationships = this.serializeRelationships(resource, metadata);
        if (relationships) {
            payload.relationships = relationships;
        }

        return payload;
    }

    serializeAsId(resource: any, metadata: ResourceMetadata): JsonApiResourceIdentifier {
        return {
            id: resource.id,
            type: metadata.type
        };
    }

    private serializeAttributes(resource: any, metadata: ResourceMetadata): {[key: string]: any} {
        let count:number = 0;
        const attributes: {[key: string]: any} = {};

        const instMetadata = ResourceInstanceMetadata.getMetadata(resource);

        metadata.getAttributes().forEach((attrMetadata: AttributeMetadata) => {
            if ((instMetadata) &&
                (false === instMetadata.isNew) &&
                (false === instMetadata.isChanged(attrMetadata.property))
            ) {
                return;
            }

            let value = (instMetadata) ? instMetadata.getFieldValue(attrMetadata.property) : undefined;
            if (attrMetadata.serializer) {
                value = attrMetadata.serializer.serialize(value);
            } else if (typeof value === 'undefined') {
                value = null;
            }

            const field = (attrMetadata.field) ? attrMetadata.field : attrMetadata.property;

            attributes[field] = value;

            count++;
        });

        return (count > 0) ? attributes : null;
    }

    private serializeRelationships(resource: any, metadata: ResourceMetadata): any {
        let count: number = 0;
        const relationships: {[key: string]: JsonApiRelationship} = {};

        const instMetadata = ResourceInstanceMetadata.getMetadata(resource);

        metadata.getRelationships().forEach((relMetadata: RelationshipMetadata) => {
            const relationship = this.serializeRelationship(relMetadata, instMetadata);
            if (!relationship) {
                return;
            }

            const field = (relMetadata.field) ? relMetadata.field : relMetadata.property;

            relationships[field] = relationship;

            count++;
        });

        return (count > 0) ? relationships : null;
    }

    private serializeRelationship(
        relMeta: RelationshipMetadata,
        instMeta: ResourceInstanceMetadata
    ): JsonApiRelationship {

        if ((instMeta) && (false === instMeta.isNew) && (false === instMeta.isChanged(relMeta.property))) {
            return null;
        }

        const value = (instMeta) ? instMeta.getFieldValue(relMeta.property) : undefined;
        const metadata = ResourceMetadata.getClassMetadata(relMeta.resource);

        if (relMeta.isArray) {
            return this.serializeHasMany(value, metadata);
        }

        return this.serializeHasOne(value, metadata);
    }

    private serializeHasMany(value: Array<any>, metadata: ResourceMetadata): JsonApiRelationship {
        const relationship: JsonApiRelationship = {data: []};

        if (!value) {
            return relationship;
        }

        value.forEach((item) => {
            (<any[]>relationship.data).push(this.serializeRelationshipItem(item, metadata));
        });

        return relationship;
    }

    private serializeHasOne(value: any, metadata: ResourceMetadata): JsonApiRelationship {
        const relationship: JsonApiRelationship = {data: null};

        if (!value) {
            return relationship;
        }

        relationship.data = this.serializeRelationshipItem(value, metadata);

        return relationship;
    }

    private serializeRelationshipItem(item: any, metadata: ResourceMetadata): JsonApiResource|JsonApiResourceIdentifier {
        const instMeta = ResourceInstanceMetadata.getMetadata(item);
        if ((!instMeta) || (false === instMeta.isNew) || (false === instMeta.hasChanges)) {
            return this.serializeAsId(item, metadata);
        }

        return this.serialize(item, metadata);
    }
}