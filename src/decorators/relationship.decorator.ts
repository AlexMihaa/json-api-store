import { METADATA_KEY, METADATA_PROPERTY } from './resource.decorator';
import { ResourceMetadata } from '../metadata/resource.metadata';
import { RelationshipMetadata } from '../metadata/relationship.metadata';
import { RelationshipConfig } from './relationship.config';
import { ResourceInstanceMetadata } from '../metadata/resource-instance.metadata';

export function Relationship(config: RelationshipConfig): PropertyDecorator {
    return function (target: any, propertyName: string) {
        if (!(Reflect as any).hasOwnMetadata(METADATA_KEY, config.resource)) {
            throw new Error('Specified resource doesn\'t have JSON API metadata');
        }

        if (!(Reflect as any).hasOwnMetadata(METADATA_KEY, target.constructor)) {
            (Reflect as any).defineMetadata(METADATA_KEY, new ResourceMetadata(), target.constructor);
        }

        const relationship: RelationshipMetadata = new RelationshipMetadata(propertyName, (config.isArray), config.field);
        relationship.resource = config.resource;


        const metadata: ResourceMetadata = (Reflect as any).getOwnMetadata(METADATA_KEY, target.constructor);
        metadata.addRelationship(relationship);

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