import { JsonApiModel } from '../../src/json-api.model';
import { User } from './user.model';
import { Relationship } from '../../src/decorators/relationship.decorator';
import { Resource } from '../../src/decorators/resource.decorator';

@Resource({type: 'posts'})
export class Post extends JsonApiModel {

    @Relationship({resource: User})
    author: User;

    @Relationship({resource: User})
    moderator: User;
}