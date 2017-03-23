import { NgModule, ModuleWithProviders } from '@angular/core';
import { JsonApiStore } from './json-api.store';

@NgModule({})
export class JsonApiModule {

    public static forRoot(): ModuleWithProviders {
        return {
            ngModule: JsonApiModule,
            providers: [
                JsonApiStore
            ]
        };
    }
}