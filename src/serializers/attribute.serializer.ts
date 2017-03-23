
export interface AttributeSerializer {
    serialize(value: any): any;
    unserialize(value: any): any;
}