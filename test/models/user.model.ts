import { Model } from '../../src/decorators/model';
import { Attribute } from '../../src/decorators/attribute';
import { JsonApiModel } from '../../src/json-api.model';
import { UserRole } from './user-role.model';
import { Relationship } from '../../src/decorators/relationship';
import { Office } from './office.model';

@Model({type: 'users'})
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