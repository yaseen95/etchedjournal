export class MultiMap<K, V> {
    private sizeInternal = 0;
    private data = new Map<K, V[]>();

    constructor() {
    }

    // TODO Should we return a `ReadonlyArray` or a copy
    get(key: K): Array<V> {
        let values = this.data.get(key);
        if (values === null || values === undefined) {
            return [];
        }
        // return a copy
        return [...values];
    }

    set(key: K, value: V) {
        const values = this.get(key);
        values.push(value);
        this.sizeInternal++;
        this.data.set(key, values);
    }

    setMany(key: K, values: V[]) {
        const existing = this.get(key);
        existing.push(...values);
        this.sizeInternal += values.length;
        this.data.set(key, existing);
    }

    keys(): Array<K> {
        return Array.from(this.data.keys());
    }

    public get size() {
        return this.sizeInternal;
    }

    public static of<K, V>(key: K, values: V[]): MultiMap<K, V> {
        const map = new MultiMap<K, V>();
        map.setMany(key, values);
        return map;
    }
}
