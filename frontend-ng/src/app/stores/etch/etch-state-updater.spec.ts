import { AbstractEtch } from '../../models/etch/abstract-etch';
import { MultiMap } from '../../utils/multi-map';
import { TestUtils } from '../../utils/test-utils.spec';
import { EtchStateUpdater, State } from './etch-state-updater';
import { EtchesAndEntity } from './etch.store';
import createEtch = TestUtils.createEtch;
import createEtchEntity = TestUtils.createEtchEntity;

describe('EtchStateUpdater', () => {
    let state: State;

    beforeEach(() => {
        state = emptyState();
    });

    it('adds new entity if it does not exist', () => {
        expect(state.entities.length).toEqual(0);
        const update: EtchesAndEntity = {
            etches: [],
            entity: createEtchEntity({ id: 'etchId' }),
        };
        EtchStateUpdater.update(state, [update]);
        expect(state.entities).toEqual([createEtchEntity({ id: 'etchId' })]);
    });

    it('updates entity in place if it already exists', () => {
        state.entities = [createEtchEntity({ id: 'etchId', content: 'foobar' })];

        const update: EtchesAndEntity = {
            etches: [],
            entity: createEtchEntity({ id: 'etchId', content: 'foobarbaz' }),
        };
        EtchStateUpdater.update(state, [update]);

        expect(state.entities.length).toEqual(1);
        const expected = createEtchEntity({ id: 'etchId', content: 'foobarbaz' });
        expect(state.entities).toEqual([expected]);
    });

    it('updates etchesById when updating state', () => {
        const update: EtchesAndEntity = {
            etches: [createEtch('foo', 123), createEtch('bar', 500)],
            entity: createEtchEntity({ id: 'etchId' }),
        };
        EtchStateUpdater.update(state, [update]);
        expect(state.etchesById.size).toEqual(1);
        expect(state.etchesById.get('etchId')).toEqual(update.etches);
    });

    it('flattens list of etches correctly', () => {
        // An EntryEntity has multiple EtchEntity
        // Within a single EtchEntity multiple AbstractEtches may have been encrypted together
        // Ordering needs to be guaranteed.

        const etch1: EtchesAndEntity = {
            etches: [createEtch('foo', 123), createEtch('bar', 500)],
            entity: createEtchEntity({ id: 'etch1', entryId: 'entry' }),
        };
        const etch2: EtchesAndEntity = {
            etches: [createEtch('baz', 0)],
            entity: createEtchEntity({ id: 'etch2', entryId: 'entry' }),
        };
        EtchStateUpdater.update(state, [etch1, etch2]);

        expect(state.etchesByEntry.keys()).toEqual(['entry']);
        expect(state.etchesByEntry.size).toEqual(3);
        expect(state.etchesByEntry.get('entry')).toEqual([
            createEtch('foo', 123),
            createEtch('bar', 500),
            // Should not reorder by timestamp
            createEtch('baz', 0),
        ]);
    });

    it('updating etch with same content does nothing', () => {
        state.etchesByEntry.set('entry', createEtch('foo', 123));

        const etch: EtchesAndEntity = {
            etches: [createEtch('foo', 123), createEtch('bar', 500)],
            entity: createEtchEntity({ entryId: 'entry' }),
        };
        EtchStateUpdater.update(state, [etch]);

        expect(state.etchesByEntry.size).toEqual(2);
        expect(state.etchesByEntry.get('entry')).toEqual([
            createEtch('foo', 123),
            createEtch('bar', 500),
        ]);
    });

    it('updating etch with same values does nothing', () => {
        const etch: EtchesAndEntity = {
            etches: [createEtch('foo'), createEtch('foo'), createEtch('foo')],
            entity: createEtchEntity({ entryId: 'entryId' }),
        };
        EtchStateUpdater.update(state, [etch]);

        expect(state.etchesByEntry.size).toEqual(1);
        expect(state.etchesByEntry.get('entryId')).toEqual([createEtch('foo')]);
    });

    it('updating existing etch with same values does nothing', () => {
        state.etchesByEntry.set('entryId', createEtch('foo'));

        const etch: EtchesAndEntity = {
            // Foo already exists
            etches: [createEtch('foo'), createEtch('bar')],
            entity: createEtchEntity({ entryId: 'entryId' }),
        };
        EtchStateUpdater.update(state, [etch]);

        expect(state.etchesByEntry.size).toEqual(2);
        expect(state.etchesByEntry.get('entryId')).toEqual([createEtch('foo'), createEtch('bar')]);
    });

    function emptyState(): State {
        return {
            entities: [],
            etchesById: new Map<string, AbstractEtch[]>(),
            etchesByEntry: new MultiMap<string, AbstractEtch>(),
        };
    }
});
