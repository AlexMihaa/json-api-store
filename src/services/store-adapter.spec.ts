import { getTestBed, inject, TestBed } from '@angular/core/testing';
import {
    BaseRequestOptions, Http, HttpModule, RequestMethod, RequestOptions, Response, ResponseOptions,
    XHRBackend
} from '@angular/http';
import { MockBackend } from '@angular/http/testing';
import { async } from "@angular/core/testing";

import { JsonApiParamsParser } from './params-parser';
import { JSON_API_BASE_URL, JsonApiUrlBuilder } from './url-builder';
import { JsonApiStoreAdapter } from './store-adapter';
import { ApiDocument } from '../contracts';
import { User } from '../../test/models/user.model';

describe("Services", () => {
    describe('JsonApiStoreAdapter', () => {
        let backend: MockBackend;
        let builder: JsonApiUrlBuilder;
        let parser: JsonApiParamsParser;
        let adapter: JsonApiStoreAdapter;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [HttpModule],
                providers: [
                    { provide: JSON_API_BASE_URL, useValue: 'http://api.com/v1'},
                    JsonApiUrlBuilder,
                    JsonApiParamsParser,
                    JsonApiStoreAdapter,
                    MockBackend,
                    BaseRequestOptions,
                    {
                        provide: Http,
                        useFactory: (mockBackend: MockBackend, defaultOptions: RequestOptions) => {
                            return new Http(mockBackend, defaultOptions);
                        },
                        deps: [MockBackend, BaseRequestOptions]
                    }
                ]
            });
        });

        beforeEach(inject(
            [JsonApiUrlBuilder, JsonApiParamsParser, JsonApiStoreAdapter, MockBackend],
            (_builder, _parser, _adapter, _backend) => {
                backend = _backend;
                builder = _builder;
                parser = _parser;
                adapter = _adapter
            }
        ));

        it('should load single resource', () => {
            const userId = '123';
            const response: ApiDocument = require('../../test/documents/user.json');
            const params = {
                include: ['offices', 'user-roles']
            };

            const expectedMediaType = 'application/vnd.api+json';
            const expectedUrl = builder.getResourceUrl(User, userId) + '?' + parser.parse(params).toString();

            spyOn(builder, 'getResourceUrl').and.callThrough();
            spyOn(parser, 'parse').and.callThrough();

            backend.connections.subscribe((connection) => {
                const req = connection.request;

                expect(req.url).toEqual(expectedUrl);
                expect(req.method).toEqual(RequestMethod.Get);
                expect(req.headers.get('Content-Type')).toEqual(expectedMediaType);
                expect(req.headers.get('Accept')).toEqual(expectedMediaType);

                connection.mockRespond(new Response(new ResponseOptions({
                    body: JSON.stringify(response)
                })));
            });

            adapter.get(User, userId, params).subscribe((doc: ApiDocument) => {
                expect(doc).toEqual(response);

                expect(builder.getResourceUrl).toHaveBeenCalledWith(User, userId);
                expect(parser.parse).toHaveBeenCalledWith(params);
            });
        });

        it('should load list of resources', () => {
            const response: ApiDocument = require('../../test/documents/user.json');
            const params = {
                include: ['offices', 'user-roles'],
                page: {
                    number: 1,
                    size: 10
                }
            };

            const expectedMediaType = 'application/vnd.api+json';
            const expectedUrl = builder.getResourceListUrl(User) + '?' + parser.parse(params).toString();

            spyOn(builder, 'getResourceListUrl').and.callThrough();
            spyOn(parser, 'parse').and.callThrough();

            backend.connections.subscribe((connection) => {
                const req = connection.request;

                expect(req.url).toEqual(expectedUrl);
                expect(req.method).toEqual(RequestMethod.Get);
                expect(req.headers.get('Content-Type')).toEqual(expectedMediaType);
                expect(req.headers.get('Accept')).toEqual(expectedMediaType);

                connection.mockRespond(new Response(new ResponseOptions({
                    body: JSON.stringify(response)
                })));
            });

            adapter.getList(User, params).subscribe((doc: ApiDocument) => {
                expect(doc).toEqual(response);

                expect(builder.getResourceListUrl).toHaveBeenCalledWith(User);
                expect(parser.parse).toHaveBeenCalledWith(params);
            });
        });

        it('should create new resource', () => {
            const params = {include: ['offices', 'user-roles']};
            const payload = require('../../test/documents/create-user.json');
            const response = require('../../test/documents/user.json');

            const expectedMediaType = 'application/vnd.api+json';
            const expectedUrl = builder.getResourceListUrl(User) + '?' + parser.parse(params).toString();

            spyOn(builder, 'getResourceListUrl').and.callThrough();
            spyOn(parser, 'parse').and.callThrough();

            backend.connections.subscribe((connection) => {
                const req = connection.request;

                expect(req.url).toEqual(expectedUrl);
                expect(req.method).toEqual(RequestMethod.Post);
                expect(JSON.parse(req.getBody())).toEqual(payload);
                expect(req.headers.get('Content-Type')).toEqual(expectedMediaType);
                expect(req.headers.get('Accept')).toEqual(expectedMediaType);

                connection.mockRespond(new Response(new ResponseOptions({
                    body: JSON.stringify(response)
                })));
            });

            adapter.create(User, payload, params).subscribe((doc: ApiDocument) => {
                expect(doc).toEqual(response);

                expect(builder.getResourceListUrl).toHaveBeenCalledWith(User);
                expect(parser.parse).toHaveBeenCalledWith(params);
            });
        });

        it('should update existing resource', () => {
            const id = '123';
            const params = {include: ['offices', 'user-roles']};
            const payload = require('../../test/documents/update-user.json');
            const response = require('../../test/documents/user.json');

            const expectedMediaType = 'application/vnd.api+json';
            const expectedUrl = builder.getResourceUrl(User, id) + '?' + parser.parse(params).toString();

            spyOn(builder, 'getResourceUrl').and.callThrough();
            spyOn(parser, 'parse').and.callThrough();

            backend.connections.subscribe((connection) => {
                const req = connection.request;

                expect(req.url).toEqual(expectedUrl);
                expect(req.method).toEqual(RequestMethod.Patch);
                expect(JSON.parse(req.getBody())).toEqual(payload);
                expect(req.headers.get('Content-Type')).toEqual(expectedMediaType);
                expect(req.headers.get('Accept')).toEqual(expectedMediaType);

                connection.mockRespond(new Response(new ResponseOptions({
                    body: JSON.stringify(response)
                })));
            });

            adapter.update(User, id, payload, params).subscribe((doc: ApiDocument) => {
                expect(doc).toEqual(response);

                expect(builder.getResourceUrl).toHaveBeenCalledWith(User, id);
                expect(parser.parse).toHaveBeenCalledWith(params);
            });
        });

        it('should delete existing resource', () => {
            const id = '123';
            const params = {include: ['offices', 'user-roles']};
            const response = require('../../test/documents/user.json');

            const expectedMediaType = 'application/vnd.api+json';
            const expectedUrl = builder.getResourceUrl(User, id) + '?' + parser.parse(params).toString();

            spyOn(builder, 'getResourceUrl').and.callThrough();
            spyOn(parser, 'parse').and.callThrough();

            backend.connections.subscribe((connection) => {
                const req = connection.request;

                expect(req.url).toEqual(expectedUrl);
                expect(req.method).toEqual(RequestMethod.Delete);
                expect(req.headers.get('Content-Type')).toEqual(expectedMediaType);
                expect(req.headers.get('Accept')).toEqual(expectedMediaType);

                connection.mockRespond(new Response(new ResponseOptions({
                    body: JSON.stringify(response)
                })));
            });

            adapter.remove(User, id, params).subscribe((doc: ApiDocument) => {
                expect(doc).toEqual(response);

                expect(builder.getResourceUrl).toHaveBeenCalledWith(User, id);
                expect(parser.parse).toHaveBeenCalledWith(params);
            });
        });
    });
});