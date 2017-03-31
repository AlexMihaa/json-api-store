import { JsonApiResourceSerializer } from './resource.serializer';
import { JsonApiDocumentSerializer } from './document.serializer';
import { User } from '../../test/models/user.model';
import { ResourceMetadata } from '../metadata/resource.metadata';

describe('JsonApiDocumentSerializer', () => {

    let resSerializer: JsonApiResourceSerializer;
    let docSerializer: JsonApiDocumentSerializer;

    beforeEach(() => {
        resSerializer = new JsonApiResourceSerializer();
        docSerializer = new JsonApiDocumentSerializer(resSerializer);
    });

    it('should serialize single resource', () => {
        spyOn(resSerializer, 'serialize').and.callThrough();

        const metadata = ResourceMetadata.getClassMetadata(User);

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

        const metadata = ResourceMetadata.getClassMetadata(User);

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
});