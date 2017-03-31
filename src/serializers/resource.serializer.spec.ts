import { Office } from '../../test/models/office.model';
import { JsonApiResourceSerializer } from './resource.serializer';
import { ResourceMetadata } from '../metadata/resource.metadata';
import { User } from '../../test/models/user.model';
import { UserRole } from '../../test/models/user-role.model';
import { CustomFieldsResource } from '../../test/models/custom-fields.model';
import { ResourceInstanceMetadata } from '../metadata/resource-instance.metadata';

import { JsonApiResource } from '../contracts/resource.interface';
import { JsonApiDocument } from '../contracts/document.interface';
import { JsonApiSerializationContext } from './serialization.context';
import { CustomAttributeResource } from '../../test/models/custom-attribute.model';
import { CorruptedResource } from '../../test/models/corrupted.model';
import { Post } from '../../test/models/post.model';

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

    it('should serialize resources with existing relationships', () => {
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
        const modelMetadata = ResourceMetadata.getClassMetadata(CustomAttributeResource);
        const attrSerializer = modelMetadata.getAttribute('name').serializer;

        spyOn(attrSerializer, 'serialize').and.callThrough();

        const resource = new CustomAttributeResource();
        resource.name = 'TEST';

        const payload = serializer.serialize(resource, modelMetadata);

        expect(attrSerializer.serialize).toHaveBeenCalledWith(resource.name);

        const expected = require('../../test/payloads/custom-attribute.json');

        expect(payload).toEqual(expected);
    });

    it('should serialize resources with custom field name', () => {
        user.id = 'test';
        ResourceInstanceMetadata.flushMetadata(user);

        const obj = new CustomFieldsResource();
        obj.title = 'test';
        obj.customer = user;

        const payload: JsonApiResource = serializer.serialize(
            obj,
            ResourceMetadata.getClassMetadata(CustomFieldsResource)
        );

        const expected = require('../../test/payloads/custom-fields.json');

        expect(payload).toEqual(expected);
    });

    it('should deserialize resource', () => {
        const doc: JsonApiDocument = require('../../test/documents/user.json');
        const context = new JsonApiSerializationContext(doc.included);

        const parsed = serializer.deserialize(<JsonApiResource>doc.data, User, context);

        expect(parsed instanceof User).toBeTruthy();
        expect(parsed.id).toEqual("1");
        expect(parsed.email).toEqual("test@test.com");
        expect(parsed.name).toEqual("Test User");

        expect(parsed.office instanceof Office).toBeTruthy();
        const office: Office = parsed.office;
        expect(office.id).toEqual("1");
        expect(office.title).toEqual("Test office");
        expect(office.address).toEqual("Test address");

        expect(Array.isArray(parsed.roles)).toBeTruthy();
        expect(parsed.roles.length).toEqual(2);

        parsed.roles.forEach((userRole: UserRole) => {
            expect(userRole instanceof UserRole).toBeTruthy();
            expect(userRole.status).toEqual('active');

            const expectedRole = ('1-advertiser' === userRole.id) ? 'advertiser' : 'publisher';
            expect(userRole.role).toEqual(expectedRole);
        });
    });

    it('should deserialize resource with sparse fieldset', () => {
        const doc: JsonApiDocument = require('../../test/documents/user-sparse-fieldset.json');
        const context = new JsonApiSerializationContext(doc.included);

        const parsed = serializer.deserialize(<JsonApiResource>doc.data, User, context);

        expect(parsed instanceof User).toBeTruthy();
        expect(parsed.id).toEqual("1");
        expect(parsed.email).toEqual("test@test.com");
        expect(parsed.name).toBeUndefined();

        expect(parsed.office).toBeNull();

        expect(Array.isArray(parsed.roles)).toBeTruthy();
        expect(parsed.roles.length).toEqual(2);

        parsed.roles.forEach((userRole: UserRole) => {
            expect(userRole instanceof UserRole).toBeTruthy();
        });
    });

    it('should deserialize resources with custom field name', () => {
        const doc: JsonApiDocument = require('../../test/documents/custom-fields.json');
        const context = new JsonApiSerializationContext(doc.included);

        const parsed = serializer.deserialize(<JsonApiResource>doc.data, CustomFieldsResource, context);

        expect(parsed instanceof CustomFieldsResource).toBeTruthy();
        expect(parsed.id).toEqual('test');
        expect(parsed.title).toEqual('test');
        expect(parsed.customer instanceof User).toBeTruthy();
        expect(parsed.customer.id).toEqual('test');
    });

    it('should deserialize resources with custom attribute serializers', () => {
        const modelMetadata = ResourceMetadata.getClassMetadata(CustomAttributeResource);
        const attrSerializer = modelMetadata.getAttribute('name').serializer;

        spyOn(attrSerializer, 'unserialize').and.callThrough();

        const doc: JsonApiDocument = require('../../test/documents/custom-attribute.json');
        const context = new JsonApiSerializationContext(doc.included);

        const parsed = serializer.deserialize(<JsonApiResource>doc.data, CustomAttributeResource, context);

        expect(attrSerializer.unserialize).toHaveBeenCalledWith('test');

        expect(parsed instanceof CustomAttributeResource).toBeTruthy();
        expect(parsed.id).toEqual('1');
        expect(parsed.name).toEqual('TEST');
    });

    it('should deserialize resources with corrupted relationships', () => {
        const doc: JsonApiDocument = require('../../test/documents/corrupted.json');
        const context = new JsonApiSerializationContext(doc.included);

        const parsed = serializer.deserialize(<JsonApiResource>doc.data, CorruptedResource, context);

        expect(parsed instanceof CorruptedResource).toBeTruthy();
        expect(parsed.id).toEqual('test');
        expect(parsed.owner).toBeNull();
        expect(parsed.admin).toBeNull();
        expect(parsed.offices).toEqual([]);
        expect(parsed.permissions).toEqual([]);
    });

    it('should deserialize resource and reuse the same objects for relationships', () => {
        const doc: JsonApiDocument = require('../../test/documents/post.json');
        const context = new JsonApiSerializationContext(doc.included);

        const parsed = serializer.deserialize(<JsonApiResource>doc.data, Post, context);

        expect(parsed instanceof Post).toBeTruthy();
        expect(parsed.author instanceof User).toBeTruthy();
        expect(parsed.moderator instanceof User).toBeTruthy();
        expect(parsed.author).toBe(parsed.moderator);
    });
});