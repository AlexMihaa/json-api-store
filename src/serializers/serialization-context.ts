export class SerializationContext {
    private serialized = new Set();

    isSerialized(item: Object): boolean {
        return this.serialized.has(item);
    }

    markSerialized(item: Object): void {
        this.serialized.add(item);
    }
}
