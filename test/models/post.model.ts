import { JsonApiModel } from '../../src/json-api.model';
import { User } from './user.model';
import { Relationship } from '../../src/decorators/relationship';
import { Model } from '../../src/decorators/model';

@Model({type: 'posts'})
export class Post extends JsonApiModel {

    @Relationship({resource: User})
    author: User;

    @Relationship({resource: User})
    moderator: User;
}