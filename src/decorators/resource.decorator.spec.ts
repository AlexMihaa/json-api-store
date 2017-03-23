import { Resource, METADATA_KEY } from './resource.decorator';
import { ResourceMetadata } from '../metadata/resource.metadata';
import { Attribute } from './attribute.decorator';
import { AttributeMetadata } from '../metadata/attribute.metadata';

describe('ResourceDecorator', () => {

    @Resource({type: 'parent'})
    class ParentResource {

        @Attribute()
        name: string;
    }

    @Resource()
    class ChildResource extends ParentResource {

        @Attribute()
        title: string;
    }

    @Resource({type: 'child'})
    class SecondChildResource extends ParentResource {

    }

    it('should add metadata', () => {
        expect((Reflect as any).hasOwnMetadata(METADATA_KEY, ParentResource)).toBeTruthy();

        const metadata: ResourceMetadata = (Reflect as any).getOwnMetadata(METADATA_KEY, ParentResource);
        expect(metadata instanceof ResourceMetadata).toBeTruthy();
        expect(metadata.type).toEqual('parent');
    });

    it('should merge metadata from parent class', () => {
        const metadata: ResourceMetadata = (Reflect as any).getOwnMetadata(METADATA_KEY, ChildResource);

        expect(metadata instanceof ResourceMetadata).toBeTruthy();
        expect(metadata.type).toEqual('parent');

        const childAttribute = metadata.getAttribute('title');
        expect(childAttribute instanceof AttributeMetadata).toBeTruthy();

        const parentAttribute = metadata.getAttribute('name');
        expect(parentAttribute instanceof AttributeMetadata).toBeTruthy();
    });

    it('should overwrite metadata from parent class', () => {
        const metadata: ResourceMetadata = (Reflect as any).getOwnMetadata(METADATA_KEY, SecondChildResource);

        expect(metadata instanceof ResourceMetadata).toBeTruthy();
        expect(metadata.type).toEqual('child');
    });
});
