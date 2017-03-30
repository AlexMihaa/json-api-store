import { Resource } from '../../src/decorators/resource.decorator';
import { JsonApiModel } from '../../src/json-api.model';
import { Attribute } from '../../src/decorators/attribute.decorator';
import { User } from './user.model';

@Resource({type: 'user-roles'})
export class UserRole extends JsonApiModel {

    @Attribute()
    role: string;

    @Attribute()
    status: string = 'activation';

    constructor(user?: User, role?: string) {
        super();

        this.role = role;

        if (user && user.id && role) {
            this.id = user.id + '-' + role;
        }
    }
}
