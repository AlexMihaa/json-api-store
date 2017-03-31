import { Injectable } from '@angular/core';

import { JsonApiResourceSerializer } from './resource';
import { Resource } from '../contracts/models/resource';
import { ApiDocument } from '../contracts/api/document';
import { ModelMetadata } from '../metadata/model';
import { ApiResource } from '../contracts/api/resource';

@Injectable()
export class JsonApiDocumentSerializer {

    constructor(private resourceSerializer: JsonApiResourceSerializer) {};

    serialize<T extends Resource>(resources: T|T[]): ApiDocument {
        const doc: ApiDocument = {};

        const metadata = ModelMetadata.getObjectMetadata(resources);
        if (Array.isArray(resources)) {
            doc.data = [];

            resources.forEach((resource: T) => {
                (<ApiResource[]>doc.data).push(this.resourceSerializer.serialize(resource, metadata));
            });
        } else {
            doc.data = this.resourceSerializer.serialize(resources, metadata);
        }

        return doc;
    }


}
