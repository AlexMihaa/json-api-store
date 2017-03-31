import { JsonApiModel } from '../../src/json-api.model';
import { Model } from '../../src/decorators/model';
import { Attribute } from '../../src/decorators/attribute';

@Model({type: 'offices'})
export class Office extends JsonApiModel {

    @Attribute()
    title: string;

    @Attribute()
    address: string;
}