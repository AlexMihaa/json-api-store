import { HttpClientModule } from "@angular/common/http";
import { TestBed } from '@angular/core/testing';

import { JsonApiModule } from './module';
import { JsonApiStore, JsonApiUrlBuilder, JsonApiParamsParser, JsonApiStoreAdapter } from './services';
import { JsonApiResourceSerializer, JsonApiDocumentSerializer } from './serializers';

describe('JsonApiModule', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        JsonApiModule.forRoot('http://api.org/v1')
      ]
    });
  });

  it('should provide resource serializer', () => {
    const serializer = TestBed.inject(JsonApiResourceSerializer);

    expect(serializer).toBeDefined();
    expect(serializer instanceof JsonApiResourceSerializer).toBeTruthy();
  });

  it('should provide document serializer', () => {
    const serializer = TestBed.inject(JsonApiDocumentSerializer);

    expect(serializer).toBeDefined();
    expect(serializer instanceof JsonApiDocumentSerializer).toBeTruthy();
  });

  it('should provide URL builder', () => {
    const builder = TestBed.inject(JsonApiUrlBuilder);

    expect(builder).toBeDefined();
    expect(builder instanceof JsonApiUrlBuilder).toBeTruthy();
  });

  it('should provide parameters parser', () => {
    const parser = TestBed.inject(JsonApiParamsParser);

    expect(parser).toBeDefined();
    expect(parser instanceof JsonApiParamsParser).toBeTruthy();
  });

  it('should provide store adapter', () => {
    const adapter = TestBed.inject(JsonApiStoreAdapter);

    expect(adapter).toBeDefined();
    expect(adapter instanceof JsonApiStoreAdapter);
  });

  it('should provide store', () => {
    const store = TestBed.inject(JsonApiStore);

    expect(store).toBeDefined();
    expect(store instanceof JsonApiStore).toBeTruthy();
  });
});
