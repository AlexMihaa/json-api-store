import { JsonApiModel } from '../../src/json-api.model';
import { Resource } from '../../src/decorators/resource.decorator';
import { Attribute } from '../../src/decorators/attribute.decorator';

@Resource({type: 'offices'})
export class Office extends JsonApiModel {

    @Attribute()
    title: string;

    @Attribute()
    address: string;
}