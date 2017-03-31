import { JsonApiModel } from '../../src/json-api.model';
import { Model } from '../../src/decorators/model';
import { AttributeSerializer } from '../../src/contracts/serializers/attribute';
import { Attribute } from '../../src/decorators/attribute';

export class NameSerializer implements AttributeSerializer {
    serialize(value: any): any {
        return value.toLowerCase();
    }

    deserialize(value: any): any {
        return value.toUpperCase();
    }
}

@Model({type: 'custom-attributes'})
export class CustomAttributeResource extends JsonApiModel {

    @Attribute({serializer: new NameSerializer()})
    name: string;
}