import { Resource } from '../../src/decorators/resource.decorator';
import { Attribute } from '../../src/decorators/attribute.decorator';
import { JsonApiModel } from '../../src/json-api.model';
import { UserRole } from './user-role.model';
import { Relationship } from '../../src/decorators/relationship.decorator';
import { Office } from './office.model';

@Resource({type: 'users'})
export class User extends JsonApiModel {

    @Attribute()
    email: string;

    @Attribute()
    name: string;

    @Relationship({resource: Office})
    office: Office = null;

    @Relationship({resource: UserRole, isArray: true})
    roles: UserRole[] = [];
}