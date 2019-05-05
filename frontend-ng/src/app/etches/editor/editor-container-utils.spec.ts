import { EntryV1 } from '../../models/entry/entry-v1';
import { FakeEntryStore } from '../../services/fakes.service.spec';
import { TestUtils } from '../../utils/test-utils.spec';
import { maybeUpdateTitle } from './editor-container-utils';
import createEntryEntity = TestUtils.createEntryEntity;

describe('editor-container-utils', () => {
    let store: FakeEntryStore;

    beforeEach(() => {
        store = new FakeEntryStore();
    });

    it('updates title when different', () => {
        const updateSpy = spyOn(store, 'updateEntry');

        const entryV1 = new EntryV1({ content: 'old title', created: 1 });
        const entity = createEntryEntity({ id: 'eId' });

        store.entities = [entity];
        store.entriesById.set('eId', entryV1);

        maybeUpdateTitle(store, 'eId', 'new title');

        const expectedEntryV1 = { ...entryV1, content: 'new title' };
        expect(updateSpy).toHaveBeenCalledTimes(1);
        expect(updateSpy).toHaveBeenCalledWith('eId', expectedEntryV1);
    });

    it('does not update title when it is the same', () => {
        const updateSpy = spyOn(store, 'updateEntry');

        const entryV1 = new EntryV1({ content: 'title', created: 1 });
        const entity = createEntryEntity({ id: 'eId' });

        store.entities = [entity];
        store.entriesById.set('eId', entryV1);

        maybeUpdateTitle(store, 'eId', 'title');
        expect(updateSpy).toHaveBeenCalledTimes(0);
    });
});
