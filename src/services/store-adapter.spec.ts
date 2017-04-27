import { inject, TestBed } from '@angular/core/testing';
import {
    BaseRequestOptions,
    Http,
    HttpModule,
    RequestMethod,
    RequestOptions,
    Response,
    ResponseOptions
} from '@angular/http';
import { MockBackend, MockConnection } from '@angular/http/testing';


import { JsonApiParamsParser } from './params-parser';
import { JSON_API_BASE_URL, JsonApiUrlBuilder } from './url-builder';
import { ApiDocument, RequestInterceptor, ResponseInterceptor } from '../contracts';
import { JsonApiStoreAdapter } from './store-adapter';
import { User } from '../../test/models/user.model';
import { ApiError } from '../contracts/api/error';

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
            (
                _builder: JsonApiUrlBuilder,
                _parser: JsonApiParamsParser,
                _adapter: JsonApiStoreAdapter,
                _backend: MockBackend
            ) => {
                backend = _backend;
                builder = _builder;
                parser = _parser;
                adapter = _adapter;
            }
        ));

        it('should load single resource', () => {
            const userId = '123';
            const response: ApiDocument = require('../../test/documents/user.json');
            const params = {
                include: ['offices', 'user-roles']
            };

            const gReqInterceptor: RequestInterceptor = jasmine.createSpy('TestGlobalReqInterceptor');
            const gRespInterceptor: ResponseInterceptor = jasmine.createSpy('TestGlobalRespInterceptor');
            const rReqInterceptor: RequestInterceptor = jasmine.createSpy('TestResourceReqInterceptor');
            const rRespInterceptor: ResponseInterceptor = jasmine.createSpy('TestResourceRespInterceptor');

            const expectedMediaType = 'application/vnd.api+json';
            const expectedUrl = builder.getResourceUrl(User, userId) + '?' + parser.parse(params).toString();

            spyOn(builder, 'getResourceUrl').and.callThrough();
            spyOn(parser, 'parse').and.callThrough();

            backend.connections.subscribe((connection: MockConnection) => {
                const req = connection.request;

                expect(req.url).toEqual(expectedUrl);
                expect(req.method).toEqual(RequestMethod.Get);
                expect(req.headers.get('Content-Type')).toEqual(expectedMediaType);
                expect(req.headers.get('Accept')).toEqual(expectedMediaType);

                connection.mockRespond(new Response(new ResponseOptions({
                    body: JSON.stringify(response)
                })));
            });

            adapter.addRequestInterceptor(gReqInterceptor);
            adapter.addRequestInterceptor(rReqInterceptor, User);
            adapter.addResponseInterceptor(gRespInterceptor);
            adapter.addResponseInterceptor(rRespInterceptor, User);
            adapter.get(User, userId, params).subscribe((doc: ApiDocument) => {
                expect(doc).toEqual(response);

                expect(builder.getResourceUrl).toHaveBeenCalledWith(User, userId);
                expect(parser.parse).toHaveBeenCalledWith(params);

                expect(gReqInterceptor).toHaveBeenCalledTimes(1);
                expect((<any>gReqInterceptor).calls.mostRecent().args[0] instanceof  RequestOptions).toBeTruthy();

                expect(rReqInterceptor).toHaveBeenCalledTimes(1);
                expect((<any>rReqInterceptor).calls.mostRecent().args[0] instanceof RequestOptions).toBeTruthy();

                expect(gRespInterceptor).toHaveBeenCalledTimes(1);
                const gRespInterceptorArgs = (<any>rRespInterceptor).calls.mostRecent().args;
                expect(gRespInterceptorArgs[0] instanceof Response).toBeTruthy();
                expect(gRespInterceptorArgs[1]).toEqual(RequestMethod.Get);

                expect(rRespInterceptor).toHaveBeenCalledTimes(1);
                const rRespInterceptorArgs = (<any>rRespInterceptor).calls.mostRecent().args;
                expect(rRespInterceptorArgs[0] instanceof Response).toBeTruthy();
                expect(rRespInterceptorArgs[1]).toEqual(RequestMethod.Get);
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

            const gReqInterceptor: RequestInterceptor = jasmine.createSpy('TestGlobalReqInterceptor');
            const gRespInterceptor: ResponseInterceptor = jasmine.createSpy('TestGlobalRespInterceptor');
            const rReqInterceptor: RequestInterceptor = jasmine.createSpy('TestResourceReqInterceptor');
            const rRespInterceptor: ResponseInterceptor = jasmine.createSpy('TestResourceRespInterceptor');

            const expectedMediaType = 'application/vnd.api+json';
            const expectedUrl = builder.getResourceListUrl(User) + '?' + parser.parse(params).toString();

            spyOn(builder, 'getResourceListUrl').and.callThrough();
            spyOn(parser, 'parse').and.callThrough();

            backend.connections.subscribe((connection: MockConnection) => {
                const req = connection.request;

                expect(req.url).toEqual(expectedUrl);
                expect(req.method).toEqual(RequestMethod.Get);
                expect(req.headers.get('Content-Type')).toEqual(expectedMediaType);
                expect(req.headers.get('Accept')).toEqual(expectedMediaType);

                connection.mockRespond(new Response(new ResponseOptions({
                    body: JSON.stringify(response)
                })));
            });

            adapter.addRequestInterceptor(gReqInterceptor);
            adapter.addRequestInterceptor(rReqInterceptor, User);
            adapter.addResponseInterceptor(gRespInterceptor);
            adapter.addResponseInterceptor(rRespInterceptor, User);
            adapter.getList(User, params).subscribe((doc: ApiDocument) => {
                expect(doc).toEqual(response);

                expect(builder.getResourceListUrl).toHaveBeenCalledWith(User);
                expect(parser.parse).toHaveBeenCalledWith(params);

                expect(gReqInterceptor).toHaveBeenCalledTimes(1);
                expect((<any>gReqInterceptor).calls.mostRecent().args[0] instanceof  RequestOptions).toBeTruthy();

                expect(rReqInterceptor).toHaveBeenCalledTimes(1);
                expect((<any>rReqInterceptor).calls.mostRecent().args[0] instanceof RequestOptions).toBeTruthy();

                expect(gRespInterceptor).toHaveBeenCalledTimes(1);
                const gRespInterceptorArgs = (<any>rRespInterceptor).calls.mostRecent().args;
                expect(gRespInterceptorArgs[0] instanceof Response).toBeTruthy();
                expect(gRespInterceptorArgs[1]).toEqual(RequestMethod.Get);

                expect(rRespInterceptor).toHaveBeenCalledTimes(1);
                const rRespInterceptorArgs = (<any>rRespInterceptor).calls.mostRecent().args;
                expect(rRespInterceptorArgs[0] instanceof Response).toBeTruthy();
                expect(rRespInterceptorArgs[1]).toEqual(RequestMethod.Get);
            });
        });

        it('should create new resource', () => {
            const params = {include: ['offices', 'user-roles']};
            const payload = require('../../test/documents/create-user.json');
            const response = require('../../test/documents/user.json');

            const gReqInterceptor: RequestInterceptor = jasmine.createSpy('TestGlobalReqInterceptor');
            const gRespInterceptor: ResponseInterceptor = jasmine.createSpy('TestGlobalRespInterceptor');
            const rReqInterceptor: RequestInterceptor = jasmine.createSpy('TestResourceReqInterceptor');
            const rRespInterceptor: ResponseInterceptor = jasmine.createSpy('TestResourceRespInterceptor');

            const expectedMediaType = 'application/vnd.api+json';
            const expectedUrl = builder.getResourceListUrl(User) + '?' + parser.parse(params).toString();

            spyOn(builder, 'getResourceListUrl').and.callThrough();
            spyOn(parser, 'parse').and.callThrough();

            backend.connections.subscribe((connection: MockConnection) => {
                const req = connection.request;

                expect(req.url).toEqual(expectedUrl);
                expect(req.method).toEqual(RequestMethod.Post);
                expect(JSON.parse(req.getBody())).toEqual(payload);
                expect(req.headers.get('Content-Type')).toEqual(expectedMediaType);
                expect(req.headers.get('Accept')).toEqual(expectedMediaType);

                connection.mockRespond(new Response(new ResponseOptions({
                    status: 201,
                    body: JSON.stringify(response)
                })));
            });

            adapter.addRequestInterceptor(gReqInterceptor);
            adapter.addRequestInterceptor(rReqInterceptor, User);
            adapter.addResponseInterceptor(gRespInterceptor);
            adapter.addResponseInterceptor(rRespInterceptor, User);
            adapter.create(User, payload, params).subscribe((doc: ApiDocument) => {
                expect(doc).toEqual(response);

                expect(builder.getResourceListUrl).toHaveBeenCalledWith(User);
                expect(parser.parse).toHaveBeenCalledWith(params);

                expect(gReqInterceptor).toHaveBeenCalledTimes(1);
                expect((<any>gReqInterceptor).calls.mostRecent().args[0] instanceof  RequestOptions).toBeTruthy();

                expect(rReqInterceptor).toHaveBeenCalledTimes(1);
                expect((<any>rReqInterceptor).calls.mostRecent().args[0] instanceof RequestOptions).toBeTruthy();

                expect(gRespInterceptor).toHaveBeenCalledTimes(1);
                const gRespInterceptorArgs = (<any>rRespInterceptor).calls.mostRecent().args;
                expect(gRespInterceptorArgs[0] instanceof Response).toBeTruthy();
                expect(gRespInterceptorArgs[1]).toEqual(RequestMethod.Post);

                expect(rRespInterceptor).toHaveBeenCalledTimes(1);
                const rRespInterceptorArgs = (<any>rRespInterceptor).calls.mostRecent().args;
                expect(rRespInterceptorArgs[0] instanceof Response).toBeTruthy();
                expect(rRespInterceptorArgs[1]).toEqual(RequestMethod.Post);
            });
        });

        it('should update single resource', () => {
            const id = '123';
            const params = {include: ['offices', 'user-roles']};
            const payload = require('../../test/documents/update-user.json');
            const response = require('../../test/documents/user.json');

            const gReqInterceptor: RequestInterceptor = jasmine.createSpy('TestGlobalReqInterceptor');
            const gRespInterceptor: ResponseInterceptor = jasmine.createSpy('TestGlobalRespInterceptor');
            const rReqInterceptor: RequestInterceptor = jasmine.createSpy('TestResourceReqInterceptor');
            const rRespInterceptor: ResponseInterceptor = jasmine.createSpy('TestResourceRespInterceptor');

            const expectedMediaType = 'application/vnd.api+json';
            const expectedUrl = builder.getResourceUrl(User, id) + '?' + parser.parse(params).toString();

            spyOn(builder, 'getResourceUrl').and.callThrough();
            spyOn(parser, 'parse').and.callThrough();

            backend.connections.subscribe((connection: MockConnection) => {
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

            adapter.addRequestInterceptor(gReqInterceptor);
            adapter.addRequestInterceptor(rReqInterceptor, User);
            adapter.addResponseInterceptor(gRespInterceptor);
            adapter.addResponseInterceptor(rRespInterceptor, User);
            adapter.update(User, id, payload, params).subscribe((doc: ApiDocument) => {
                expect(doc).toEqual(response);

                expect(builder.getResourceUrl).toHaveBeenCalledWith(User, id);
                expect(parser.parse).toHaveBeenCalledWith(params);

                expect(gReqInterceptor).toHaveBeenCalledTimes(1);
                expect((<any>gReqInterceptor).calls.mostRecent().args[0] instanceof  RequestOptions).toBeTruthy();

                expect(rReqInterceptor).toHaveBeenCalledTimes(1);
                expect((<any>rReqInterceptor).calls.mostRecent().args[0] instanceof RequestOptions).toBeTruthy();

                expect(gRespInterceptor).toHaveBeenCalledTimes(1);
                const gRespInterceptorArgs = (<any>rRespInterceptor).calls.mostRecent().args;
                expect(gRespInterceptorArgs[0] instanceof Response).toBeTruthy();
                expect(gRespInterceptorArgs[1]).toEqual(RequestMethod.Patch);

                expect(rRespInterceptor).toHaveBeenCalledTimes(1);
                const rRespInterceptorArgs = (<any>rRespInterceptor).calls.mostRecent().args;
                expect(rRespInterceptorArgs[0] instanceof Response).toBeTruthy();
                expect(rRespInterceptorArgs[1]).toEqual(RequestMethod.Patch);
            });
        });

        it('should update all specified resources', () => {
            const payload = require('../../test/documents/update-users.json');
            const params = {include: ["offices", "user-roles"]};
            const response = require('../../test/documents/users.json');

            const gReqInterceptor: RequestInterceptor = jasmine.createSpy('TestGlobalReqInterceptor');
            const gRespInterceptor: ResponseInterceptor = jasmine.createSpy('TestGlobalRespInterceptor');
            const rReqInterceptor: RequestInterceptor = jasmine.createSpy('TestResourceReqInterceptor');
            const rRespInterceptor: ResponseInterceptor = jasmine.createSpy('TestResourceRespInterceptor');

            const expectedMediaType = 'application/vnd.api+json';
            const expectedUrl = builder.getResourceListUrl(User) + '?' + parser.parse(params).toString();

            spyOn(builder, 'getResourceListUrl').and.callThrough();
            spyOn(parser, 'parse').and.callThrough();

            backend.connections.subscribe((connection: MockConnection) => {
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

            adapter.addRequestInterceptor(gReqInterceptor);
            adapter.addRequestInterceptor(rReqInterceptor, User);
            adapter.addResponseInterceptor(gRespInterceptor);
            adapter.addResponseInterceptor(rRespInterceptor, User);
            adapter.updateAll(User, payload, params).subscribe((doc: ApiDocument) => {
                expect(doc).toEqual(response);

                expect(builder.getResourceListUrl).toHaveBeenCalledWith(User);
                expect(parser.parse).toHaveBeenCalledWith(params);

                expect(gReqInterceptor).toHaveBeenCalledTimes(1);
                expect((<any>gReqInterceptor).calls.mostRecent().args[0] instanceof  RequestOptions).toBeTruthy();

                expect(rReqInterceptor).toHaveBeenCalledTimes(1);
                expect((<any>rReqInterceptor).calls.mostRecent().args[0] instanceof RequestOptions).toBeTruthy();

                expect(gRespInterceptor).toHaveBeenCalledTimes(1);
                const gRespInterceptorArgs = (<any>rRespInterceptor).calls.mostRecent().args;
                expect(gRespInterceptorArgs[0] instanceof Response).toBeTruthy();
                expect(gRespInterceptorArgs[1]).toEqual(RequestMethod.Patch);

                expect(rRespInterceptor).toHaveBeenCalledTimes(1);
                const rRespInterceptorArgs = (<any>rRespInterceptor).calls.mostRecent().args;
                expect(rRespInterceptorArgs[0] instanceof Response).toBeTruthy();
                expect(rRespInterceptorArgs[1]).toEqual(RequestMethod.Patch);
            });
        });

        it('should delete single resource', () => {
            const id = '123';

            const gReqInterceptor: RequestInterceptor = jasmine.createSpy('TestGlobalReqInterceptor');
            const gRespInterceptor: ResponseInterceptor = jasmine.createSpy('TestGlobalRespInterceptor');
            const rReqInterceptor: RequestInterceptor = jasmine.createSpy('TestResourceReqInterceptor');
            const rRespInterceptor: ResponseInterceptor = jasmine.createSpy('TestResourceRespInterceptor');

            const expectedMediaType = 'application/vnd.api+json';
            const expectedUrl = builder.getResourceUrl(User, id);

            spyOn(builder, 'getResourceUrl').and.callThrough();

            backend.connections.subscribe((connection: MockConnection) => {
                const req = connection.request;

                expect(req.url).toEqual(expectedUrl);
                expect(req.method).toEqual(RequestMethod.Delete);
                expect(req.headers.get('Content-Type')).toEqual(expectedMediaType);
                expect(req.headers.get('Accept')).toEqual(expectedMediaType);

                connection.mockRespond(new Response(new ResponseOptions({
                    status: 204
                })));
            });

            adapter.addRequestInterceptor(gReqInterceptor);
            adapter.addRequestInterceptor(rReqInterceptor, User);
            adapter.addResponseInterceptor(gRespInterceptor);
            adapter.addResponseInterceptor(rRespInterceptor, User);
            adapter.remove(User, id).subscribe((doc: ApiDocument) => {
                expect(doc).toBeNull();

                expect(builder.getResourceUrl).toHaveBeenCalledWith(User, id);

                expect(gReqInterceptor).toHaveBeenCalledTimes(1);
                expect((<any>gReqInterceptor).calls.mostRecent().args[0] instanceof  RequestOptions).toBeTruthy();

                expect(rReqInterceptor).toHaveBeenCalledTimes(1);
                expect((<any>rReqInterceptor).calls.mostRecent().args[0] instanceof RequestOptions).toBeTruthy();

                expect(gRespInterceptor).toHaveBeenCalledTimes(1);
                const gRespInterceptorArgs = (<any>rRespInterceptor).calls.mostRecent().args;
                expect(gRespInterceptorArgs[0] instanceof Response).toBeTruthy();
                expect(gRespInterceptorArgs[1]).toEqual(RequestMethod.Delete);

                expect(rRespInterceptor).toHaveBeenCalledTimes(1);
                const rRespInterceptorArgs = (<any>rRespInterceptor).calls.mostRecent().args;
                expect(rRespInterceptorArgs[0] instanceof Response).toBeTruthy();
                expect(rRespInterceptorArgs[1]).toEqual(RequestMethod.Delete);
            });
        });

        it('should delete all specified resources', () => {
            const payload = require('../../test/documents/delete-users.json');

            const gReqInterceptor: RequestInterceptor = jasmine.createSpy('TestGlobalReqInterceptor');
            const gRespInterceptor: ResponseInterceptor = jasmine.createSpy('TestGlobalRespInterceptor');
            const rReqInterceptor: RequestInterceptor = jasmine.createSpy('TestResourceReqInterceptor');
            const rRespInterceptor: ResponseInterceptor = jasmine.createSpy('TestResourceRespInterceptor');

            const expectedMediaType = 'application/vnd.api+json';
            const expectedUrl = builder.getResourceListUrl(User);

            spyOn(builder, 'getResourceListUrl').and.callThrough();

            backend.connections.subscribe((connection: MockConnection) => {
                const req = connection.request;

                expect(req.url).toEqual(expectedUrl);
                expect(req.method).toEqual(RequestMethod.Delete);
                expect(JSON.parse(req.getBody())).toEqual(payload);
                expect(req.headers.get('Content-Type')).toEqual(expectedMediaType);
                expect(req.headers.get('Accept')).toEqual(expectedMediaType);

                connection.mockRespond(new Response(new ResponseOptions({
                    status: 204
                })));
            });

            adapter.addRequestInterceptor(gReqInterceptor);
            adapter.addRequestInterceptor(rReqInterceptor, User);
            adapter.addResponseInterceptor(gRespInterceptor);
            adapter.addResponseInterceptor(rRespInterceptor, User);
            adapter.removeAll(User, payload).subscribe((doc: ApiDocument) => {
                expect(doc).toBeNull();

                expect(builder.getResourceListUrl).toHaveBeenCalledWith(User);

                expect(gReqInterceptor).toHaveBeenCalledTimes(1);
                expect((<any>gReqInterceptor).calls.mostRecent().args[0] instanceof  RequestOptions).toBeTruthy();

                expect(rReqInterceptor).toHaveBeenCalledTimes(1);
                expect((<any>rReqInterceptor).calls.mostRecent().args[0] instanceof RequestOptions).toBeTruthy();

                expect(gRespInterceptor).toHaveBeenCalledTimes(1);
                const gRespInterceptorArgs = (<any>rRespInterceptor).calls.mostRecent().args;
                expect(gRespInterceptorArgs[0] instanceof Response).toBeTruthy();
                expect(gRespInterceptorArgs[1]).toEqual(RequestMethod.Delete);

                expect(rRespInterceptor).toHaveBeenCalledTimes(1);
                const rRespInterceptorArgs = (<any>rRespInterceptor).calls.mostRecent().args;
                expect(rRespInterceptorArgs[0] instanceof Response).toBeTruthy();
                expect(rRespInterceptorArgs[1]).toEqual(RequestMethod.Delete);
            });
        });

        it('should handle API errors', () => {
            const response: Response = new Response(new ResponseOptions({
                status: 404,
                body: JSON.stringify(require('../../test/documents/errors-response.json'))
            }));

            backend.connections.subscribe((connection: MockConnection) => {
                connection.mockError(response as any as Error);
            });

            const gErrorInterceptor = jasmine.createSpy('gErrorInterceptor');
            const rErrorInterceptor = jasmine.createSpy('rErrorInterceptor');

            adapter.addErrorInterceptor(gErrorInterceptor);
            adapter.addErrorInterceptor(rErrorInterceptor, User);
            adapter.get(User, '1').subscribe(
                () => {
                    fail('This response should trigger error');
                },
                (error: ApiDocument) => {
                    expect(error).toEqual(response.json());

                    expect(gErrorInterceptor).toHaveBeenCalledTimes(1);
                    expect((<any>gErrorInterceptor).calls.mostRecent().args[0]).toEqual(response);

                    expect(rErrorInterceptor).toHaveBeenCalledTimes(1);
                    expect((<any>rErrorInterceptor).calls.mostRecent().args[0]).toEqual(response);
                }
            );
        });

        it('should handle general errors', () => {
            const error = new Error('Test error');

            backend.connections.subscribe((connection: MockConnection) => {
                connection.mockError(error);
            });

            const gErrorInterceptor = jasmine.createSpy('gErrorInterceptor');
            const rErrorInterceptor = jasmine.createSpy('rErrorInterceptor');

            adapter.addErrorInterceptor(gErrorInterceptor);
            adapter.addErrorInterceptor(rErrorInterceptor, User);
            adapter.get(User, '1').subscribe(
                () => {
                    fail('This response should trigger error');
                },
                (err: ApiDocument) => {
                    expect(typeof err).toEqual('object');
                    expect(Array.isArray(err.errors)).toBeTruthy();
                    expect(err.errors.length).toEqual(1);

                    const details: ApiError = err.errors[0];
                    expect(typeof details.id).toEqual('string');
                    expect(details.status).toEqual('400');
                    expect(details.title).toEqual(error.toString());

                    expect(gErrorInterceptor).toHaveBeenCalledTimes(1);
                    expect((<any>gErrorInterceptor).calls.mostRecent().args[0]).toEqual(error);

                    expect(rErrorInterceptor).toHaveBeenCalledTimes(1);
                    expect((<any>rErrorInterceptor).calls.mostRecent().args[0]).toEqual(error);
                }
            );
        });
    });
});