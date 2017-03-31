import { Model } from '../../src/decorators/model';
import { JsonApiModel } from '../../src/json-api.model';
import { Attribute } from '../../src/decorators/attribute';
import { User } from './user.model';

@Model({type: 'user-roles'})
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
