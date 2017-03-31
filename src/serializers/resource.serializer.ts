import { Injectable } from '@angular/core';

import { ResourceMetadata } from '../metadata/resource.metadata';
import { ResourceInstanceMetadata } from '../metadata/resource-instance.metadata';
import { JsonApiResource } from '../contracts/resource.interface';
import { AttributeMetadata } from '../metadata/attribute.metadata';
import { JsonApiResourceIdentifier } from '../contracts/resource-identifier.interface';
import { RelationshipMetadata } from '../metadata/relationship.metadata';
import { JsonApiRelationship } from '../contracts/relationship.interface';
import { JsonApiSerializationContext } from './serialization.context';
import { Model } from '../contracts/model.interface';
import { ModelType } from '../contracts/model.type';

@Injectable()
export class JsonApiResourceSerializer {

    serialize(resource: Model, metadata: ResourceMetadata): JsonApiResource {
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

    serializeAsId(resource: Model, metadata: ResourceMetadata): JsonApiResourceIdentifier {
        return {
            id: resource.id,
            type: metadata.type
        };
    }

    deserialize<T extends Model>(
        data: JsonApiResource,
        modelType: ModelType<T>,
        context: JsonApiSerializationContext
    ): T {
        const metadata = ResourceMetadata.getClassMetadata(modelType);

        const resource = new modelType();
        resource.id = data.id;

        if (data.attributes && data.attributes instanceof Object) {
            this.deserializeAttributes(resource, data.attributes, metadata);
        }

        if (data.relationships && data.relationships instanceof Object) {
            this.deserializeRelationships(resource, data.relationships, metadata, context);
        }

        ResourceInstanceMetadata.flushMetadata(resource);
        context.addResource(metadata.type, resource.id, resource);

        return resource;
    }

    private serializeAttributes(resource: Model, metadata: ResourceMetadata): {[key: string]: any} {
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

            let value = instMetadata.getFieldValue(attrMetadata.property);
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

    private serializeRelationships(resource: Model, metadata: ResourceMetadata): any {
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

        const value = instMeta.getFieldValue(relMeta.property);
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

    private serializeRelationshipItem(item: Model, metadata: ResourceMetadata): JsonApiResource|JsonApiResourceIdentifier {
        const instMeta = ResourceInstanceMetadata.getMetadata(item);
        if ((!instMeta) || (false === instMeta.isNew) || (false === instMeta.hasChanges)) {
            return this.serializeAsId(item, metadata);
        }

        return this.serialize(item, metadata);
    }

    private deserializeAttributes(resource: any, data: any, metadata: ResourceMetadata) {
        metadata.getAttributes().forEach((attrMeta: AttributeMetadata) => {
            const field = (attrMeta.field) ? attrMeta.field : attrMeta.property;
            if (!data[field]) {
                return;
            }

            resource[attrMeta.property] = (attrMeta.serializer) ? attrMeta.serializer.unserialize(data[field]) : data[field];
        });
    }

    private deserializeRelationships(
        resource: any,
        data: any,
        metadata: ResourceMetadata,
        context: JsonApiSerializationContext
    ) {
        metadata.getRelationships().forEach((relMeta: RelationshipMetadata) => {
            const field = (relMeta.field) ? relMeta.field : relMeta.property;
            if (!data[field]) {
                return;
            }

            let parsedValue: Model|Model[];
            if (relMeta.isArray) {
                parsedValue = this.deserializeRelationshipItems(data[field].data, relMeta.resource, context);
            } else {
                parsedValue = this.deserializeRelationshipItem(data[field].data, relMeta.resource, context);
            }

            resource[relMeta.property] = parsedValue;
        });
    }

    private deserializeRelationshipItems<T extends Model>(
        value: Array<JsonApiResourceIdentifier>,
        modelType: ModelType<T>,
        context: JsonApiSerializationContext
    ): T[] {
        const parsed: Array<T> = [];

        if (!Array.isArray(value)) {
            return parsed;
        }

        value.forEach((item: JsonApiResourceIdentifier) => {
            const parsedItem = this.deserializeRelationshipItem(item, modelType, context);
            if (!parsedItem) {
                return;
            }

            parsed.push(parsedItem);
        });

        return parsed;
    }

    private deserializeRelationshipItem<T extends Model>(
        data: JsonApiResourceIdentifier,
        modelType: ModelType<T>,
        context: JsonApiSerializationContext
    ) {
        if (!data || (!data.type) || (!data.id)) {
            return null;
        }

        if (context.hasResource(data.type, data.id)) {
            return context.getResource(data.type, data.id);
        }

        if (context.hasLinkedData(data.type, data.id)) {
            this.deserialize(context.getLinkedData(data.type, data.id), modelType, context);
        } else {
            this.deserialize(data, modelType, context);
        }

        return context.getResource(data.type, data.id);
    }
}