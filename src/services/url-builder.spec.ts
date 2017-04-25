import { JsonApiUrlBuilder } from './url-builder';
import { User } from '../../test/models/user.model';
import { Office } from '../../test/models/office.model';

describe('Services', () => {
    describe('JsonApiUrlBuilder', () => {
        let builder: JsonApiUrlBuilder;

        beforeEach(() => {
            builder = new JsonApiUrlBuilder('http://localhost/api/v1');
        });

        it('should build URL for resource list', () => {
            const url = builder.getResourceListUrl(User);

            expect(url).toEqual('http://localhost/api/v1/users');
        });

        it('should build URL for single resource', () => {
            const url = builder.getResourceUrl(User, '123');

            expect(url).toEqual('http://localhost/api/v1/users/123');
        });

        it('should use path from resource metadata', () => {
            const url = builder.getResourceUrl(Office, '123');
            const listUrl = builder.getResourceListUrl(Office);

            expect(url).toEqual('http://localhost/api/v1/buildings/123');
            expect(listUrl).toEqual('http://localhost/api/v1/buildings');
        });
    });
});