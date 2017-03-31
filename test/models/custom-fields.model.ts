import { Resource } from '../../src/decorators/resource.decorator';
import { User } from './user.model';
import { Relationship } from '../../src/decorators/relationship.decorator';
import { Attribute } from '../../src/decorators/attribute.decorator';
import { JsonApiModel } from '../../src/json-api.model';
import { Office } from './office.model';

@Resource({type: 'custom-fields-resources'})
export class CustomFieldsResource extends JsonApiModel {
    @Attribute({field: 'name'})
    title: string;

    @Relationship({resource: User, field: 'user'})
    customer: User;

    @Relationship({resource: Office, isArray: true})
    offices: Office[];
}