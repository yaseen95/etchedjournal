export class MultiMap<K, V> {
    private sizeInternal = 0;
    private data = new Map<K, V[]>();

    public static of<K, V>(key: K, values: V[]): MultiMap<K, V> {
        const map = new MultiMap<K, V>();
        map.setMany(key, values);
        return map;
    }

    // TODO Should we return a `ReadonlyArray` or a copy
    public get(key: K): V[] {
        const values = this.data.get(key);
        if (values === null || values === undefined) {
            return [];
        }
        // return a copy
        return [...values];
    }

    public set(key: K, value: V) {
        const values = this.get(key);
        values.push(value);
        this.sizeInternal++;
        this.data.set(key, values);
    }

    public setMany(key: K, values: V[]) {
        const existing = this.get(key);
        existing.push(...values);
        this.sizeInternal += values.length;
        this.data.set(key, existing);
    }

    public keys(): K[] {
        return Array.from(this.data.keys());
    }

    public get size() {
        return this.sizeInternal;
    }
}
