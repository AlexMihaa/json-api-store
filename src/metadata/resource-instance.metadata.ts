import { METADATA_KEY, METADATA_PROPERTY } from '../decorators/resource.decorator';

export class ResourceInstanceMetadata {
    private _isNew: boolean = true;
    private _fields: {[field: string]: {value: any, initial: any}} = {};

    get isNew(): boolean {
        return this._isNew;
    }

    get hasChanges(): boolean {
        for (let field in this._fields) {
            if (this.isChanged(field)) {
                return true;
            }
        }

        return false;
    }

    getFieldValue(field: string): any {
        if (!this._fields[field]) {
            return undefined;
        }

        return this._fields[field].value;
    }

    updateField(field: string, value: any): ResourceInstanceMetadata {
        if (!this._fields[field]) {
            this._fields[field] = {value: value, initial: undefined};
        } else {
            this._fields[field].value = value;
        }

        return this;
    }

    isChanged(field: string): boolean {
        if (!this._fields[field]) {
            return false;
        }

        const data = this._fields[field];

        if ((data.initial instanceof Array) && (data.value instanceof Array)) {
            return ResourceInstanceMetadata.compareArrays(data.initial, data.value);
        }

        if (data.value === data.initial) {
            if (ResourceInstanceMetadata.isResource(data.value)) {
                return ResourceInstanceMetadata.isResourceChanged(data.value);
            }

            return false;
        }

        return true;
    }

    flush(): ResourceInstanceMetadata {
        this._isNew = false;
        Object.keys(this._fields).forEach((field) => {
            if (this._fields[field].value instanceof Array) {
                this._fields[field].initial = this._fields[field].value.slice(0);
            } else {
                this._fields[field].initial = this._fields[field].value;
            }

            if (ResourceInstanceMetadata.isResource(this._fields[field].initial)) {
                ResourceInstanceMetadata.flushInstanceMetadata(this._fields[field].initial);
            } else if (this._fields[field].initial instanceof Array) {
                this._fields[field].initial.forEach((cur: any) => {
                    if (ResourceInstanceMetadata.isResource(cur)) {
                        ResourceInstanceMetadata.flushInstanceMetadata(cur);
                    }
                });
            }
        });

        return this;
    }

    private static compareArrays(initial: Array<any>, current: Array<any>): boolean {
        if (initial.length !== current.length) {
            return true;
        }

        let hasChanges: boolean = false;
        current.forEach((value) => {
            if ((initial.indexOf(value) === -1) ||
                (ResourceInstanceMetadata.isResource(value) && ResourceInstanceMetadata.isResourceChanged(value))
            ) {
                hasChanges = true;
            }
        });

        return hasChanges;
    }

    private static isResource(value: any): boolean {
        if ((!(value instanceof Object)) ||
            (!(Reflect as any).hasOwnMetadata(METADATA_KEY, Object.getPrototypeOf(value).constructor))
        ) {
            return false;
        }

        return true;
    }

    private static isResourceChanged(value: {[key: string]: any}): boolean {
        if (!value[METADATA_PROPERTY]) {
            return false;
        }

        return (<ResourceInstanceMetadata>value[METADATA_PROPERTY]).hasChanges;
    }

    private static flushInstanceMetadata(resource: {[key: string]: any}) {
        if (!resource[METADATA_PROPERTY]) {
            return;
        }

        (<ResourceInstanceMetadata>resource[METADATA_PROPERTY]).flush();
    }
}