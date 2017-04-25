import { Injectable } from '@angular/core';
import { Headers, Http, Request, RequestMethod, RequestOptions, Response } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { JsonApiUrlBuilder } from './url-builder';
import { JsonApiParamsParser } from './params-parser';
import { Resource, ResourceType, ApiDocument, RequestInterceptor, ResponseInterceptor } from '../contracts';

@Injectable()
export class JsonApiStoreAdapter {

    private reqInterceptors: Map<any, Set<RequestInterceptor>>;
    private respInterceptors: Map<any, Set<ResponseInterceptor>>;

    constructor(private http: Http, private urlBuilder: JsonApiUrlBuilder, private parser: JsonApiParamsParser) {
        this.reqInterceptors = new Map();
        this.respInterceptors = new Map();
    }

    addRequestInterceptor<T extends Resource>(
        resType: ResourceType<T>,
        interceptor: RequestInterceptor
    ): JsonApiStoreAdapter {
        if (!this.reqInterceptors.has(resType)) {
            this.reqInterceptors.set(resType, new Set());
        }

        this.reqInterceptors.get(resType).add(interceptor);

        return this;
    }

    addResponseInterceptor<T extends Resource>(
        resType: ResourceType<T>,
        interceptor: ResponseInterceptor
    ): JsonApiStoreAdapter {
        if (!this.respInterceptors.has(resType)) {
            this.respInterceptors.set(resType, new Set());
        }

        this.respInterceptors.get(resType).add(interceptor);

        return this;
    }

    get<T extends Resource>(resType: ResourceType<T>, id: string, params?: any): Observable<ApiDocument> {
        const url = this.urlBuilder.getResourceUrl(resType, id);

        return this.sendRequest(resType, url, RequestMethod.Get, params);
    }

    getList<T extends Resource>(resType: ResourceType<T>, params?: any): Observable<ApiDocument> {
        const url = this.urlBuilder.getResourceListUrl(resType);

        return this.sendRequest(resType, url, RequestMethod.Get, params);
    }

    create<T extends Resource>(resType: ResourceType<T>, payload: ApiDocument, params?: any): Observable<ApiDocument> {
        const url = this.urlBuilder.getResourceListUrl(resType);

        return this.sendRequest(resType, url, RequestMethod.Post, params, payload);
    }

    update<T extends Resource>(
        resType: ResourceType<T>,
        id: string,
        payload: ApiDocument,
        params?: any
    ): Observable<ApiDocument> {
        const url = this.urlBuilder.getResourceUrl(resType, id);

        return this.sendRequest(resType, url, RequestMethod.Patch, params, payload);
    }

    remove<T extends Resource>(resType: ResourceType<T>, id: string, params?: any): Observable<ApiDocument> {
        const url = this.urlBuilder.getResourceUrl(resType, id);

        return this.sendRequest(resType, url, RequestMethod.Delete, params);
    }

    private sendRequest<T extends Resource>(
        resType: ResourceType<T>,
        url: string,
        method: RequestMethod,
        params?: any,
        body?: ApiDocument
    ): Observable<ApiDocument> {
        const request = this.prepareRequest(resType, url, method, params, body);

        return this.http.request(request)
            .map((response: Response) => this.parseResponse(resType, response))
            .catch((error) => this.handleError(resType, error));
    }

    private prepareRequest<T extends Resource>(
        resType: ResourceType<T>,
        url: string,
        method: RequestMethod,
        params?: any,
        body?: ApiDocument
    ): Request {
        const options = new RequestOptions({
            url: url,
            method: method,
            body: body,
            search: (params) ? this.parser.parse(params) : undefined,
            headers: this.prepareHeaders()
        });

        if (this.reqInterceptors.has(resType)) {
            this.reqInterceptors.get(resType).forEach((interceptor) => {
                interceptor(body, options);
            });
        }

        return new Request(options);
    }

    private prepareHeaders() {
        return new Headers({
            'Content-Type': 'application/vnd.api+json',
            'Accept': 'application/vnd.api+json'
        });
    }

    private parseResponse<T extends Resource>(resType: ResourceType<T>, response: Response): ApiDocument {
        return response.json();
    }

    private handleError<T extends Resource>(resType: ResourceType<T>, error: Response): ApiDocument {

    }
}