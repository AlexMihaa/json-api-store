import { JsonApiModel } from '../../src/json-api.model';
import { Attribute } from '../../src/decorators/attribute';
import { Model } from '../../src/decorators/model';

@Model({type: 'permissions'})
export class Permission extends JsonApiModel {

    @Attribute()
    name: string;
}