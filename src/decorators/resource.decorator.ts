import { ResourceConfig } from './resource.config';
import { ResourceMetadata } from '../metadata/resource.metadata';

export const METADATA_KEY = 'JsonApiModel';
export const METADATA_PROPERTY = '__apiMetadata';

export function Resource(config?: ResourceConfig): ClassDecorator {
    return function (target: Function) {
        if (!(Reflect as any).hasOwnMetadata(METADATA_KEY, target)) {
            (Reflect as any).defineMetadata(METADATA_KEY, new ResourceMetadata(), target);
        }

        const metadata: ResourceMetadata = (Reflect as any).getOwnMetadata(METADATA_KEY, target);

        const parentTarget = Object.getPrototypeOf(target.prototype).constructor;
        if ((Reflect as any).hasMetadata(METADATA_KEY, parentTarget)) {
            const parentMetadata: ResourceMetadata = (Reflect as any).getMetadata(METADATA_KEY, parentTarget);

            metadata.type = parentMetadata.type;
            metadata
                .addAttributes(parentMetadata.getAttributes())
                .addRelationships(parentMetadata.getRelationships());
        }

        if (config) {
            metadata.type = (config.type) = config.type;
        }

        if (!metadata.type) {
            throw Error('JSON API resource type not specified');
        }

        (Reflect as any).defineMetadata(METADATA_KEY, metadata, target);
    };
}