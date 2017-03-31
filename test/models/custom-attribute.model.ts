import { JsonApiModel } from '../../src/json-api.model';
import { Resource } from '../../src/decorators/resource.decorator';
import { AttributeSerializer } from '../../src/serializers/attribute.serializer';
import { Attribute } from '../../src/decorators/attribute.decorator';

export class NameSerializer implements AttributeSerializer {
    serialize(value: any): any {
        return value.toLowerCase();
    }

    unserialize(value: any): any {
        return value.toUpperCase();
    }
}

@Resource({type: 'custom-attributes'})
export class CustomAttributeResource extends JsonApiModel {

    @Attribute({serializer: new NameSerializer()})
    name: string;
}