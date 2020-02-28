import { SerializationContext } from './context';

describe('SerializationContext', () => {
    let user: any;
    let context: SerializationContext;

    beforeEach(() => {
        user = {type: 'users', id: 'test', name: 'Test User'};
        context = new SerializationContext([
            user,
            {id: 'invalid'},
            {type: 'invalid'}
        ]);
    });

    it('should store resources', () => {
        expect(context.hasResource('test', 'test')).toBeFalsy();

        const resource = {type: 'test', id: 'test', name: 'Test resource'};
        context.addResource(resource.type, resource);

        expect(context.hasResource(resource.type, resource.id)).toBeTruthy();
        expect(context.getResource(resource.type, resource.id)).toBe(resource);
    });

    it('should store linked data', () => {
        expect(context.hasLinkedData(user.type, user.id)).toBeTruthy();
        expect(context.getLinkedData(user.type, user.id)).toBe(user);
    });
});
