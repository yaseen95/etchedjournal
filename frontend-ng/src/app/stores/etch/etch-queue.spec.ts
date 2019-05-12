import { fakeAsync, tick } from '@angular/core/testing';
import { AbstractEtch } from '../../models/etch/abstract-etch';
import { MultiMap } from '../../utils/multi-map';
import { TestUtils } from '../../utils/test-utils.spec';
import { EtchQueue } from './etch-queue';
import createEtch = TestUtils.createEtch;

describe('EtchQueue', () => {
    it('broadcasts queued etches every five seconds', fakeAsync(() => {
        const queue = new EtchQueue();
        const emitted = [];
        queue.queueObs.subscribe(val => emitted.push(val));

        queue.put('entryId', [createEtch('content')]);
        tick(5000);

        expect(emitted.length).toEqual(1);
        const expected = new MultiMap<string, AbstractEtch>();
        expected.set('entryId', createEtch('content'));
        expect(emitted[0]).toEqual(expected);

        queue.subscription.unsubscribe();
    }));

    it('does not rebroadcast already broadcasted things', fakeAsync(() => {
        const queue = new EtchQueue();
        const emitted = [];
        queue.queueObs.subscribe(val => emitted.push(val));

        queue.put('entry1', [createEtch('foo')]);
        tick(5000);

        queue.put('entry2', [createEtch('bar')]);
        tick(5000);

        expect(emitted.length).toEqual(2);

        const expected1 = MultiMap.of('entry1', [createEtch('foo')]);
        const expected2 = MultiMap.of('entry2', [createEtch('bar')]);
        expect(emitted).toEqual([expected1, expected2]);

        queue.subscription.unsubscribe();
    }));

    it('does not broadcast when nothing has been queued', fakeAsync(() => {
        const queue = new EtchQueue();
        const broadcasted = [];
        queue.queueObs.subscribe(val => broadcasted.push(val));

        tick(5000);
        expect(broadcasted).toEqual([]);
        tick(20000);
        expect(broadcasted).toEqual([]);

        queue.subscription.unsubscribe();
    }));

    it('broadcasts only after things have been queued', fakeAsync(() => {
        const queue = new EtchQueue();
        const broadcasted = [];
        queue.queueObs.subscribe(val => broadcasted.push(val));

        tick(20000);
        expect(broadcasted).toEqual([]);
        queue.put('entry1', [createEtch('content')]);
        tick(5000);

        expect(broadcasted.length).toEqual(1);
        const expected = MultiMap.of('entry1', [createEtch('content')]);
        expect(broadcasted).toEqual([expected]);

        queue.subscription.unsubscribe();
    }));

    it('stops broadcasting if nothing else is queued', fakeAsync(() => {
        const queue = new EtchQueue();
        const broadcasted = [];
        queue.queueObs.subscribe(val => broadcasted.push(val));

        queue.put('entry1', [createEtch('content')]);
        tick(5000);
        expect(broadcasted.length).toEqual(1);
        tick(20000);
        // Nothing else should have been broadcasted between ticks
        expect(broadcasted.length).toEqual(1);

        queue.subscription.unsubscribe();
    }));
});
