import { JsonApiModel } from '../../src/json-api.model';
import { Attribute } from '../../src/decorators/attribute.decorator';

@Resource({type: 'permissions'})
export class Permission extends JsonApiModel {

    @Attribute()
    name: string;
}