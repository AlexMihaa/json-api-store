
export interface AttributeSerializer {
    serialize(value: any): any;
    deserialize(value: any): any;
}