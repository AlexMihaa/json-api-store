import { Resource, METADATA_KEY } from './resource.decorator';
import { Attribute } from './attribute.decorator';
import { AttributeMetadata } from '../metadata/attribute.metadata';
import { ResourceMetadata } from '../metadata/resource.metadata';
import { AttributeSerializer } from '../serializers/attribute.serializer';

describe('AttributeDecorator', () => {

    class DumbSerializer implements AttributeSerializer {
        serialize(value: any): any {
            return value;
        }

        unserialize(value: any): any {
            return value;
        }
    }

    @Resource({type: 'test'})
    class TestResource {

        @Attribute({field: 'firstName', serializer: new DumbSerializer()})
        name: string;


        @Attribute()
        test: boolean;
    }

    it('should add attribute metadata', () => {
        const metadata: ResourceMetadata = (Reflect as any).getOwnMetadata(METADATA_KEY, TestResource);
        const attrMetadata: AttributeMetadata = metadata.getAttribute('name');

        expect(attrMetadata instanceof AttributeMetadata).toBeTruthy();
        expect(attrMetadata.property).toEqual('name');
        expect(attrMetadata.field).toEqual('firstName');
        expect(attrMetadata.serializer instanceof DumbSerializer).toBeTruthy();
    });

    it('should remove original property', () => {
        const instance = new TestResource();

        expect(instance.hasOwnProperty('name')).toBeFalsy();
    });

    it('should provide getter and setter for original property', () => {
        const instance: any = new TestResource();
        instance.name = 'Test';
        instance.test = true;

        expect(instance.name).toEqual('Test');
        expect(instance.test).toEqual(true);
    });
});
