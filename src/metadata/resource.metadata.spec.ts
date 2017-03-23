import { ResourceMetadata } from './resource.metadata';
import { AttributeMetadata } from './attribute.metadata';

describe('ResourceMetadata', () => {
    let metadata: ResourceMetadata;

    beforeEach(() => {
        metadata = new ResourceMetadata();
    });

    it('should add attributes', () => {
        const attr1 = new AttributeMetadata('test1');
        const attr2 = new AttributeMetadata('test2');

        metadata
            .addAttribute(attr1)
            .addAttribute(attr2);

        expect(metadata.getAttributes()).toEqual([attr1, attr2]);
    });

    it('should return specified attribute', () => {
        const attr = new AttributeMetadata('test');

        metadata.addAttribute(attr);

        expect(metadata.getAttribute('test')).toEqual(attr);
    });
});
