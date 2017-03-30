import { NgModule, ModuleWithProviders } from '@angular/core';
import { HttpModule } from '@angular/http';

import { JsonApiStore } from './json-api.store';

@NgModule({
    imports: [
        HttpModule
    ]
})
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