import { User } from './user.model';
import { Resource } from '../../src/decorators/resource.decorator';
import { Permission } from './permission.model';
import { Relationship } from '../../src/decorators/relationship.decorator';
import { Attribute } from '../../src/decorators/attribute.decorator';

@Resource()
export class Administrator extends User {

    @Attribute({field: 'public'})
    isPublic: boolean;

    @Relationship({resource: Permission, isArray: true})
    permissions: Permission[] = [];
}