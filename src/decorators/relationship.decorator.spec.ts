import { Resource, METADATA_KEY } from './resource.decorator';
import { Attribute } from './attribute.decorator';
import { Relationship } from './relationship.decorator';
import { RelationshipMetadata } from '../metadata/relationship.metadata';
import { ResourceMetadata } from '../metadata/resource.metadata';

describe('RelationshipDecorator', () => {

    @Resource({type: 'menu-items'})
    class MenuItem {

        @Attribute()
        title: string;
    }

    @Resource({type: 'users'})
    class User {

        @Attribute()
        name: string;
    }

    @Resource({type: 'menus'})
    class Menu {

        @Relationship({resource: User})
        creator: User;

        @Relationship({field: 'menuItems', resource: MenuItem, isArray: true})
        items: MenuItem[];
    }

    it('should provide relationship metadata', () => {
        const metadata: ResourceMetadata = (Reflect as any).getOwnMetadata(METADATA_KEY, Menu);

        const creatorMetadata = metadata.getRelationship('creator');
        expect(creatorMetadata instanceof RelationshipMetadata).toBeTruthy();
        expect(creatorMetadata.property).toEqual('creator');
        expect(creatorMetadata.field).toBeUndefined();
        expect(creatorMetadata.isArray).toBeFalsy();
        expect(creatorMetadata.resource).toEqual(User);

        const itemsMetadata = metadata.getRelationship('items');
        expect(itemsMetadata instanceof RelationshipMetadata).toBeTruthy();
        expect(itemsMetadata.property).toEqual('items');
        expect(itemsMetadata.field).toEqual('menuItems');
        expect(itemsMetadata.isArray).toBeTruthy();
        expect(itemsMetadata.resource).toEqual(MenuItem);
    });

    it('should remove original property', () => {
        const menu = new Menu();

        expect(menu.hasOwnProperty('creator')).toBeFalsy();
        expect(menu.hasOwnProperty('items')).toBeFalsy();
    });

    it('should provide getter and setter for original property', () => {
        const menu = new Menu();

        expect(menu.creator).toBeUndefined();
        expect(menu.items).toBeUndefined();

        const user = new User();
        menu.creator = user;

        expect(menu.creator).toEqual(user);

        const menuItems = [new MenuItem(), new MenuItem()];
        menu.items = menuItems;

        expect(menu.items).toEqual(menuItems);
    });
});
