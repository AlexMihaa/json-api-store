import { JsonApiResourceSerializer } from './resource';
import { JsonApiDocumentSerializer } from './document';
import { User } from '../../test/models/user.model';
import { ModelMetadata } from '../metadata/model';
import { ApiDocument } from '../contracts/api/document';
import { JsonApiDocument } from '../models/document';
import { SerializationContext } from './context';
import { ApiResource } from '../contracts/api/resource';

describe('JsonApiDocumentSerializer', () => {

    let resSerializer: JsonApiResourceSerializer;
    let docSerializer: JsonApiDocumentSerializer;

    beforeEach(() => {
        resSerializer = new JsonApiResourceSerializer();
        docSerializer = new JsonApiDocumentSerializer(resSerializer);
    });

    it('should serialize single resource', () => {
        spyOn(resSerializer, 'serialize').and.callThrough();

        const metadata = ModelMetadata.getClassMetadata(User);

        const user = new User();
        user.email = 'test@test.com';
        user.name = 'Test user';

        const doc = docSerializer.serialize(user);

        expect(resSerializer.serialize).toHaveBeenCalledWith(user, metadata);

        const expected = require('../../test/documents/create-user.json');

        expect(doc).toEqual(expected);
    });

    it('should serialize array of resources', () => {
        spyOn(resSerializer, 'serialize').and.callThrough();

        const metadata = ModelMetadata.getClassMetadata(User);

        const user1 = new User();
        user1.email = 'test1@test.com';
        user1.name = 'Test user 1';

        const user2 = new User();
        user2.email = 'test2@test.com';
        user2.name = 'Test user 2';

        const doc = docSerializer.serialize([user1, user2]);

        expect(resSerializer.serialize).toHaveBeenCalledWith(user1, metadata);
        expect(resSerializer.serialize).toHaveBeenCalledWith(user2, metadata);

        const expected = require('../../test/documents/create-users.json');

        expect(doc).toEqual(expected);
    });

    it('should deserialize response with single resource', () => {
        const data: ApiDocument = require('../../test/documents/user.json');
        const user = new User();

        spyOn(resSerializer, 'deserialize').and.callFake((item: any, resType: any, context: any) => {
            expect(item).toEqual(data.data);
            expect(resType).toEqual(User);
            expect(context instanceof SerializationContext).toBeTruthy();

            return user;
        });

        const doc = docSerializer.deserialize(data, User);

        expect(resSerializer.deserialize).toHaveBeenCalled();

        expect(doc instanceof JsonApiDocument).toBeTruthy();
        expect(doc.data).toEqual(user);
    });

    it('should deserialize response with several resources', () => {
        const data: ApiDocument = require('../../test/documents/users.json');
        const user1 = new User();
        const user2 = new User();

        let pass = 0;

        spyOn(resSerializer, 'deserialize').and.callFake((item: any, resType: any, context: any) => {
            pass++;

            const responseData: ApiResource[] = <ApiResource[]>data.data;
            const expectedItem: ApiResource = (1 === pass) ? responseData[0] : responseData[1];
            expect(item).toEqual(expectedItem);

            expect(resType).toEqual(User);
            expect(context instanceof SerializationContext).toBeTruthy();

            return (1 === pass) ? user1 : user2;
        });

        const doc = docSerializer.deserialize(data, User);

        expect(resSerializer.deserialize).toHaveBeenCalledTimes(2);

        expect(doc instanceof JsonApiDocument).toBeTruthy();

        const docData: User[] = <User[]>doc.data;
        expect(Array.isArray(docData)).toBeTruthy();
        expect(docData[0]).toEqual(user1);
        expect(docData[1]).toEqual(user2);

        expect(doc.meta).toEqual(data.meta);
    });

    it('should deserialize response with errors', () => {
        spyOn(resSerializer, 'deserialize');

        const data: ApiDocument = require('../../test/documents/errors-response.json');

        const doc = docSerializer.deserialize(data, User);

        expect((<any>resSerializer.deserialize).calls.count()).toEqual(0);
        expect(doc instanceof JsonApiDocument).toBeTruthy();
        expect(doc.errors).toEqual(data.errors);
    });
});