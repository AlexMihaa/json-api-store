export class SerializationContext {
    private resources: {[key: string]: {[key: string]: any}} = {};
    private linked: {[key: string]: {[key: string]: any}} = {};

    constructor(linkedData: Array<any> = []) {
        this.parseLinkedData(linkedData);
    }

    hasResource(type: string, id: string): boolean {
        return !!this.resources[type] && !!this.resources[type][id];
    }

    addResource(type: string, id: string, resource: any) {
        if (!this.resources[type]) {
            this.resources[type] = {};
        }

        this.resources[type][id] = resource;
    }

    getResource(type: string, id: string): any {
        return this.resources[type][id];
    }

    hasLinkedData(type: string, id: string): boolean {
        return !!this.linked[type] && !!this.linked[type][id];
    }

    getLinkedData(type: string, id: string): any {
        return this.linked[type][id];
    }

    private parseLinkedData(data: Array<any>) {
        data.forEach((item: any) => {
            if (!item.type || !item.id) {
                return;
            }

            if (!this.linked[item.type]) {
                this.linked[item.type] = {};
            }

            this.linked[item.type][item.id] = item;
        });
    }
}