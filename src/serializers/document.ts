import { Injectable } from '@angular/core';

import { JsonApiResourceSerializer } from './resource';
import { Resource, ResourceType, ApiDocument, ApiResource } from '../contracts';
import { ModelMetadata } from '../metadata';
import { JsonApiDocument } from '../models';
import { SerializationContext } from './context';

@Injectable()
export class JsonApiDocumentSerializer {

    constructor(private resSerializer: JsonApiResourceSerializer) {};

    serialize<T extends Resource>(resources: T|T[]): ApiDocument {
        const doc: ApiDocument = {};

        if (Array.isArray(resources)) {
            doc.data = [];

            resources.forEach((resource: T) => {
                (<ApiResource[]>doc.data).push(this.resSerializer.serialize(resource));
            });
        } else {
            doc.data = this.resSerializer.serialize(resources);
        }

        return doc;
    }

    serializeAsId<T extends Resource>(resources: T|T[]): ApiDocument {
        const doc: ApiDocument = {};

        const metadata = ModelMetadata.getObjectMetadata(resources);
        if (Array.isArray(resources)) {
            doc.data = [];

            resources.forEach((resource: T) => {
                (<ApiResource[]>doc.data).push(this.resSerializer.serializeAsId(resource, metadata));
            });
        } else {
            doc.data = this.resSerializer.serializeAsId(resources, metadata);
        }

        return doc;
    }

    deserialize<T extends Resource>(data: ApiDocument, resType: ResourceType<T>): JsonApiDocument<T|T[]> {
        if (data == null) {
            return null;
        }

        let doc: JsonApiDocument<T|T[]>;
        if (data.data && Array.isArray(data.data)) {
            doc = <JsonApiDocument<T[]>> new JsonApiDocument();
        } else {
            doc = <JsonApiDocument<T>> new JsonApiDocument();
        }

        if (data.data) {
            const context = new SerializationContext(data.included);

            if (Array.isArray(data.data)) {
                doc.data = [];
                data.data.forEach((item: ApiResource) => {
                    (<T[]>doc.data).push(this.resSerializer.deserialize(item, resType, context));
                });
            } else {
                doc.data = this.resSerializer.deserialize(data.data, resType, context);
            }
        } else if (data.errors) {
            doc.errors = data.errors;
        }

        doc.meta = data.meta;

        return doc;
    }
}
