import { MultiMap } from './multi-map';

describe('MultiMap', () => {

    it('multiple mappings for same key', () => {
        const data = new MultiMap<string, string>();
        data.set('a', 'a');
        data.set('a', 'ab');
        data.set('a', 'abc');
        data.set('b', 'b');

        const aValues = data.get('a');
        const bValues = data.get('b');
        expect(aValues).toEqual(['a', 'ab', 'abc']);
        expect(bValues).toEqual(['b']);
        expect(data.size).toEqual(4);
    });

    it('key does not exist', () => {
        const data = new MultiMap<string, string>();
        data.set('a', 'a');
        expect(data.get('b')).toEqual([]);
    });

    it('updating returned list does not update underlying collection', () => {
        const map = new MultiMap<string, string>();
        map.set('a', 'a');
        let aValues = map.get('a');
        aValues.push('ab');
        aValues = map.get('a');
        expect(aValues).toEqual(['a']);
    });

    it('empty map has size 0', () => {
        const map = new MultiMap<string, string>();
        expect(map.size).toEqual(0);
    });

    it('non-existent key returns empty list', () => {
        const map = new MultiMap<string, string>();
        expect(map.get('b')).toEqual([]);
    });

    it('putting single values', () => {
        const map = new MultiMap<string, string>();
        map.set('a', 'a');
        map.set('b', 'b');
        map.set('c', 'c');
        expect(map.get('a')).toEqual(['a']);
        expect(map.get('b')).toEqual(['b']);
        expect(map.get('c')).toEqual(['c']);
    });

    it('setMany increases count correctly', () => {
        const map = new MultiMap<string, number>();
        map.setMany('key', [1, 2]);
        expect(map.size).toEqual(2);
    });

    it('of() instantiates map', () => {
       const map: MultiMap<string, number> = MultiMap.of('key', [1, 2, 3]);
       expect(map.get('key')).toEqual([1, 2, 3]);
       expect(map.size).toEqual(3);
    });
});
