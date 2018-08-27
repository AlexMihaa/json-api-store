import {HttpParams} from "@angular/common/http";

export class JsonApiParamsParser {

    parse(data: Object|string): HttpParams {
        if ('string' === typeof data) {
            return new HttpParams({fromString: data});
        }

        return this.serializeData(data, new HttpParams());
    }

    private serializeData(data: any, params: HttpParams, prefix: string = ''): HttpParams {
        for (let property in data) {
            if (!data.hasOwnProperty(property)) {
                continue;
            }

            const paramName = (prefix) ? prefix + '[' + property + ']' : property;

            if (Array.isArray(data[property])) {
                params = params.set(paramName, data[property].join(','));
            } else if (data[property] instanceof Object) {
                params = this.serializeData(data[property], params, paramName);
            } else {
                params = params.set(paramName, data[property].toString());
            }
        }

        return params;
    }
}