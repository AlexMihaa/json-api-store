import { Injectable } from '@angular/core';
import { Headers, Http, Request, RequestMethod, RequestOptions, Response } from '@angular/http';

import { Observable, ObservableInput } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { JsonApiUrlBuilder } from './url-builder';
import { JsonApiParamsParser } from './params-parser';
import {
    Resource,
    ResourceType,
    ApiDocument,
    RequestInterceptor,
    ResponseInterceptor,
    ErrorInterceptor
} from '../contracts';

@Injectable()
export class JsonApiStoreAdapter {

    private reqInterceptors: Map<any, Set<RequestInterceptor>>;
    private respInterceptors: Map<any, Set<ResponseInterceptor>>;
    private errInterceptors: Map<any, Set<ErrorInterceptor>>;

    constructor(private http: Http, private urlBuilder: JsonApiUrlBuilder, private parser: JsonApiParamsParser) {
        this.reqInterceptors = new Map();
        this.respInterceptors = new Map();
        this.errInterceptors = new Map();
    }

    /**
     * Register request interceptor
     *
     * You can use {@link RequestInterceptor} to adjust request options before
     * actual request will be sent. For example, it can be used to add API key
     * to request headers:
     *
     * ```typescript
     *
     * const interceptor: RequestInterceptor = (options: RequestOptions) => {
     *   options.headers.set('Authorization', 'YOUR_API_KEY_WILL_BE_HERE');
     * };
     * adapter.addRequestInterceptor(interceptor);
     *
     * ```
     *
     * If second parameter specified, registered interceptor will be called only
     * before requests related to specified resource type:
     *
     * ```typescript
     * const resType: ResourceType<User> = User;
     * const interceptor: RequestInterceptor = (options: RequestOptions) => {
     *   // ... perform some work here
     * };
     * adapter.addRequestInterceptor(interceptor, resType);
     * ```
     */
    addRequestInterceptor<T extends Resource>(
        interceptor: RequestInterceptor,
        resType: ResourceType<T>|string = 'global'
    ): JsonApiStoreAdapter {
        if (!this.reqInterceptors.has(resType)) {
            this.reqInterceptors.set(resType, new Set());
        }

        this.reqInterceptors.get(resType).add(interceptor);

        return this;
    }

    /**
     * Register response interceptor
     *
     * You can use {@link ResponseInterceptor} to adjust response before
     * it will be processed by `JsonApiStoreAdapter'.
     */
    addResponseInterceptor<T extends Resource>(
        interceptor: ResponseInterceptor,
        resType: ResourceType<T>|string = 'global'
    ): JsonApiStoreAdapter {
        if (!this.respInterceptors.has(resType)) {
            this.respInterceptors.set(resType, new Set());
        }

        this.respInterceptors.get(resType).add(interceptor);

        return this;
    }

    /**
     * Register errors interceptor
     */
    addErrorInterceptor<T extends Resource>(
        interceptor: ErrorInterceptor,
        resType: ResourceType<T>|string = 'global'
    ): JsonApiStoreAdapter {
        if (!this.errInterceptors.has(resType)) {
            this.errInterceptors.set(resType, new Set());
        }

        this.errInterceptors.get(resType).add(interceptor);

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

    updateAll<T extends Resource>(
        resType: ResourceType<T>,
        payload: ApiDocument,
        params?: any
    ): Observable<ApiDocument> {
        const url = this.urlBuilder.getResourceListUrl(resType);

        return this.sendRequest(resType, url, RequestMethod.Patch, params, payload);
    }

    remove<T extends Resource>(resType: ResourceType<T>, id: string, params?: any): Observable<ApiDocument> {
        const url = this.urlBuilder.getResourceUrl(resType, id);

        return this.sendRequest(resType, url, RequestMethod.Delete, params);
    }

    removeAll<T extends Resource>(
        resType: ResourceType<T>,
        payalod: ApiDocument,
        params?: any
    ): Observable<ApiDocument> {
        const url = this.urlBuilder.getResourceListUrl(resType);

        return this.sendRequest(resType, url, RequestMethod.Delete, params, payalod);
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
            .map((response: Response) => this.parseResponse(resType, method, response))
            .catch((error: any|Response) => this.handleError(resType, error));
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

        if (this.reqInterceptors.has('global')) {
            this.reqInterceptors.get('global').forEach((interceptor: RequestInterceptor) => {
                interceptor(options);
            });
        }

        if (this.reqInterceptors.has(resType)) {
            this.reqInterceptors.get(resType).forEach((interceptor: RequestInterceptor) => {
                interceptor(options);
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

    private parseResponse<T extends Resource>(
        resType: ResourceType<T>,
        method: RequestMethod,
        response: Response
    ): ApiDocument {
        if (this.respInterceptors.has('global')) {
            this.respInterceptors.get('global').forEach((interceptor: ResponseInterceptor) => {
                interceptor(response, method);
            });
        }

        if (this.respInterceptors.has(resType)) {
            this.respInterceptors.get(resType).forEach((interceptor: ResponseInterceptor) => {
                interceptor(response, method);
            });
        }

        return response.json();
    }

    private handleError<T extends Resource>(
        resType: ResourceType<T>,
        error: any|Response
    ): ObservableInput<ApiDocument> {
        if (this.errInterceptors.has('global')) {
            this.errInterceptors.get('global').forEach((interceptor: ErrorInterceptor) => {
                interceptor(error);
            });
        }

        if (this.errInterceptors.has(resType)) {
            this.errInterceptors.get(resType).forEach((interceptor: ErrorInterceptor) => {
                interceptor(error);
            });
        }

        let doc: ApiDocument;
        if (error instanceof Response) {
            doc = <ApiDocument>error.json();
        } else {
            doc = {
                errors: [
                    {
                        id: Math.random().toString(),
                        status: '400',
                        title: error.toString()
                    }
                ]
            };
        }

        return Observable.throw(doc);
    }
}