import { JsonApiModel } from '../../src/json-api.model';
import { Model } from '../../src/decorators/model';
import { User } from './user.model';
import { Relationship } from '../../src/decorators/relationship';
import { Administrator } from './administrator.model';
import { Office } from './office.model';
import { Permission } from './permission.model';

@Model({type: 'corrupted'})
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