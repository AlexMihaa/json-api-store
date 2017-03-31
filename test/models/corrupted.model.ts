import { JsonApiModel } from '../../src/json-api.model';
import { Resource } from '../../src/decorators/resource.decorator';
import { User } from './user.model';
import { Relationship } from '../../src/decorators/relationship.decorator';
import { Administrator } from './administrator.model';
import { Office } from './office.model';
import { Permission } from './permission.model';

@Resource({type: 'corrupted'})
export class CorruptedResource extends JsonApiModel {

    @Relationship({resource: User})
    owner: User;

    @Relationship({resource: Administrator})
    admin: Administrator;

    @Relationship({resource: Office, isArray: true})
    offices: Office[];

    @Relationship({resource: Permission, isArray: true})
    permissions: Permission[];
}