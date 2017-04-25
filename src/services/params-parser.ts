import { URLSearchParams } from '@angular/http';

export class JsonApiParamsParser {

    parse(data: Object|string): URLSearchParams {
        if ('string' === typeof data) {
            return new URLSearchParams(data);
        }

        return this.serializeData(data, new URLSearchParams());
    }

    private serializeData(data: any, params: URLSearchParams, prefix: string = ''): URLSearchParams {
        for (let property in data) {
            if (!data.hasOwnProperty(property)) {
                continue;
            }

            const paramName = (prefix) ? prefix + '[' + property + ']' : property;

            if (Array.isArray(data[property])) {
                params.append(paramName, data[property].join(','));
            } else if (data[property] instanceof Object) {
                this.serializeData(data[property], params, paramName);
            } else {
                params.append(paramName, data[property].toString());
            }
        }
        return params;
    }
}