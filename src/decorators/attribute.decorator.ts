import { ResourceMetadata } from '../metadata/resource.metadata';
import { METADATA_KEY, METADATA_PROPERTY } from './resource.decorator';
import { AttributeConfig } from './attribute.config';
import { AttributeMetadata } from '../metadata/attribute.metadata';
import { ResourceInstanceMetadata } from '../metadata/resource-instance.metadata';

export function Attribute(config?: AttributeConfig): PropertyDecorator {
    return function (target: any, propertyName: string) {
        if (!(Reflect as any).hasOwnMetadata(METADATA_KEY, target.constructor)) {
            (Reflect as any).defineMetadata(METADATA_KEY, new ResourceMetadata(), target.constructor);
        }

        const field = (config) ? config.field : null;
        const isArray = (config && config.isArray) ? config.isArray : false;

        const attribute = new AttributeMetadata(propertyName, isArray, field);
        attribute.serializer = (config) ? config.serializer : null;

        const metadata: ResourceMetadata = (Reflect as any).getOwnMetadata(METADATA_KEY, target.constructor);
        metadata.addAttribute(attribute);

        let getter = function() {
            if (!this[METADATA_PROPERTY]) {
                this[METADATA_PROPERTY] = new ResourceInstanceMetadata();
            }

            return (<ResourceInstanceMetadata>this[METADATA_PROPERTY]).getFieldValue(propertyName);
        };

        let setter = function(value: any) {
            if (!this[METADATA_PROPERTY]) {
                this[METADATA_PROPERTY] = new ResourceInstanceMetadata();
            }

            (<ResourceInstanceMetadata>this[METADATA_PROPERTY]).updateField(propertyName, value);
        };

        if (delete target[propertyName]) {
            Object.defineProperty(target, propertyName, {
                get: getter,
                set: setter,
                enumerable: true,
                configurable: true
            });
        }
    };
}