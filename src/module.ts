import { NgModule, ModuleWithProviders } from '@angular/core';
import { HttpModule } from '@angular/http';

import {
    JSON_API_BASE_URL,
    JsonApiUrlBuilder,
    JsonApiParamsParser,
    JsonApiStoreAdapter,
    JsonApiStore
} from './services';
import { JsonApiResourceSerializer, JsonApiDocumentSerializer } from './serializers';

@NgModule({
    imports: [
        HttpModule
    ]
})
export class JsonApiModule {
    public static forRoot(apiUrl: string): ModuleWithProviders {
        return {
            ngModule: JsonApiModule,
            providers: [
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