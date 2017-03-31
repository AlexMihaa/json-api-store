import { Injectable } from '@angular/core';

import { JsonApiResourceSerializer } from './resource.serializer';
import { Model } from '../contracts/model.interface';
import { JsonApiDocument } from '../contracts/document.interface';
import { ResourceMetadata } from '../metadata/resource.metadata';
import { JsonApiResource } from '../contracts/resource.interface';

@Injectable()
export class JsonApiDocumentSerializer {

    constructor(private resourceSerializer: JsonApiResourceSerializer) {};

    serialize<T extends Model>(resources: T|T[]): JsonApiDocument {
        const doc: JsonApiDocument = {};

        const metadata = ResourceMetadata.getObjectMetadata(resources);
        if (Array.isArray(resources)) {
            doc.data = [];

            resources.forEach((resource: T) => {
                (<JsonApiResource[]>doc.data).push(this.resourceSerializer.serialize(resource, metadata));
            });
        } else {
            doc.data = this.resourceSerializer.serialize(resources, metadata);
        }

        return doc;
    }


}
