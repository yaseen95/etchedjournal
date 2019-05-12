import { removeDuplicates } from './object-utils';

describe('removeDuplicates', () => {

    it('returns uniques - primitives', () => {
        const set = removeDuplicates([1, 2, 2, 2, 3]);
        expect(set).toEqual([1, 2, 3]);
    });

    it('returns uniques - objects', () => {
        const set1 = removeDuplicates([{ a: 1 }, { a: 1 }]);
        expect(set1).toEqual([{ a: 1 }]);

        const set2 = removeDuplicates([{ a: 1 }, { a: 1 }, { b: 'bar' }]);
        expect(set2).toEqual([{ a: 1 }, { b: 'bar' }]);
    });

    it('empty', () => {
        const set = removeDuplicates([]);
        expect(set).toEqual([]);
    });

    it('interface and objects are different', () => {
        interface Foo {
            foo: string
        }

        class Bar {
            public foo: string = 'bar';
        }

        const foo: Foo = { foo: 'bar' };
        const bar: Bar = new Bar();

        const set = removeDuplicates([foo, bar]);
        expect(set).toEqual([foo, bar]);
    });

    it('similar interface and objects but same of each is deduped', () => {
        interface Foo {
            foo: string
        }

        class Bar {
            public foo: string = 'bar';
        }

        const foo1: Foo = { foo: 'bar' };
        const foo2: Foo = { foo: 'bar' };
        const bar1: Bar = new Bar();
        const bar2: Bar = new Bar();

        const set = removeDuplicates([foo1, foo2, bar1, bar2]);
        expect(set).toEqual([foo1, bar1]);
    });
});
