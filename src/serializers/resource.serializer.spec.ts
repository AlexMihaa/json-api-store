import { Office } from '../../test/models/office.model';
import { JsonApiResourceSerializer } from './resource.serializer';
import { ResourceMetadata } from '../metadata/resource.metadata';
import { User } from '../../test/models/user.model';
import { UserRole } from '../../test/models/user-role.model';
import { ResourceInstanceMetadata } from '../metadata/resource-instance.metadata';

import { Resource, Attribute, Relationship } from '../decorators';
import { JsonApiResource } from '../contracts/resource';

describe('JsonApiResourceSerializer', () => {
    const metadata = ResourceMetadata.getClassMetadata(User);

    let serializer: JsonApiResourceSerializer;
    let user: User;

    beforeEach(() => {
        serializer = new JsonApiResourceSerializer();

        user = new User();
        user.email = 'test@test.com';
        user.name = 'Test User';

        const advRole = new UserRole(user, 'advertiser');
        const pubRole = new UserRole(user, 'publisher');

        user.roles = [advRole, pubRole];

        const office = new Office();
        office.title = 'Test office';
        office.address = 'Test address';
        user.office = office;
    });

    it('should serialize resource as identifier', () => {
        const office = new Office();
        office.id = 'test';
        office.title = 'Test office';
        office.address = 'Test address';

        const officeMetadata = ResourceMetadata.getClassMetadata(Office);

        const expectedResult = {type: 'offices', id: 'test'};

        expect(serializer.serializeAsId(office, officeMetadata)).toEqual(expectedResult);
    });

    it('should serialize new resources', () => {
        const result: any = serializer.serialize(user, metadata);

        const expected = require('../../test/payloads/new-user.json');

        expect(result).toEqual(expected);
    });

    it('should serialize updated resources', () => {
        user.id = 'test';
        ResourceInstanceMetadata.flushMetadata(user);

        user.email = 'test2@test.com';

        const payload = serializer.serialize(user, metadata);

        const expected = require('../../test/payloads/updated-user.json');

        expect(payload).toEqual(expected);
    });

    it('should serialize resources without changes', () => {
        user.id = 'test';
        ResourceInstanceMetadata.flushMetadata(user);

        const payload = serializer.serialize(user, metadata);

        const expected = require('../../test/payloads/user-without-changes.json');

        expect(payload).toEqual(expected);
    });

    it('should serialize new empty resources', () => {
        const testUser = new User();
        const payload = serializer.serialize(testUser, metadata);

        const expected = require('../../test/payloads/empty-user.json');

        expect(payload).toEqual(expected);
    });

    it('should serialize resources existing relationships', () => {
        const office = new Office();
        office.id = 'test';
        ResourceInstanceMetadata.flushMetadata(office);

        const newUser = new User();
        newUser.office = office;

        const payload = serializer.serialize(newUser, metadata);

        const expected = require('../../test/payloads/user-with-existing-office.json');

        expect(payload).toEqual(expected);
    });

    it('should serialize resources with custom attribute serializers', () => {
        const attrSerializer: any = jasmine.createSpyObj('attrSerializer', ['serialize']);
        attrSerializer.serialize.and.returnValue('test');

        @Resource({type: 'custom-attributes'})
        class CustomAttributeResource {

            @Attribute({serializer: attrSerializer})
            name: string;
        }

        const obj = new CustomAttributeResource();
        obj.name = 'custom';

        const resource: JsonApiResource = serializer.serialize(
            obj,
            ResourceMetadata.getClassMetadata(CustomAttributeResource)
        );

        expect(attrSerializer.serialize).toHaveBeenCalledWith('custom');
        expect(resource.attributes.name).toEqual('test');
    });

    it('should serialize resources with custom field name', () => {
        @Resource({type: 'related-resources'})
        class RelatedResource {

        }

        @Resource({type: 'custom-fields-resource'})
        class CustomFieldsResource {
            @Attribute({field: 'title'})
            name: string;

            @Relationship({resource: RelatedResource, isArray: true, field: 'custom'})
            related: RelatedResource[];
        }

        const obj = new CustomFieldsResource();
        const resource: JsonApiResource = serializer.serialize(
            obj,
            ResourceMetadata.getClassMetadata(CustomFieldsResource)
        );

        expect(resource.attributes).toBeDefined();
        expect(resource.attributes.name).toBeUndefined();
        expect(resource.attributes.title).toBeNull();

        expect(resource.relationships).toBeDefined();
        expect(resource.relationships.related).toBeUndefined();
        expect(resource.relationships.custom).toBeDefined();
        expect(resource.relationships.custom.data).toEqual([]);
    });
});