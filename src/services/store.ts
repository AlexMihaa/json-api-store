import { Injectable } from '@angular/core';
import {Observable, throwError} from "rxjs";
import {catchError, map} from "rxjs/operators";

import { Resource, ResourceType, ApiDocument } from '../contracts';
import { JsonApiDocumentSerializer } from '../serializers';
import { JsonApiStoreAdapter } from './store-adapter';
import { JsonApiDocument } from '../models';
import { ResourceMetadata } from '../metadata';

@Injectable()
export class JsonApiStore {

    constructor(private serializer: JsonApiDocumentSerializer, private adapter: JsonApiStoreAdapter) {}

    get<T extends Resource>(resType: ResourceType<T>, id: string, params?: any): Observable<JsonApiDocument<T>> {
        const request = this.adapter.get(resType, id, params);

        return <Observable<JsonApiDocument<T>>>this.performRequest(request, resType);
    }

    getList<T extends Resource>(resType: ResourceType<T>, params?: any): Observable<JsonApiDocument<T[]>> {
        const request = this.adapter.getList(resType, params);

        return <Observable<JsonApiDocument<T[]>>>this.performRequest(request, resType);
    }

    save<T extends Resource>(resources: T|T[], params?: any): Observable<JsonApiDocument<T|T[]>> {
        const resType = this.getResourceType(resources);

        try {
            const isNew = this.isNewResources(resources);

            return (isNew) ? this.create(resType, resources, params) : this.update(resType, resources, params);
        } catch (e) {
            const doc: ApiDocument = {
                errors: [{
                    id: Math.random().toString(),
                    status: '400',
                    title: e.message
                }]
            };

            return this.performRequest(throwError(doc), resType);
        }
    }

    remove<T extends Resource>(resource: T|T[], params?: any): Observable<JsonApiDocument<T|T[]>> {
        const resType = this.getResourceType(resource);

        let request: Observable<ApiDocument>;
        if (Array.isArray(resource)) {
            request = this.adapter.removeAll(
                resType,
                this.serializer.serializeAsId(resource),
                params
            );
        } else {
            request = this.adapter.remove(resType, resource.id, params);
        }

        return this.performRequest(request, resType);
    }

    private performRequest<T extends Resource>(
        request: Observable<ApiDocument>,
        resType: ResourceType<T>
    ): Observable<JsonApiDocument<T|T[]>> {
        return request.pipe(
            map((data: ApiDocument) => this.serializer.deserialize(data, resType)),
            catchError((error: ApiDocument) => {
                return throwError(this.serializer.deserialize(error, resType));
            })
        );
    }

    private getResourceType<T extends Resource>(resource: T[] | T): ResourceType<T> {
        if (Array.isArray(resource)) {
            resource = resource[0];
        }

        return Object.getPrototypeOf(resource).constructor;
    }

    private isNewResources<T extends Resource>(resources: T[] | T): boolean {
        let isNew: boolean = null;

        if (Array.isArray(resources)) {
            resources.forEach((resource: T) => {
                const metadata = ResourceMetadata.getMetadata(resource);

                if (null === isNew) {
                    isNew = metadata.isNew;
                } else if(isNew !== metadata.isNew) {
                    throw new Error('You cannot create and update resources in the same time');
                }
            });
        } else {
            isNew = ResourceMetadata.getMetadata(resources).isNew;
        }

        return isNew;
    }

    private create<T extends Resource>(
        resType: ResourceType<T>,
        resources: T[] | T,
        params?: any
    ): Observable<JsonApiDocument<T|T[]>> {
        const payload = this.serializer.serialize(resources);

        return this.performRequest(this.adapter.create(resType, payload, params), resType);
    }

    private update<T extends Resource>(
        resType: ResourceType<T>,
        resources: T[] | T,
        params: any
    ): Observable<JsonApiDocument<T|T[]>> {
        const payload = this.serializer.serialize(resources);

        let request: Observable<ApiDocument>;
        if (Array.isArray(resources)) {
            request = this.adapter.updateAll(resType, payload, params);
        } else {
            request = this.adapter.update(resType, resources.id, payload, params);
        }

        return this.performRequest(request, resType);
    }
}