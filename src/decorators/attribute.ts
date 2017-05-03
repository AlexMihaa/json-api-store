import { METADATA_KEY, METADATA_PROPERTY } from './model';
import { ModelMetadata, AttributeMetadata, ResourceMetadata } from '../metadata';
import { AttributeConfiguration } from '../contracts';

export function Attribute(config?: AttributeConfiguration): PropertyDecorator {
    return function (target: any, propertyName: string) {
        if (!(Reflect as any).hasOwnMetadata(METADATA_KEY, target.constructor)) {
            (Reflect as any).defineMetadata(METADATA_KEY, new ModelMetadata(), target.constructor);
        }

        const field = (config) ? config.field : null;

        const attribute = new AttributeMetadata(propertyName, field);
        attribute.serializer = (config) ? config.serializer : null;

        const metadata: ModelMetadata = (Reflect as any).getOwnMetadata(METADATA_KEY, target.constructor);
        metadata.addAttribute(attribute);

        let getter = function() {
            if (!this[METADATA_PROPERTY]) {
                this[METADATA_PROPERTY] = new ResourceMetadata();
            }

            return (<ResourceMetadata>this[METADATA_PROPERTY]).getFieldValue(propertyName);
        };

        let setter = function(value: any) {
            if (!this[METADATA_PROPERTY]) {
                this[METADATA_PROPERTY] = new ResourceMetadata();
            }

            (<ResourceMetadata>this[METADATA_PROPERTY]).updateField(propertyName, value);
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