import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { Resource, ResourceType, ApiDocument } from '../contracts';
import { JsonApiDocumentSerializer } from '../serializers';
import { JsonApiStoreAdapter } from './store-adapter';
import { JsonApiDocument } from '../models';
import { ResourceMetadata } from '../metadata';

@Injectable()
export class JsonApiStore {

    constructor(private serializer: JsonApiDocumentSerializer, private adapter: JsonApiStoreAdapter) {}

    get<T extends Resource>(resType: ResourceType<T>, id: string, params?: any): Observable<JsonApiDocument<T>> {
        return this.adapter
            .get(resType, id, params)
            .map((data) => this.serializer.deserialize(data, resType));
    }

    getList<T extends Resource>(resType: ResourceType<T>, params?: any): Observable<JsonApiDocument<T[]>> {
        return this.adapter
            .getList(resType, params)
            .map((data) => this.serializer.deserialize(data, resType));
    }

    save<T extends Resource>(resource: T, params?: any): Observable<JsonApiDocument<T>> {
        const resType = Object.getPrototypeOf(resource).constructor;
        const payload = this.serializer.serialize(resource);

        let adapterCall: Observable<ApiDocument>;

        const metadata = ResourceMetadata.getMetadata(resource);
        if (metadata && metadata.isNew) {
            adapterCall = this.adapter.create(resType, payload, params);
        } else {
            adapterCall = this.adapter.update(resType, resource.id, payload, params);
        }

        return adapterCall.map((data) => this.serializer.deserialize(data, resType));
    }

    remove<T extends Resource>(resource: T, params?: any): Observable<JsonApiDocument<T>> {
        const resType = Object.getPrototypeOf(resource).constructor;

        return this.adapter
            .remove(resType, resource.id, params)
            .map((data) => this.serializer.deserialize(data, resType));
    }
}