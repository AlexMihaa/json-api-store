import { Model, METADATA_KEY } from './model';
import { ModelMetadata } from '../metadata/model';
import { Attribute } from './attribute';
import { AttributeMetadata } from '../metadata/attribute';

describe('Decorators', () => {
    describe('Model', () => {
        @Model({type: 'parent'})
        class ParentResource {

            @Attribute()
            name: string;
        }

        @Model({path: '/test-children'})
        class ChildResource extends ParentResource {

            @Attribute()
            title: string;
        }

        @Model({type: 'child'})
        class SecondChildResource extends ParentResource {

        }

        it('should add metadata', () => {
            expect((Reflect as any).hasOwnMetadata(METADATA_KEY, ParentResource)).toBeTruthy();

            const metadata: ModelMetadata = (Reflect as any).getOwnMetadata(METADATA_KEY, ParentResource);
            expect(metadata instanceof ModelMetadata).toBeTruthy();
            expect(metadata.type).toEqual('parent');
            expect(metadata.path).toBeUndefined();
        });

        it('should merge metadata from parent class', () => {
            const metadata: ModelMetadata = (Reflect as any).getOwnMetadata(METADATA_KEY, ChildResource);

            expect(metadata instanceof ModelMetadata).toBeTruthy();
            expect(metadata.type).toEqual('parent');
            expect(metadata.path).toEqual('/test-children');

            const childAttribute = metadata.getAttribute('title');
            expect(childAttribute instanceof AttributeMetadata).toBeTruthy();

            const parentAttribute = metadata.getAttribute('name');
            expect(parentAttribute instanceof AttributeMetadata).toBeTruthy();
        });

        it('should overwrite metadata from parent class', () => {
            const metadata: ModelMetadata = (Reflect as any).getOwnMetadata(METADATA_KEY, SecondChildResource);

            expect(metadata instanceof ModelMetadata).toBeTruthy();
            expect(metadata.type).toEqual('child');
            expect(metadata.path).toBeUndefined();
        });
    });
});
