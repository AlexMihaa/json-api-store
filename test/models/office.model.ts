import { JsonApiResource, Model, Attribute } from '../../src';

@Model({type: 'offices'})
export class Office extends JsonApiResource {

    @Attribute()
    title: string;

    @Attribute()
    address: string;
}