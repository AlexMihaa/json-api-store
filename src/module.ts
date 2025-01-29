import {ModuleWithProviders, NgModule} from '@angular/core';
import {provideHttpClient, withInterceptorsFromDi} from "@angular/common/http";

import {JSON_API_BASE_URL, JsonApiParamsParser, JsonApiStore, JsonApiStoreAdapter, JsonApiUrlBuilder} from './services';
import {JsonApiDocumentSerializer, JsonApiResourceSerializer} from './serializers';

@NgModule({})
export class JsonApiModule {
  public static forRoot(apiUrl: string): ModuleWithProviders<JsonApiModule> {
    return {
      ngModule: JsonApiModule,
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        {provide: JSON_API_BASE_URL, useValue: apiUrl},
        JsonApiResourceSerializer,
        JsonApiDocumentSerializer,
        JsonApiUrlBuilder,
        JsonApiParamsParser,
        JsonApiStoreAdapter,
        JsonApiStore
      ]
    };
  }
}
