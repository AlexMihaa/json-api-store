import { Model } from '../../src/decorators/model';
import { User } from './user.model';
import { Relationship } from '../../src/decorators/relationship';
import { Attribute } from '../../src/decorators/attribute';
import { JsonApiModel } from '../../src/json-api.model';
import { Office } from './office.model';

@Model({type: 'custom-fields-resources'})
export class CustomFieldsResource extends JsonApiModel {
    @Attribute({field: 'name'})
    title: string;

    @Relationship({resource: User, field: 'user'})
    customer: User;

    @Relationship({resource: Office, isArray: true})
    offices: Office[];
}